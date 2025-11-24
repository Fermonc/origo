'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserAlerts, createAlert, deleteAlert } from '@/lib/db/alerts';

export default function AlertsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [alerts, setAlerts] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [criteria, setCriteria] = useState({
        type: 'Apartamento',
        minPrice: '',
        maxPrice: '',
        zone: 'Norte'
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            loadAlerts();
        }
    }, [user, loading, router]);

    const loadAlerts = async () => {
        setFetching(true);
        try {
            const data = await getUserAlerts(user.uid);
            setAlerts(data);
        } catch (error) {
            console.error("Error loading alerts:", error);
        } finally {
            setFetching(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            // Clean up criteria
            const cleanCriteria = {
                type: criteria.type,
                zone: criteria.zone,
                minPrice: criteria.minPrice ? Number(criteria.minPrice) : 0,
                maxPrice: criteria.maxPrice ? Number(criteria.maxPrice) : 0
            };

            await createAlert(user.uid, cleanCriteria);
            setShowForm(false);
            setCriteria({ type: 'Apartamento', minPrice: '', maxPrice: '', zone: 'Norte' }); // Reset
            loadAlerts();
        } catch (error) {
            console.error("Error creating alert:", error);
            alert('Error al crear la alerta');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (alertItem) => {
        if (!confirm('¿Estás seguro de eliminar esta alerta?')) return;
        try {
            await deleteAlert(user.uid, alertItem);
            loadAlerts();
        } catch (error) {
            console.error("Error deleting alert:", error);
        }
    };

    if (loading || !user) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="alerts-page">
            <div className="container">
                <div className="header">
                    <div>
                        <h1>Mis Alertas</h1>
                        <p>Recibe notificaciones cuando publiquemos propiedades que te interesen.</p>
                    </div>
                    <button
                        className="btn-create"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancelar' : '+ Nueva Alerta'}
                    </button>
                </div>

                {showForm && (
                    <div className="alert-form-card">
                        <h3>Crear Nueva Alerta</h3>
                        <form onSubmit={handleCreate}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Tipo de Propiedad</label>
                                    <select
                                        value={criteria.type}
                                        onChange={(e) => setCriteria({ ...criteria, type: e.target.value })}
                                    >
                                        <option value="Apartamento">Apartamento</option>
                                        <option value="Casa">Casa</option>
                                        <option value="Lote">Lote</option>
                                        <option value="Local">Local</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Zona</label>
                                    <select
                                        value={criteria.zone}
                                        onChange={(e) => setCriteria({ ...criteria, zone: e.target.value })}
                                    >
                                        <option value="Norte">Norte</option>
                                        <option value="Sur">Sur</option>
                                        <option value="Centro">Centro</option>
                                        <option value="Occidente">Occidente</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Precio Mínimo</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={criteria.minPrice}
                                        onChange={(e) => setCriteria({ ...criteria, minPrice: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Precio Máximo</label>
                                    <input
                                        type="number"
                                        placeholder="Sin límite"
                                        value={criteria.maxPrice}
                                        onChange={(e) => setCriteria({ ...criteria, maxPrice: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-save" disabled={creating}>
                                {creating ? 'Creando...' : 'Guardar Alerta'}
                            </button>
                        </form>
                    </div>
                )}

                {fetching ? (
                    <div className="loading-grid">Cargando alertas...</div>
                ) : alerts.length > 0 ? (
                    <div className="alerts-grid">
                        {alerts.map(alertItem => (
                            <div key={alertItem.id} className="alert-card">
                                <div className="alert-info">
                                    <div className="alert-header">
                                        <span className="alert-type">{alertItem.criteria.type}</span>
                                        <span className="alert-zone">📍 {alertItem.criteria.zone}</span>
                                    </div>
                                    <div className="alert-price">
                                        {alertItem.criteria.minPrice > 0 ? `$${alertItem.criteria.minPrice}` : '$0'} -
                                        {alertItem.criteria.maxPrice > 0 ? `$${alertItem.criteria.maxPrice}` : ' Sin límite'}
                                    </div>
                                </div>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDelete(alertItem)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    !showForm && (
                        <div className="empty-state">
                            <div className="empty-icon">🔔</div>
                            <h2>No tienes alertas activas</h2>
                            <p>Crea una alerta para enterarte primero de las mejores oportunidades.</p>
                        </div>
                    )
                )}
            </div>

            <style jsx>{`
        .alerts-page {
          min-height: 100vh;
          background-color: #f8f9fa;
          padding: 40px 0;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #111;
          margin: 0 0 8px 0;
        }

        .header p {
          color: #666;
          margin: 0;
        }

        .btn-create {
          padding: 12px 24px;
          background: #111;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-create:hover {
          background: #333;
        }

        .alert-form-card {
          background: white;
          padding: 32px;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          margin-bottom: 32px;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .alert-form-card h3 {
          margin: 0 0 24px 0;
          font-size: 1.25rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        @media (max-width: 600px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          font-size: 1rem;
          background: white;
        }

        .btn-save {
          width: 100%;
          padding: 14px;
          background: #111;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .alerts-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .alert-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }

        .alert-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .alert-type {
          font-weight: 700;
          font-size: 1.1rem;
          color: #111;
        }

        .alert-zone {
          font-size: 0.9rem;
          color: #666;
          background: #f0f0f0;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .alert-price {
          color: #555;
          font-family: monospace;
          font-size: 0.95rem;
        }

        .btn-delete {
          padding: 8px 16px;
          background: #fee2e2;
          color: #ef4444;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-delete:hover {
          background: #fecaca;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .empty-state h2 {
          font-size: 1.5rem;
          color: #111;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          color: #666;
        }

        .loading, .loading-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          font-size: 1.2rem;
          color: #666;
        }
      `}</style>
        </div>
    );
}
