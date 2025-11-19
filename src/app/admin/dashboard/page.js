'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { properties as initialProperties } from '@/data/properties';
import Link from 'next/link';

export default function AdminDashboard() {
    const [properties, setProperties] = useState(initialProperties);
    const router = useRouter();

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin');
        if (!isAdmin) {
            router.push('/admin/login');
        }
    }, [router]);

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar esta propiedad?')) {
            setProperties(properties.filter(p => p.id !== id));
            alert('Propiedad eliminada (Simulación)');
        }
    };

    return (
        <div className="admin-page">
            <header style={{ background: 'white', borderBottom: '1px solid var(--color-border)', padding: '1rem' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>Origo Admin</h1>
                    <button
                        onClick={() => { localStorage.removeItem('isAdmin'); router.push('/admin/login'); }}
                        className="btn-text"
                        style={{ color: 'red' }}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <main className="container" style={{ padding: '2rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2>Mis Propiedades</h2>
                    <Link href="/admin/propiedades/nueva" className="btn btn-primary">
                        + Nueva Propiedad
                    </Link>
                </div>

                <div className="admin-grid">
                    {properties.map(property => (
                        <div key={property.id} className="admin-card">
                            <img src={property.image} alt={property.title} className="admin-card-img" />
                            <div className="admin-card-content">
                                <h3>{property.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{property.location}</p>
                                <p style={{ fontWeight: 'bold', margin: '0.5rem 0' }}>{property.price}</p>
                                <div className="actions">
                                    <Link href={`/admin/propiedades/${property.id}`} className="btn-sm btn-edit">Editar</Link>
                                    <button onClick={() => handleDelete(property.id)} className="btn-sm btn-delete">Eliminar</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <style jsx>{`
        .admin-page {
          min-height: 100vh;
          background-color: var(--color-bg);
        }
        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        .admin-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--color-border);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .admin-card-img {
          width: 100%;
          height: 150px;
          object-fit: cover;
        }
        .admin-card-content {
          padding: 1rem;
        }
        .actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .btn-sm {
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
          border: none;
          flex: 1;
          text-align: center;
        }
        .btn-edit {
          background-color: #e0e7ff;
          color: #4338ca;
        }
        .btn-delete {
          background-color: #fee2e2;
          color: #ef4444;
        }
      `}</style>
        </div>
    );
}
