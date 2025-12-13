'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, where } from 'firebase/firestore';
import { getUserProfile } from '@/lib/db/users';

export default function AdminDashboard() {
  const [properties, setProperties] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'Disponible', 'Vendido'
  const { user, loading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  // Check Role
  useEffect(() => {
    const checkRole = async () => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        setIsAdmin(profile?.role === 'admin');
      }
    }
    checkRole();
  }, [user]);

  // Messages Subscription (Only for Admin)
  useEffect(() => {
    if (user && isAdmin) {
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const unread = snapshot.docs.filter(doc => !doc.data().read).length;
        setUnreadCount(unread);
      });
      return () => unsubscribe();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (user) {
      let q;
      // If admin, fetch all. If seller, fetch only theirs.
      // We need to wait for role check, but we can do a quick check here or assume based on state
      // Better to check role state first, but for now lets rely on isAdmin state or user ID

      // Wait for role check effectively in a real app, but here we can rely on security rules failing if we try to fetch all as seller
      // However, to avoid errors, we should construct query correctly.

      if (isAdmin) {
        q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
      } else {
        // Seller (or buyer trying to access dashboard?)
        // Assuming seller if not admin
        q = query(collection(db, 'properties'), where('userId', '==', user.uid));
      }

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
        // Only show error toast if it's not a permission error or handle gracefully
        // addToast('Error al cargar propiedades', 'error');
      });

      return () => unsubscribe();
    }
  }, [user, isAdmin, addToast]);

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta propiedad? Esta acción no se puede deshacer.')) {
      try {
        await deleteDoc(doc(db, 'properties', id));
        addToast('Propiedad eliminada correctamente', 'success');
      } catch (error) {
        console.error("Error deleting property:", error);
        addToast('Error al eliminar la propiedad', 'error');
      }
    }
  };

  const filteredProperties = useMemo(() => {
    if (filter === 'all') return properties;
    return properties.filter(p => p.status === filter);
  }, [properties, filter]);

  const stats = useMemo(() => {
    return {
      total: properties.length,
      active: properties.filter(p => p.status === 'Disponible' || !p.status).length,
      sold: properties.filter(p => p.status === 'Vendido').length
    };
  }, [properties]);

  if (loading || !user) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page">
      <Header />

      <main className="main-content">
        <div className="container">

          {/* Dashboard Header */}
          <div className="dashboard-header">
            <div>
              <h1 className="page-title">{isAdmin ? 'Panel de Administración' : 'Mi Gestión Inmobiliaria'}</h1>
              <p className="page-subtitle">Bienvenido, {user.email}</p>
            </div>
            <div className="header-actions">
              {isAdmin && (
                <Link href="/admin/mensajes" className="btn-secondary">
                  📩 Mensajes {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
                </Link>
              )}
              <Link href="/admin/propiedades/nueva" className="btn-primary">
                + Nueva Propiedad
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          {isAdmin && (
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Propiedades</h3>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-card active">
                <h3>Disponibles</h3>
                <div className="stat-value">{stats.active}</div>
              </div>
              <div className="stat-card sold">
                <h3>Vendidas</h3>
                <div className="stat-value">{stats.sold}</div>
              </div>
              <Link href="/admin/mensajes" className="stat-card messages">
                <h3>Mensajes Nuevos</h3>
                <div className="stat-value">{unreadCount}</div>
              </Link>
            </div>
          )}

          {/* Filters */}
          <div className="filters-bar">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todos
            </button>
            <button
              className={`filter-btn ${filter === 'Disponible' ? 'active' : ''}`}
              onClick={() => setFilter('Disponible')}
            >
              Disponibles
            </button>
            <button
              className={`filter-btn ${filter === 'Vendido' ? 'active' : ''}`}
              onClick={() => setFilter('Vendido')}
            >
              Vendidos
            </button>
          </div>

          {loadingData ? (
            <div className="loading-grid">Cargando inventario...</div>
          ) : filteredProperties.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>{isAdmin ? 'No hay propiedades en esta categoría' : '¡Aún no has publicado ninguna propiedad!'}</h3>
              <p>{!isAdmin && 'Comienza a vender hoy mismo. Es rápido y sencillo.'}</p>

              {!isAdmin ? (
                <Link href="/admin/propiedades/nueva" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
                  Publicar mi primera propiedad
                </Link>
              ) : (
                filter !== 'all' && <button onClick={() => setFilter('all')} className="btn-link">Ver todas</button>
              )}
            </div>
          ) : (
            <div className="properties-grid">
              {filteredProperties.map(property => (
                <div key={property.id} className="property-card">
                  <div className="card-image-wrapper">
                    {property.images && property.images.length > 0 ? (
                      <img src={property.images[0]} alt={property.title} className="card-image" />
                    ) : (
                      <div className="no-image">Sin imagen</div>
                    )}

                    <span className="card-badge type">{property.type}</span>

                    {property.status === 'Vendido' && (
                      <span className="card-badge status sold">Vendido</span>
                    )}
                    {property.status === 'Reservado' && (
                      <span className="card-badge status reserved">Reservado</span>
                    )}

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
                    <div className="card-details">
                      <span>📍 {property.location}</span>
                      <span>📐 {property.area} m²</span>
                    </div>
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
          background: #f8fafc;
          padding-top: 80px;
        }

        .main-content {
          padding: 40px 0 80px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .page-subtitle {
          color: #64748b;
          margin-top: 4px;
        }

        .btn-primary {
          background: #0f172a;
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.2);
        }

        .header-actions {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .btn-secondary {
            background: white;
            color: #0f172a;
            border: 1px solid #e2e8f0;
            padding: 12px 24px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-secondary:hover {
            background: #f1f5f9;
            border-color: #cbd5e1;
        }

        .badge-count {
            background: #ef4444;
            color: white;
            font-size: 0.75rem;
            padding: 2px 8px;
            border-radius: 10px;
            min-width: 20px;
            text-align: center;
        }

        .stat-card.messages {
            text-decoration: none;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            display: block; /* Ensure it behaves like a block for layout */
        }

        .stat-card.messages:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            border-color: #3b82f6;
        }

        .stat-card.messages .stat-value {
            color: #3b82f6;
        }

        /* Stats */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .stat-card {
            background: white;
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
        }

        .stat-card h3 {
            font-size: 0.9rem;
            color: #64748b;
            margin-bottom: 8px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-value {
            font-size: 2.5rem;
            font-weight: 800;
            color: #0f172a;
            line-height: 1;
        }

        .stat-card.active .stat-value { color: #10b981; }
        .stat-card.sold .stat-value { color: #64748b; }

        /* Filters */
        .filters-bar {
            display: flex;
            gap: 10px;
            margin-bottom: 24px;
            overflow-x: auto;
            padding-bottom: 4px;
        }

        .filter-btn {
            background: white;
            border: 1px solid #e2e8f0;
            padding: 8px 16px;
            border-radius: 30px;
            font-weight: 600;
            color: #64748b;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
        }

        .filter-btn:hover { background: #f1f5f9; }
        .filter-btn.active {
            background: #0f172a;
            color: white;
            border-color: #0f172a;
        }

        /* Grid */
        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
        }

        .property-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          border: 1px solid #f1f5f9;
        }
        .property-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }

        .card-image-wrapper {
          position: relative;
          height: 220px;
          background: #f1f5f9;
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card-badge {
          position: absolute;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          backdrop-filter: blur(4px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          z-index: 2;
        }
        .card-badge.type {
            top: 16px;
            left: 16px;
            background: rgba(255,255,255,0.95);
            color: #0f172a;
        }
        .card-badge.status {
            bottom: 16px;
            left: 16px;
            color: white;
        }
        .card-badge.status.sold { background: #ef4444; }
        .card-badge.status.reserved { background: #f59e0b; }

        .card-overlay {
            position: absolute;
            top: 16px;
            right: 16px;
            display: flex;
            gap: 8px;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.2s;
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
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s;
            text-decoration: none;
        }
        .btn-icon:hover { transform: scale(1.1); }
        .btn-icon.delete { color: #ef4444; }
        .btn-icon.edit { color: #0f172a; }

        .card-content { padding: 20px; }
        
        .card-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .card-details {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
            color: #64748b;
            margin-bottom: 12px;
        }

        .card-price {
            font-size: 1.25rem;
            font-weight: 800;
            color: #0f172a;
        }

        .empty-state {
            text-align: center;
            padding: 60px;
            background: white;
            border-radius: 20px;
            border: 2px dashed #e2e8f0;
        }
        .empty-icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.5; }
        .btn-link { 
            background: none; 
            border: none; 
            color: #0f172a; 
            font-weight: 700; 
            text-decoration: underline; 
            cursor: pointer; 
            margin-top: 10px;
        }

        .loading-screen {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #0f172a;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
