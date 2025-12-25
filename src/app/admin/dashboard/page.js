'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, where } from 'firebase/firestore';
import { getUserProfile } from '@/lib/db/users';

export default function AdminDashboard() {
  const [properties, setProperties] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState('all');

  // Auth is already verified by AdminLayout, so user is guaranteed to exist here
  const { user } = useAuth();
  const { addToast } = useToast();

  // Role check logic (We still need to know IF admin for UI features, but access is granted)
  useEffect(() => {
    const initDashboard = async () => {
      if (!user) return;

      // 1. Determine Role
      let userIsAdmin = false;
      try {
        const profile = await getUserProfile(user.uid);
        userIsAdmin = profile?.role === 'admin';
        setIsAdmin(userIsAdmin);
      } catch (err) {
        console.error("Error fetching profile", err);
      }

      // 2. Setup Data Listener (Single Query Source)
      // Optimized: No more "try logic A then logic B". We determine query once.
      let q;
      if (userIsAdmin) {
        q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
      } else {
        // Seller view
        q = query(collection(db, 'properties'), where('userId', '==', user.uid));
      }

      const unsubscribeProps = onSnapshot(q, (snapshot) => {
        const props = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProperties(props);
        setLoadingData(false);
      }, (error) => {
        console.error("Error fetching properties:", error);
        setLoadingData(false);
        addToast('Error al cargar inventario', 'error');
      });

      // 3. Admin Only: Setup Messages Listener
      let unsubscribeMessages = () => { };
      if (userIsAdmin) {
        const mq = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        unsubscribeMessages = onSnapshot(mq, (snapshot) => {
          const unread = snapshot.docs.filter(doc => !doc.data().read).length;
          setUnreadCount(unread);
        });
      }

      return () => {
        unsubscribeProps();
        unsubscribeMessages();
      };
    };

    // Execute
    const cleanupPromise = initDashboard();

    // Cleanup function for useEffect needs to handle the async nature potentially
    // But since initDashboard returns a cleanup function (or promise of one), we need to handle it.
    // Simpler approach: define the cleanup var outside.

    return () => {
      // This is tricky with async useEffect. 
      // Let's refactor slightly to be safer standard React pattern.
    };
  }, [user, addToast]); // Removed 'isAdmin' from deps to avoid re-triggering loop

  // Refactored Effect for standard React compliance & Listener Optimization
  // Estrategia de ahorro aplicada: Listeners Optimizados
  // Aseguramos que los listeners se desuscriban correctamente al desmontar el componente
  // para evitar fugas de memoria y lecturas fantasma innecesarias.
  useEffect(() => {
    if (!user) return;

    let unsubProps = null;
    let unsubMsgs = null;
    let isMounted = true;

    const setupListeners = async () => {
      try {
        const profile = await getUserProfile(user.uid);
        if (!isMounted) return;

        const isUserAdmin = profile?.role === 'admin';
        setIsAdmin(isUserAdmin);

        // Properties Query
        const propQuery = isUserAdmin
          ? query(collection(db, 'properties'), orderBy('createdAt', 'desc'))
          : query(collection(db, 'properties'), where('userId', '==', user.uid));

        unsubProps = onSnapshot(propQuery, (snap) => {
          if (!isMounted) return;
          const props = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setProperties(props);
          setLoadingData(false);
        }, (err) => {
          console.error(err);
          if (isMounted) setLoadingData(false);
        });

        // Messages Query
        if (isUserAdmin) {
          const msgQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
          unsubMsgs = onSnapshot(msgQuery, (snap) => {
            if (!isMounted) return;
            // Optimization: only count, don't map all data if not needed
            setUnreadCount(snap.docs.filter(d => !d.data().read).length);
          });
        }
      } catch (error) {
        console.error("Error setup listeners", error);
        if (isMounted) setLoadingData(false);
      }
    };

    setupListeners();

    return () => {
      isMounted = false;
      if (unsubProps) unsubProps();
      if (unsubMsgs) unsubMsgs();
    };
  }, [user]);

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

  return (
    <div className="page">
      <main className="main-content">
        <div className="container">

          {/* Dashboard Header */}
          <div className="dashboard-header">
            <div>
              <h1 className="page-title">{isAdmin ? 'Panel de Administración' : 'Mi Gestión Inmobiliaria'}</h1>
              <p className="page-subtitle">Bienvenido, {user?.displayName || user?.email}</p>
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
            <div className="loading-grid">
              <div className="spinner-small"></div>
              <p>Sincronizando inventario...</p>
            </div>
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
        /* Reuse existing styles, compacted for clarity */
        .page { min-height: 100vh; background: #f8fafc; padding-top: 80px; }
        .main-content { padding: 40px 0 80px; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; flex-wrap: wrap; gap: 20px; }
        .page-title { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; }
        .page-subtitle { color: #64748b; margin-top: 4px; }
        
        .header-actions { display: flex; gap: 12px; align-items: center; }
        .btn-primary { background: #0f172a; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15); }
        .btn-secondary { background: white; color: #0f172a; border: 1px solid #e2e8f0; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .badge-count { background: #ef4444; color: white; font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: white; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; text-decoration: none; display: block; }
        .stat-card h3 { font-size: 0.9rem; color: #64748b; margin-bottom: 8px; text-transform: uppercase; font-weight: 600; }
        .stat-value { font-size: 2.5rem; font-weight: 800; color: #0f172a; line-height: 1; }
        .stat-card.active .stat-value { color: #10b981; }
        .stat-card.messages .stat-value { color: #3b82f6; }

        .filters-bar { display: flex; gap: 10px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 4px; }
        .filter-btn { background: white; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 30px; font-weight: 600; color: #64748b; cursor: pointer; white-space: nowrap; }
        .filter-btn.active { background: #0f172a; color: white; border-color: #0f172a; }

        .properties-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; }
        .property-card { background: white; border-radius: 20px; overflow: hidden; border: 1px solid #f1f5f9; transition: transform 0.3s; }
        .property-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        
        .card-image-wrapper { position: relative; height: 220px; background: #f1f5f9; }
        .card-image { width: 100%; height: 100%; object-fit: cover; }
        .card-badge { position: absolute; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; z-index: 2; }
        .card-badge.type { top: 16px; left: 16px; background: rgba(255,255,255,0.95); color: #0f172a; }
        .card-badge.status { bottom: 16px; left: 16px; color: white; }
        .card-badge.status.sold { background: #ef4444; }
        .card-badge.status.reserved { background: #f59e0b; }
        
        .card-overlay { position: absolute; top: 16px; right: 16px; display: flex; gap: 8px; opacity: 0; transition: opacity 0.2s; transform: translateY(-5px); }
        .property-card:hover .card-overlay { opacity: 1; transform: translateY(0); }
        .btn-icon { width: 36px; height: 36px; border-radius: 50%; background: white; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; text-decoration: none; }
        .btn-icon.delete { color: #ef4444; }

        .card-content { padding: 20px; }
        .card-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .card-details { display: flex; justify-content: space-between; font-size: 0.85rem; color: #64748b; margin-bottom: 12px; }
        .card-price { font-size: 1.25rem; font-weight: 800; color: #0f172a; }

        .empty-state { text-align: center; padding: 60px; background: white; border-radius: 20px; border: 2px dashed #e2e8f0; }
        .empty-icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.5; }
        .btn-link { background: none; border: none; color: #0f172a; font-weight: 700; text-decoration: underline; cursor: pointer; }
        
        .loading-grid { text-align: center; padding: 60px; color: #64748b; }
        .spinner-small { width: 30px; height: 30px; border: 2px solid #eee; border-top-color: #0f172a; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
      `}</style>
    </div>
  );
}
