'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
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
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando panel...</p>
        <style jsx>{`
          .loading-screen {
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f9f9f9;
            color: #666;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(0,0,0,0.1);
            border-radius: 50%;
            border-top-color: #111;
            animation: spin 1s ease-in-out infinite;
            margin-bottom: 16px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page">
      <Header />

      <main className="main-content">
        <div className="container">
          <div className="dashboard-header">
            <div>
              <h1 className="page-title">Mis Propiedades</h1>
              <p className="page-subtitle">Gestiona tu portafolio inmobiliario ({properties.length})</p>
            </div>
            <Link href="/admin/propiedades/nueva" className="btn-primary">
              + Nueva Propiedad
            </Link>
          </div>

          {loadingData ? (
            <div className="loading-grid">Cargando propiedades...</div>
          ) : properties.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏠</div>
              <h3>No tienes propiedades publicadas</h3>
              <p>Comienza agregando tu primera propiedad al sistema.</p>
              <Link href="/admin/propiedades/nueva" className="btn-link">Crear Propiedad</Link>
            </div>
          ) : (
            <div className="properties-grid">
              {properties.map(property => (
                <div key={property.id} className="property-card">
                  <div className="card-image-wrapper">
                    {property.images && property.images.length > 0 ? (
                      <img src={property.images[0]} alt={property.title} className="card-image" />
                    ) : (
                      <div className="no-image">Sin imagen</div>
                    )}
                    <span className="card-badge">{property.type}</span>
                    <div className="card-overlay">
                      <Link href={`/admin/propiedades/${property.id}`} className="btn-icon edit" title="Editar">
                        ✏️
                      </Link>
                      <button onClick={() => handleDelete(property.id)} className="btn-icon delete" title="Eliminar">
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="card-content">
                    <h3 className="card-title">{property.title}</h3>
                    <p className="card-location">📍 {property.location}</p>
                    <p className="card-price">{property.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f9f9f9;
          padding-top: 80px;
        }

        /* Header */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 100;
          padding: 16px 0;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -1px;
          color: #111;
          text-decoration: none;
        }
        .badge-admin {
          background: #111;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .user-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .user-email {
          color: #666;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .btn-logout {
          background: white;
          border: 1px solid #e5e5e5;
          color: #666;
          padding: 8px 16px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-logout:hover {
          background: #fee2e2;
          color: #ef4444;
          border-color: #fee2e2;
        }
        .desktop-only { display: none; }
        @media (min-width: 768px) { .desktop-only { display: block; } }

        /* Main Content */
        .main-content {
          padding: 40px 0 80px;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .page-title {
          font-size: 2rem;
          font-weight: 800;
          color: #111;
          margin-bottom: 4px;
          letter-spacing: -1px;
        }
        .page-subtitle {
          color: #666;
          font-size: 1rem;
        }
        .btn-primary {
          background: #111;
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }

        /* Grid */
        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 32px;
        }

        /* Card */
        .property-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          transition: transform 0.3s, box-shadow 0.3s;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .property-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.1);
        }
        .card-image-wrapper {
          position: relative;
          height: 220px;
          overflow: hidden;
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
        .property-card:hover .card-image {
          transform: scale(1.05);
        }
        .no-image {
          width: 100%;
          height: 100%;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
        }
        .card-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(4px);
          color: #111;
          padding: 6px 12px;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        /* Overlay Actions */
        .card-overlay {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          gap: 8px;
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.3s;
        }
        .property-card:hover .card-overlay {
          opacity: 1;
          transform: translateY(0);
        }
        .btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          font-size: 1rem;
          text-decoration: none;
          transition: transform 0.2s;
        }
        .btn-icon:hover {
          transform: scale(1.1);
        }
        .btn-icon.delete {
          color: #ef4444;
        }

        .card-content {
          padding: 20px;
        }
        .card-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #111;
          margin-bottom: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-location {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 12px;
        }
        .card-price {
          font-size: 1.2rem;
          font-weight: 800;
          color: #111;
        }

        .empty-state {
          text-align: center;
          padding: 80px 0;
          color: #666;
          background: white;
          border-radius: 24px;
          border: 1px dashed #e5e5e5;
        }
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        .btn-link {
          display: inline-block;
          margin-top: 16px;
          color: #111;
          font-weight: 700;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
