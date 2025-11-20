'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

export default function AdminDashboard() {
  const [properties, setProperties] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const props = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProperties(props);
        setLoadingData(false);
      }, (error) => {
        console.error("Error fetching properties:", error);
        setLoadingData(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta propiedad? Esta acción no se puede deshacer.')) {
      try {
        await deleteDoc(doc(db, 'properties', id));
        alert('Propiedad eliminada correctamente');
      } catch (error) {
        console.error("Error deleting property:", error);
        alert("Error al eliminar la propiedad");
      }
    }
  };

  if (loading || !user) {
    return <div className="loading">Cargando panel...</div>;
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container header-content">
          <h1 className="admin-title">Origo Admin</h1>
          <div className="user-actions">
            <span className="user-email">{user.email}</span>
            <button onClick={handleLogout} className="btn-logout">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="container main-content">
        <div className="dashboard-actions">
          <h2>Mis Propiedades ({properties.length})</h2>
          <Link href="/admin/propiedades/nueva" className="btn btn-primary">
            + Nueva Propiedad
          </Link>
        </div>

        {loadingData ? (
          <div className="loading-grid">Cargando propiedades...</div>
        ) : properties.length === 0 ? (
          <div className="empty-state">
            <p>No tienes propiedades publicadas.</p>
            <Link href="/admin/propiedades/nueva" className="btn-link">¡Crea la primera!</Link>
          </div>
        ) : (
          <div className="admin-grid">
            {properties.map(property => (
              <div key={property.id} className="admin-card">
                <div className="card-image-container">
                  {property.images && property.images.length > 0 ? (
                    <img src={property.images[0]} alt={property.title} className="admin-card-img" />
                  ) : (
                    <div className="no-image">Sin imagen</div>
                  )}
                  <span className="card-badge">{property.type}</span>
                </div>

                <div className="admin-card-content">
                  <h3>{property.title}</h3>
                  <p className="location">📍 {property.location}</p>
                  <p className="price">{property.price}</p>

                  <div className="actions">
                    <Link href={`/admin/propiedades/${property.id}`} className="btn-sm btn-edit">
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(property.id)} className="btn-sm btn-delete">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          background-color: var(--color-bg);
        }

        .admin-header {
          background: white;
          border-bottom: 1px solid var(--color-border);
          padding: 1rem 0;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .admin-title {
          font-size: 1.5rem;
          color: var(--color-primary);
          margin: 0;
        }

        .user-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-email {
          color: var(--color-text-muted);
          font-size: 0.9rem;
          display: none;
        }

        @media (min-width: 768px) {
          .user-email {
            display: block;
          }
        }

        .btn-logout {
          background: none;
          border: 1px solid #ef4444;
          color: #ef4444;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .btn-logout:hover {
          background: #fee2e2;
        }

        .main-content {
          padding-top: 2rem;
          padding-bottom: 4rem;
        }

        .dashboard-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .dashboard-actions h2 {
          font-size: 1.5rem;
          color: var(--color-text-main);
          margin: 0;
        }

        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .admin-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--color-border);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: transform 0.2s;
        }

        .admin-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .card-image-container {
          position: relative;
          height: 180px;
        }

        .admin-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          width: 100%;
          height: 100%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
        }

        .card-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .admin-card-content {
          padding: 1rem;
        }

        .admin-card-content h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .location {
          font-size: 0.9rem;
          color: var(--color-text-muted);
          margin-bottom: 0.5rem;
        }

        .price {
          font-weight: 700;
          color: var(--color-secondary);
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-sm {
          padding: 0.5rem;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          border: none;
          flex: 1;
          text-align: center;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .btn-sm:hover {
          opacity: 0.9;
        }

        .btn-edit {
          background-color: var(--color-primary);
          color: white;
        }

        .btn-delete {
          background-color: #fee2e2;
          color: #ef4444;
        }

        .loading, .loading-grid, .empty-state {
          text-align: center;
          padding: 4rem 0;
          color: var(--color-text-muted);
        }

        .btn-link {
          color: var(--color-secondary);
          text-decoration: underline;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
