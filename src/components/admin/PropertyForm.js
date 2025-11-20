'use client';

import { useState, useRef } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

export default function PropertyForm({ initialData = {}, onSubmit, loading }) {
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        price: initialData.price || '',
        location: initialData.location || '',
        type: initialData.type || 'Lote',
        area: initialData.area || '',
        bedrooms: initialData.bedrooms || '',
        bathrooms: initialData.bathrooms || '',
        stratum: initialData.stratum || '',
        description: initialData.description || '',
        features: initialData.features || [],
        images: initialData.images || []
    });

    const [newImages, setNewImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [featureInput, setFeatureInput] = useState('');
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

            // Submit form data
            await onSubmit({
                ...formData,
                images: finalImages,
                price: formData.price, // Ensure string or number consistency as needed
                area: Number(formData.area),
                bedrooms: Number(formData.bedrooms),
                bathrooms: Number(formData.bathrooms),
                stratum: Number(formData.stratum),
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
                {/* Basic Info */}
                <div className="form-section">
                    <h3>Información Básica</h3>
                    <div className="input-group">
                        <label>Título de la Propiedad</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Hermosa Finca en Llanogrande"
                        />
                    </div>

                    <div className="row">
                        <div className="input-group">
                            <label>Precio</label>
                            <input
                                type="text"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                placeholder="$000.000.000"
                            />
                        </div>
                        <div className="input-group">
                            <label>Ubicación (Municipio/Vereda)</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                placeholder="Ej: Rionegro, Vereda Abreo"
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="input-group">
                            <label>Tipo de Inmueble</label>
                            <select name="type" value={formData.type} onChange={handleChange}>
                                <option value="Lote">Lote</option>
                                <option value="Finca">Finca</option>
                                <option value="Local">Local</option>
                                <option value="Casa">Casa</option>
                                <option value="Apartamento">Apartamento</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Estrato</label>
                            <input
                                type="number"
                                name="stratum"
                                value={formData.stratum}
                                onChange={handleChange}
                                min="0"
                                max="6"
                            />
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="form-section">
                    <h3>Detalles</h3>
                    <div className="row">
                        <div className="input-group">
                            <label>Área (m²)</label>
                            <input
                                type="number"
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Habitaciones</label>
                            <input
                                type="number"
                                name="bedrooms"
                                value={formData.bedrooms}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-group">
                            <label>Baños</label>
                            <input
                                type="number"
                                name="bathrooms"
                                value={formData.bathrooms}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Descripción</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            required
                        ></textarea>
                    </div>
                </div>

                {/* Features */}
                <div className="form-section">
                    <h3>Características</h3>
                    <div className="feature-input-container">
                        <input
                            type="text"
                            value={featureInput}
                            onChange={(e) => setFeatureInput(e.target.value)}
                            placeholder="Agregar característica (ej: Vista panorámica)"
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

                {/* Images */}
                <div className="form-section">
                    <h3>Imágenes</h3>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        ref={fileInputRef}
                        className="file-input"
                    />

                    <div className="images-preview">
                        {/* Existing Images */}
                        {formData.images.map((url, index) => (
                            <div key={`existing-${index}`} className="image-preview-item">
                                <img src={url} alt={`Propiedad ${index}`} />
                                <button type="button" onClick={() => handleRemoveExistingImage(index)} className="btn-remove-img">×</button>
                                <span className="img-label">Guardada</span>
                            </div>
                        ))}

                        {/* New Images */}
                        {newImages.map((file, index) => (
                            <div key={`new-${index}`} className="image-preview-item new">
                                <img src={URL.createObjectURL(file)} alt={`Nueva ${index}`} />
                                <button type="button" onClick={() => handleRemoveNewImage(index)} className="btn-remove-img">×</button>
                                <span className="img-label">Nueva</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-large" disabled={loading || uploading}>
                    {uploading ? 'Subiendo imágenes...' : loading ? 'Guardando...' : 'Guardar Propiedad'}
                </button>
            </div>

            <style jsx>{`
        .property-form {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .form-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--color-border);
        }

        .form-section:last-child {
          border-bottom: none;
        }

        .form-section h3 {
          margin-bottom: 1.5rem;
          color: var(--color-primary);
          font-size: 1.2rem;
        }

        .input-group {
          margin-bottom: 1rem;
        }

        .input-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--color-text-main);
        }

        .input-group input,
        .input-group select,
        .input-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
        }

        .row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .feature-input-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .feature-input-container input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
        }

        .btn-add {
          padding: 0 1.5rem;
          background: var(--color-secondary);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .feature-tag {
          background: var(--color-bg);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .feature-tag button {
          background: none;
          border: none;
          color: #ef4444;
          font-weight: bold;
          cursor: pointer;
          font-size: 1.1rem;
        }

        .images-preview {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .image-preview-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--color-border);
        }

        .image-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn-remove-img {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(255, 0, 0, 0.8);
          color: white;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .img-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.6);
          color: white;
          font-size: 0.7rem;
          text-align: center;
          padding: 2px;
        }

        .form-actions {
          margin-top: 2rem;
          text-align: right;
        }

        .btn-large {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
        }

        @media (min-width: 768px) {
          .btn-large {
            width: auto;
            padding: 0.75rem 3rem;
          }
        }
      `}</style>
        </form>
    );
}
