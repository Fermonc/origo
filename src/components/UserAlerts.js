'use client';

import { useState, useEffect } from 'react';
import { getUserAlerts, createAlert, deleteAlert } from '@/lib/db/alerts';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import PropertyCard from '@/components/PropertyCard';

export default function UserAlerts({ user }) {
    const [alerts, setAlerts] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [matches, setMatches] = useState({});
    const [loadingMatches, setLoadingMatches] = useState({});

    const [criteria, setCriteria] = useState({
        type: 'Apartamento',
        minPrice: '',
        maxPrice: '',
        zone: 'Norte'
    });
    const [preferences, setPreferences] = useState({
        email: true,
        push: true
    });

    useEffect(() => {
        if (user) {
            loadAlerts();
        }
    }, [user]);

    const loadAlerts = async () => {
        setFetching(true);
        try {
            const data = await getUserAlerts(user.uid);
            setAlerts(data);
            data.forEach(alert => findMatches(alert));
        } catch (error) {
            console.error("Error loading alerts:", error);
        } finally {
            setFetching(false);
        }
    };

    const findMatches = async (alertItem) => {
        setLoadingMatches(prev => ({ ...prev, [alertItem.id]: true }));
        try {
            let q = query(
                collection(db, 'properties'),
                where('type', '==', alertItem.criteria.type),
                limit(10)
            );

            const querySnapshot = await getDocs(q);
            const results = [];

            querySnapshot.forEach(doc => {
                const data = doc.data();
                let matches = true;
                if (alertItem.criteria.zone && data.zone !== alertItem.criteria.zone) matches = false;
                if (alertItem.criteria.minPrice > 0 && data.price < alertItem.criteria.minPrice) matches = false;
                if (alertItem.criteria.maxPrice > 0 && data.price > alertItem.criteria.maxPrice) matches = false;

                if (matches) results.push({ id: doc.id, ...data });
            });

            setMatches(prev => ({ ...prev, [alertItem.id]: results }));
        } catch (error) {
            console.error("Error finding matches:", error);
        } finally {
            setLoadingMatches(prev => ({ ...prev, [alertItem.id]: false }));
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const cleanCriteria = {
                type: criteria.type,
                zone: criteria.zone,
                minPrice: criteria.minPrice ? Number(criteria.minPrice) : 0,
                maxPrice: criteria.maxPrice ? Number(criteria.maxPrice) : 0
            };

            await createAlert(user.uid, cleanCriteria, preferences);
            setShowForm(false);
            setCriteria({ type: 'Apartamento', minPrice: '', maxPrice: '', zone: 'Norte' });
            setPreferences({ email: true, push: true });
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

    return (
        <div className="alerts-container">
            <div className="header-section">
                <div>
                    <h3>Mis Alertas</h3>
                    <p>Recibe notificaciones de nuevas oportunidades.</p>
                </div>
                <button className="btn-create" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancelar' : '+ Nueva Alerta'}
                </button>
            </div>

            {showForm && (
                <div className="alert-form-card">
                    <h4>Crear Nueva Alerta</h4>
                    <form onSubmit={handleCreate}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Tipo</label>
                                <select value={criteria.type} onChange={(e) => setCriteria({ ...criteria, type: e.target.value })}>
                                    <option value="Apartamento">Apartamento</option>
                                    <option value="Casa">Casa</option>
                                    <option value="Lote">Lote</option>
                                    <option value="Finca">Finca</option>
                                    <option value="Local">Local</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Zona</label>
                                <select value={criteria.zone} onChange={(e) => setCriteria({ ...criteria, zone: e.target.value })}>
                                    <option value="Norte">Norte</option>
                                    <option value="Sur">Sur</option>
                                    <option value="Centro">Centro</option>
                                    <option value="Occidente">Occidente</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Min Precio</label>
                                <input type="number" placeholder="0" value={criteria.minPrice} onChange={(e) => setCriteria({ ...criteria, minPrice: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Max Precio</label>
                                <input type="number" placeholder="Sin límite" value={criteria.maxPrice} onChange={(e) => setCriteria({ ...criteria, maxPrice: e.target.value })} />
                            </div>
                        </div>
                        <div className="preferences-section">
                            <label><input type="checkbox" checked={preferences.email} onChange={(e) => setPreferences({ ...preferences, email: e.target.checked })} /> Email</label>
                            <label><input type="checkbox" checked={preferences.push} onChange={(e) => setPreferences({ ...preferences, push: e.target.checked })} /> Celular</label>
                        </div>
                        <button type="submit" className="btn-save" disabled={creating}>{creating ? 'Creando...' : 'Guardar'}</button>
                    </form>
                </div>
            )}

            {fetching ? (
                <div className="loading">Cargando alertas...</div>
            ) : alerts.length > 0 ? (
                <div className="alerts-list">
                    {alerts.map(alertItem => (
                        <div key={alertItem.id} className="alert-wrapper">
                            <div className="alert-card">
                                <div className="alert-info">
                                    <span className="alert-type">{alertItem.criteria.type}</span>
                                    <span className="alert-zone">{alertItem.criteria.zone}</span>
                                    <span className="alert-price">
                                        {alertItem.criteria.minPrice > 0 ? `$${alertItem.criteria.minPrice}` : '$0'} -
                                        {alertItem.criteria.maxPrice > 0 ? `$${alertItem.criteria.maxPrice}` : '∞'}
                                    </span>
                                </div>
                                <button className="btn-delete" onClick={() => handleDelete(alertItem)}>🗑️</button>
                            </div>

                            {/* Matches */}
                            <div className="matches-section">
                                <div className="matches-header">Inmuebles encontrados ({matches[alertItem.id]?.length || 0})</div>
                                {matches[alertItem.id]?.length > 0 ? (
                                    <div className="matches-scroll">
                                        {matches[alertItem.id].map(p => (
                                            <div key={p.id} className="mini-card"><PropertyCard property={p} compact={true} /></div>
                                        ))}
                                    </div>
                                ) : <p className="no-matches">Sin coincidencias aún.</p>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : !showForm && (
                <div className="empty-state">
                    <p>No tienes alertas activas.</p>
                </div>
            )}

            <style jsx>{`
                .alerts-container {
                    background: white;
                    border-radius: 20px;
                    padding: 32px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                }
                .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .header-section h3 { margin: 0 0 4px 0; font-size: 1.25rem; }
                .header-section p { color: #666; margin: 0; font-size: 0.9rem; }
                
                .btn-create { background: #111; color: white; border: none; padding: 8px 16px; border-radius: 10px; cursor: pointer; font-weight: 600; }
                
                .alert-form-card { background: #f9f9f9; padding: 20px; border-radius: 16px; margin-bottom: 24px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
                .form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; }
                .form-group input, .form-group select { width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd; }
                
                .preferences-section { display: flex; gap: 16px; margin-bottom: 16px; }
                .preferences-section label { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; cursor: pointer; }
                
                .btn-save { width: 100%; background: #111; color: white; border: none; padding: 10px; border-radius: 10px; cursor: pointer; font-weight: 600; }
                
                .alerts-list { display: flex; flex-direction: column; gap: 16px; }
                .alert-wrapper { border: 1px solid #eee; border-radius: 12px; overflow: hidden; }
                .alert-card { padding: 16px; display: flex; justify-content: space-between; align-items: center; background: white; }
                .alert-info { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
                .alert-type { font-weight: 700; }
                .alert-zone { background: #f0f0f0; padding: 2px 8px; border-radius: 12px; font-size: 0.85rem; }
                .alert-price { font-family: monospace; color: #666; font-size: 0.9rem; }
                .btn-delete { background: none; border: none; cursor: pointer; font-size: 1.1rem; }
                
                .matches-section { background: #fafafa; padding: 12px 16px; border-top: 1px solid #eee; }
                .matches-header { font-size: 0.8rem; font-weight: 700; color: #666; text-transform: uppercase; margin-bottom: 8px; }
                .matches-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; }
                .mini-card { min-width: 220px; width: 220px; }
                .no-matches { font-size: 0.85rem; color: #999; font-style: italic; margin: 0; }
                
                .empty-state { text-align: center; padding: 40px; color: #666; }
                
                @media (max-width: 600px) {
                    .form-grid { grid-template-columns: 1fr; }
                    .alert-info { gap: 8px; }
                }
            `}</style>
        </div>
    );
}
