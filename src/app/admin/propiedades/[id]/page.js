'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function PropertyEditor({ params }) {
    const router = useRouter();
    const { user, loading } = useAuth();
    const isNew = params.id === 'nueva';

    const [formData, setFormData] = useState({
        title: '',
        type: 'Finca',
        price: '',
        location: '',
        area: '',
        beds: '',
        baths: '',
        description: '',
        images: [], // Array of URLs
        lat: '',
        lng: ''
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/admin/login');
            return;
        }

        const fetchProperty = async () => {
            if (!isNew && user) {
                try {
                    const docRef = doc(db, 'properties', params.id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        // Migration: If 'images' doesn't exist but 'image' does, create array
                        let images = data.images || [];
                        if (images.length === 0 && data.image) {
                            images = [data.image];
                        }
                        setFormData({ id: docSnap.id, ...data, images });
                    } else {
                        alert('Propiedad no encontrada');
                        router.push('/admin/dashboard');
                    }
                } catch (error) {
                    console.error("Error fetching property:", error);
                }
            }
        };

        fetchProperty();
    }, [params.id, isNew, user, loading, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const newImageUrls = [];
            for (const file of files) {
                const storageRef = ref(storage, `properties/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const url = await getDownloadURL(snapshot.ref);
                newImageUrls.push(url);
            }

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImageUrls]
            }));
        } catch (error) {
            console.error("Error uploading images:", error);
            alert("Error al subir las imágenes");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Ensure 'image' field exists for backward compatibility (use first image)
            const mainImage = formData.images.length > 0 ? formData.images[0] : '/images/placeholder.jpg';
            const dataToSave = {
                ...formData,
                image: mainImage,
                updatedAt: new Date()
            };

            if (isNew) {
                dataToSave.createdAt = new Date();
                await addDoc(collection(db, 'properties'), dataToSave);
            } else {
                await updateDoc(doc(db, 'properties', params.id), dataToSave);
            }
            alert(`Propiedad ${isNew ? 'creada' : 'actualizada'} con éxito`);
            router.push('/admin/dashboard');
        } catch (error) {
            console.error("Error saving property:", error);
            alert("Error al guardar la propiedad");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Cargando...</div>;

    return (
        <div className="editor-page">
            <header style={{ background: 'white', borderBottom: '1px solid var(--color-border)', padding: '1rem' }}>
                <div className="container">
                    <Link href="/admin/dashboard" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                        ← Volver al Dashboard
                    </Link>
                </div>
            </header>

            <main className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>
                <h1 style={{ marginBottom: '2rem', color: 'var(--color-primary)' }}>
                    {isNew ? 'Nueva Propiedad' : 'Editar Propiedad'}
                </h1>

                <form onSubmit={handleSubmit} className="editor-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Título</label>
                            <input name="title" value={formData.title} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Tipo</label>
                            <select name="type" value={formData.type} onChange={handleChange}>
                                <option value="Finca">Finca</option>
                                <option value="Lote">Lote</option>
                                <option value="Local">Local</option>
                                <option value="Casa">Casa</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Precio</label>
                            <input name="price" value={formData.price} onChange={handleChange} required placeholder="$0.000.000" />
                        </div>

                        <div className="form-group">
                            <label>Ubicación</label>
                            <input name="location" value={formData.location} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Área</label>
                            <input name="area" value={formData.area} onChange={handleChange} required placeholder="Ej: 3,500 m²" />
                        </div>

                        <div className="form-group">
                            <label>Habitaciones</label>
                            <input name="beds" type="number" value={formData.beds || ''} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Baños</label>
                            <input name="baths" type="number" value={formData.baths || ''} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Latitud (Mapa)</label>
                            <input name="lat" type="number" step="any" value={formData.lat || ''} onChange={handleChange} placeholder="Ej: 6.155" />
                        </div>

                        <div className="form-group">
                            <label>Longitud (Mapa)</label>
                            <input name="lng" type="number" step="any" value={formData.lng || ''} onChange={handleChange} placeholder="Ej: -75.374" />
                        </div>

                        <div className="form-group full-width">
                            <label>Galería de Imágenes (La primera será la principal)</label>
                            <div style={{ marginBottom: '1rem' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    id="file-upload"
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="btn btn-secondary"
                                    style={{ display: 'inline-block', cursor: uploading ? 'wait' : 'pointer' }}
                                >
                                    {uploading ? 'Subiendo...' : '📸 Agregar Fotos'}
                                </label>
                            </div>

                            {formData.images.length > 0 && (
                                <div className="image-grid">
                                    {formData.images.map((url, index) => (
                                        <div key={index} className="image-item">
                                            <img src={url} alt={`Propiedad ${index + 1}`} />
                                            <button
                                                type="button"
                                                className="delete-btn"
                                                onClick={() => removeImage(index)}
                                            >
                                                ×
                                            </button>
                                            {index === 0 && <span className="main-badge">Principal</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-group full-width">
                            <label>Descripción</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="6"
                                required
                            ></textarea>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => router.push('/admin/dashboard')} className="btn-secondary" disabled={saving}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </main>

            <style jsx>{`
        .editor-page {
          min-height: 100vh;
          background-color: var(--color-bg);
          padding-bottom: 80px; /* Space for bottom nav on mobile */
        }
        .editor-form {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
          }
          .full-width {
            grid-column: 1 / -1;
          }
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--color-text-main);
        }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          font-size: 1rem;
          font-family: inherit;
        }
        .form-actions {
          margin-top: 2rem;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        .btn-secondary {
          background: white;
          border: 1px solid var(--color-border);
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          color: var(--color-text-main);
        }
        
        .image-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 10px;
            margin-top: 1rem;
        }
        .image-item {
            position: relative;
            aspect-ratio: 1;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid var(--color-border);
        }
        .image-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .delete-btn {
            position: absolute;
            top: 4px;
            right: 4px;
            background: rgba(255,0,0,0.8);
            color: white;
            border: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        .main-badge {
            position: absolute;
            bottom: 4px;
            left: 4px;
            background: rgba(0,0,0,0.6);
            color: white;
            font-size: 0.7rem;
            padding: 2px 6px;
            border-radius: 4px;
        }
      `}</style>
        </div>
    );
}
