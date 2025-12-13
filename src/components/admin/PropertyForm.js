'use client';

import { useState, useRef, useEffect } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import dynamic from 'next/dynamic';

// Dynamically import map component to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import('./LocationPicker'), {
    ssr: false,
    loading: () => <div className="map-loading">Cargando mapa...</div>
});

export default function PropertyForm({ initialData = {}, onSubmit, loading }) {
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        price: initialData.price || '',
        location: initialData.location || '', // Text address/city
        coordinates: initialData.coordinates || { lat: 6.1387, lng: -75.434 }, // Default Rionegro
        type: initialData.type || 'Lote',
        status: initialData.status || 'Disponible',
        area: initialData.area || '',
        bedrooms: initialData.bedrooms || '',
        bathrooms: initialData.bathrooms || '',
        parking: initialData.parking || '',
        stratum: initialData.stratum || '',
        administration: initialData.administration || '',
        yearBuilt: initialData.yearBuilt || '',
        access: initialData.access || 'Pavimentado',
        topography: initialData.topography || 'Plano',
        description: initialData.description || '',
        features: initialData.features || [],
        images: initialData.images || [],
        videoUrl: initialData.videoUrl || ''
    });

    const [newImages, setNewImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [featureInput, setFeatureInput] = useState('');
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCoordinatesChange = async (coords) => {
        setFormData(prev => ({ ...prev, coordinates: coords }));

        // Auto-fetch city/address from coordinates using OpenStreetMap Nominatim
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon || coords.lng}&zoom=14`);
            const data = await response.json();

            if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.municipality || '';
                const neighborhood = data.address.suburb || data.address.neighbourhood || '';
                const state = data.address.state || '';

                let locationString = city;
                if (neighborhood) locationString += `, ${neighborhood}`;
                if (state) locationString += `, ${state}`;

                // Only update location if it's currently empty to avoid overwriting user edits?
                // Or maybe we show a button to "Use Map Location"?
                // User requirement: "Make coherent". So we should probably suggest it.
                // For now, let's update it if it seems automatic or if user hasn't typed much.
                setFormData(prev => ({ ...prev, location: locationString }));
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        }
    };

    const handleFeatureAdd = (e) => {
        e.preventDefault();
        if (featureInput.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, featureInput.trim()]
            }));
            setFeatureInput('');
        }
    };

    const handleFeatureRemove = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleImageSelect = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setNewImages(prev => [...prev, ...filesArray]);
        }
    };

    const handleRemoveNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            // Upload new images
            const uploadedImageUrls = await Promise.all(
                newImages.map(async (file) => {
                    const storageRef = ref(storage, `properties/${Date.now()}_${file.name}`);
                    const snapshot = await uploadBytes(storageRef, file);
                    return await getDownloadURL(snapshot.ref);
                })
            );

            // Combine existing and new images
            const finalImages = [...formData.images, ...uploadedImageUrls];

            // Submit form data with numbers converted
            await onSubmit({
                ...formData,
                images: finalImages,
                area: Number(formData.area) || 0,
                bedrooms: Number(formData.bedrooms) || 0,
                bathrooms: Number(formData.bathrooms) || 0,
                parking: Number(formData.parking) || 0,
                stratum: Number(formData.stratum) || 0,
                updatedAt: new Date().toISOString()
            });

        } catch (error) {
            console.error("Error uploading images:", error);
            alert("Error al subir las imágenes. Intenta de nuevo.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="property-form">
            <div className="form-grid">

                {/* Section 1: Basic Info */}
                <div className="form-section">
                    <h3>Información Principal</h3>
                    <div className="input-group full-width">
                        <label>Título del Inmueble</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Hermosa Finca en Llanogrande"
                            className="input-lg"
                        />
                    </div>

                    <div className="row three-cols">
                        <div className="input-group">
                            <label>Precio (COP)</label>
                            <input
                                type="text" // Keep as text to allow formatting if we add it later
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                placeholder="$000.000.000"
                            />
                        </div>
                        <div className="input-group">
                            <label>Estado</label>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="Disponible">Disponible</option>
                                <option value="Reservado">Reservado</option>
                                <option value="Vendido">Vendido</option>
                                <option value="Arrendado">Arrendado</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Tipo de Inmueble</label>
                            <select name="type" value={formData.type} onChange={handleChange}>
                                <option value="Lote">Lote</option>
                                <option value="Finca">Finca</option>
                                <option value="Casa Campestre">Casa Campestre</option>
                                <option value="Casa">Casa Urbana</option>
                                <option value="Apartamento">Apartamento</option>
                                <option value="Local">Local Comercial</option>
                                <option value="Bodega">Bodega</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 2: Location */}
                <div className="form-section">
                    <h3>Ubicación</h3>
                    <div className="input-group map-container">
                        <label>Mapa (Arrastra el marcador para fijar la ubicación exacta)</label>
                        <p className="help-text">Mueve el marcador en el mapa para establecer la ubicación. La dirección se completará automáticamente.</p>
                        <LocationPicker
                            position={formData.coordinates}
                            onPositionChange={handleCoordinatesChange}
                        />
                        <div className="coordinates-display">
                            Lat: {formData.coordinates?.lat?.toFixed(5)}, Lng: {formData.coordinates?.lng?.toFixed(5)}
                        </div>
                    </div>

                    <div className="row">
                        <div className="input-group">
                            <label>Ubicación (Texto)</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                placeholder="Se llenará automáticamente al usar el mapa..."
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Details */}
                <div className="form-section">
                    <h3>Detalles y Características</h3>
                    <div className="row four-cols">
                        <div className="input-group">
                            <label>Área (m²)</label>
                            <input type="number" name="area" value={formData.area} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Habitaciones</label>
                            <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Baños</label>
                            <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Parqueaderos</label>
                            <input type="number" name="parking" value={formData.parking} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="row four-cols">
                        <div className="input-group">
                            <label>Estrato</label>
                            <select name="stratum" value={formData.stratum} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Admin ($)</label>
                            <input type="text" name="administration" value={formData.administration} onChange={handleChange} placeholder="Cuota mensual" />
                        </div>
                        <div className="input-group">
                            <label>Año Construcción</label>
                            <input type="number" name="yearBuilt" value={formData.yearBuilt} onChange={handleChange} placeholder="Ej: 2020" />
                        </div>
                    </div>

                    <div className="row">
                        <div className="input-group">
                            <label>Acceso</label>
                            <select name="access" value={formData.access} onChange={handleChange}>
                                <option value="Pavimentado">Pavimentado</option>
                                <option value="Destapado">Destapado (Tierra)</option>
                                <option value="Mixto">Mixto</option>
                                <option value="Rieles">Placa Huella / Rieles</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Topografía</label>
                            <select name="topography" value={formData.topography} onChange={handleChange}>
                                <option value="Plano">Plano</option>
                                <option value="Inclinado">Inclinado (Pendiente)</option>
                                <option value="Mixto">Mixto / Ondulado</option>
                                <option value="Quebrado">Quebrado</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Características Adicionales (Amenities)</label>
                        <div className="feature-input-container">
                            <input
                                type="text"
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                placeholder="Ej: Piscina, Vigilancia 24h, Chimenea..."
                                onKeyDown={(e) => e.key === 'Enter' && handleFeatureAdd(e)}
                            />
                            <button type="button" onClick={handleFeatureAdd} className="btn-add">Agregar</button>
                        </div>
                        <div className="features-list">
                            {formData.features.map((feature, index) => (
                                <span key={index} className="feature-tag">
                                    {feature}
                                    <button type="button" onClick={() => handleFeatureRemove(index)}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Descripción Detallada</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="6"
                            required
                            placeholder="Describe los detalles que hacen única a esta propiedad..."
                        ></textarea>
                    </div>
                </div>

                {/* Section 4: Multimedia */}
                <div className="form-section">
                    <h3>Multimedia</h3>
                    <div className="input-group">
                        <label>Imágenes (Selecciona varias)</label>
                        <div className="file-drop-area" onClick={() => fileInputRef.current?.click()}>
                            <p>Haz clic para seleccionar fotos</p>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageSelect}
                                ref={fileInputRef}
                                className="hidden-file-input"
                            />
                        </div>

                        <div className="images-preview">
                            {formData.images.map((url, index) => (
                                <div key={`existing-${index}`} className="image-preview-item">
                                    <img src={url} alt={`Propiedad ${index}`} />
                                    <button type="button" onClick={() => handleRemoveExistingImage(index)} className="btn-remove-img">×</button>
                                </div>
                            ))}
                            {newImages.map((file, index) => (
                                <div key={`new-${index}`} className="image-preview-item new">
                                    <img src={URL.createObjectURL(file)} alt={`Nueva ${index}`} />
                                    <button type="button" onClick={() => handleRemoveNewImage(index)} className="btn-remove-img">×</button>
                                    <span className="img-label">Nueva</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Video URL (YouTube/Vimeo)</label>
                        <input
                            type="url"
                            name="videoUrl"
                            value={formData.videoUrl}
                            onChange={handleChange}
                            placeholder="https://youtube.com/..."
                        />
                    </div>
                </div>

            </div>

            <div className="form-actions sticky-actions">
                <button type="button" className="btn-cancel" onClick={() => window.history.back()}>Cancelar</button>
                <button type="submit" className="btn btn-primary btn-large" disabled={loading || uploading}>
                    {uploading ? 'Subiendo imágenes...' : loading ? 'Guardando...' : 'Guardar Propiedad'}
                </button>
            </div>

            <style jsx>{`
        .property-form {
          max-width: 1000px;
          margin: 0 auto;
          padding-bottom: 80px;
        }

        .form-section {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          margin-bottom: 2rem;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .form-section h3 {
          margin-bottom: 1.5rem;
          color: #111;
          font-size: 1.25rem;
          font-weight: 700;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 0.5rem;
        }

        .input-group {
          margin-bottom: 1.25rem;
        }

        .input-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
          font-size: 0.95rem;
        }

        .input-group input,
        .input-group select,
        .input-group textarea {
          width: 100%;
          padding: 0.875rem;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.2s;
          background: #fcfcfc;
        }

        .input-group input:focus,
        .input-group select:focus,
        .input-group textarea:focus {
          border-color: #111;
          background: white;
          outline: none;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
        }

        .input-lg {
            font-size: 1.2rem !important;
            font-weight: 600;
        }

        .row {
          display: grid;
          gap: 1.5rem;
        }
        
        .three-cols { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
        .four-cols { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); }

        .feature-input-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .btn-add {
          padding: 0 1.5rem;
          background: #333;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
        }

        .features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .feature-tag {
          background: #f0f0f0;
          padding: 0.5rem 1rem;
          border-radius: 30px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: #333;
        }

        .feature-tag button {
          background: #e5e5e5;
          border: none;
          color: #666;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
        }
        .feature-tag button:hover { background: #ffcccc; color: #d32f2f; }

        .file-drop-area {
            border: 2px dashed #ccc;
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
            background: #fafafa;
        }
        .file-drop-area:hover {
            border-color: #111;
            background: #f0f0f0;
        }
        .hidden-file-input { display: none; }

        .images-preview {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .image-preview-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .image-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn-remove-img {
          position: absolute;
          top: 6px;
          right: 6px;
          background: rgba(0,0,0,0.6);
          color: white;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .btn-remove-img:hover { background: rgba(220, 38, 38, 0.9); }

        .img-label {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: rgba(59, 130, 246, 0.9);
          color: white;
          font-size: 0.7rem;
          text-align: center;
          padding: 3px;
          font-weight: 600;
        }

        .sticky-actions {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            padding: 1rem 2rem;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            z-index: 100;
            backdrop-filter: blur(10px);
            background: rgba(255,255,255,0.95);
        }

        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
        }
        .btn-primary {
            background: #111;
            color: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }
        .btn-primary:disabled {
            background: #888;
            cursor: not-allowed;
            transform: none;
        }
        .btn-cancel {
            background: transparent;
            color: #666;
            border: 1px solid #ddd;
        }
        .btn-cancel:hover { background: #f5f5f5; color: #333; }

        .map-loading {
            height: 400px;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #888;
            border-radius: 12px;
        }
        
        .coordinates-display {
            margin-top: 0.5rem;
            font-size: 0.8rem;
            color: #666;
            font-family: monospace;
        }

        @media (max-width: 768px) {
            .row { grid-template-columns: 1fr; }
            .sticky-actions { padding: 1rem; }
            .btn-large { width: 100%; }
        }
      `}</style>
        </form>
    );
}
