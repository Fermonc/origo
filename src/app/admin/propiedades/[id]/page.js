'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { properties as initialProperties } from '@/data/properties';
import Link from 'next/link';

export default function PropertyEditor({ params }) {
    const router = useRouter();
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
        image: '/images/placeholder.jpg'
    });

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin');
        if (!isAdmin) {
            router.push('/admin/login');
            return;
        }

        if (!isNew) {
            const property = initialProperties.find(p => p.id.toString() === params.id);
            if (property) {
                setFormData(property);
            } else {
                alert('Propiedad no encontrada');
                router.push('/admin/dashboard');
            }
        }
    }, [params.id, isNew, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Guardando propiedad:', formData);
        alert(`Propiedad ${isNew ? 'creada' : 'actualizada'} con éxito (Simulación)`);
        router.push('/admin/dashboard');
    };

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

                        <div className="form-group full-width">
                            <label>URL Imagen Principal</label>
                            <input name="image" value={formData.image} onChange={handleChange} />
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                Por ahora usa una URL externa o deja el placeholder.
                            </p>
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
                        <button type="button" onClick={() => router.push('/admin/dashboard')} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </main>

            <style jsx>{`
        .editor-page {
          min-height: 100vh;
          background-color: var(--color-bg);
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
          background: none;
          border: 1px solid var(--color-border);
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
      `}</style>
        </div>
    );
}
