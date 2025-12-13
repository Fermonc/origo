'use client';

import { useState, useEffect } from 'react';
import { getUserAlerts, createAlert, deleteAlert } from '@/lib/db/alerts';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import PropertyCard from '@/components/PropertyCard';
import dynamic from 'next/dynamic';

const RadiusMapPicker = dynamic(() => import('./admin/RadiusMapPicker'), {
    ssr: false,
    loading: () => <div style={{height: '300px', background: '#eee'}}>Cargando mapa...</div>
});

export default function UserAlerts({ user }) {
    const [alerts, setAlerts] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [matches, setMatches] = useState({});
    const [loadingMatches, setLoadingMatches] = useState({});

    // Expanded Criteria State
    const [criteria, setCriteria] = useState({
        type: 'Apartamento',
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        bathrooms: '',
        locationText: '', // User's name for the location
        mapCenter: { lat: 6.2442, lng: -75.5812 }, // Default Medellin
        radius: 5 // km
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
            // Don't auto-run client side match on load for complex queries, or keep it simple.
            // We'll try to run a simple version.
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
            // Client-side matching is limited. We'll do a basic query and filter manually.
            let q = query(
                collection(db, 'properties'),
                where('type', '==', alertItem.criteria.type),
                limit(20)
            );

            const querySnapshot = await getDocs(q);
            const results = [];

            querySnapshot.forEach(doc => {
                const data = doc.data();
                let matches = true;

                // Price
                if (alertItem.criteria.minPrice > 0) {
                     // Parse price if string
                     const pPrice = Number(data.price) || 0;
                     if (pPrice < alertItem.criteria.minPrice) matches = false;
                }
                if (alertItem.criteria.maxPrice > 0) {
                     const pPrice = Number(data.price) || 0;
                     if (pPrice > alertItem.criteria.maxPrice) matches = false;
                }

                // Rooms/Baths
                if (alertItem.criteria.bedrooms && data.bedrooms < alertItem.criteria.bedrooms) matches = false;
                if (alertItem.criteria.bathrooms && data.bathrooms < alertItem.criteria.bathrooms) matches = false;

                // Geo check (Basic Haversine)
                if (alertItem.criteria.mapCenter && data.coordinates) {
                    const dist = getDistanceFromLatLonInKm(
                        alertItem.criteria.mapCenter.lat,
                        alertItem.criteria.mapCenter.lng,
                        data.coordinates.lat,
                        data.coordinates.lng
                    );
                    if (dist > alertItem.criteria.radius) matches = false;
                }

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
                minPrice: criteria.minPrice ? Number(criteria.minPrice) : 0,
                maxPrice: criteria.maxPrice ? Number(criteria.maxPrice) : 0,
                bedrooms: criteria.bedrooms ? Number(criteria.bedrooms) : 0,
                bathrooms: criteria.bathrooms ? Number(criteria.bathrooms) : 0,
                locationText: criteria.locationText,
                mapCenter: criteria.mapCenter,
                radius: criteria.radius
            };

            await createAlert(user.uid, cleanCriteria, preferences);
            setShowForm(false);
            // Reset form
            setCriteria({
                type: 'Apartamento',
                minPrice: '',
                maxPrice: '',
                bedrooms: '',
                bathrooms: '',
                locationText: '',
                mapCenter: { lat: 6.2442, lng: -75.5812 },
                radius: 5
            });
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

    // Haversine formula
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1);
        var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

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
                                <label>Tipo de Inmueble</label>
                                <select value={criteria.type} onChange={(e) => setCriteria({ ...criteria, type: e.target.value })}>
                                    <option value="Apartamento">Apartamento</option>
                                    <option value="Casa">Casa</option>
                                    <option value="Lote">Lote</option>
                                    <option value="Finca">Finca</option>
                                    <option value="Local">Local</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Nombre de Zona (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: El Poblado, Rionegro..."
                                    value={criteria.locationText}
                                    onChange={(e) => setCriteria({ ...criteria, locationText: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-grid four-cols">
                            <div className="form-group">
                                <label>Min Precio</label>
                                <input type="number" placeholder="0" value={criteria.minPrice} onChange={(e) => setCriteria({ ...criteria, minPrice: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Max Precio</label>
                                <input type="number" placeholder="Sin límite" value={criteria.maxPrice} onChange={(e) => setCriteria({ ...criteria, maxPrice: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Habitaciones (Mín)</label>
                                <input type="number" placeholder="0" value={criteria.bedrooms} onChange={(e) => setCriteria({ ...criteria, bedrooms: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Baños (Mín)</label>
                                <input type="number" placeholder="0" value={criteria.bathrooms} onChange={(e) => setCriteria({ ...criteria, bathrooms: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group map-section">
                            <label>Ubicación y Radio de Búsqueda</label>
                            <p className="help-text">Arrastra el marcador al centro de la zona de interés y ajusta el radio.</p>
                            <RadiusMapPicker
                                center={criteria.mapCenter}
                                radius={criteria.radius}
                                onCenterChange={(c) => setCriteria({...criteria, mapCenter: c})}
                                onRadiusChange={(r) => setCriteria({...criteria, radius: r})}
                            />
                        </div>

                        <div className="preferences-section">
                            <label><input type="checkbox" checked={preferences.email} onChange={(e) => setPreferences({ ...preferences, email: e.target.checked })} /> Notificar por Email</label>
                            {/* Push not yet implemented but UI present */}
                            {/* <label><input type="checkbox" checked={preferences.push} onChange={(e) => setPreferences({ ...preferences, push: e.target.checked })} /> Notificación Push</label> */}
                        </div>
                        <button type="submit" className="btn-save" disabled={creating}>{creating ? 'Guardando...' : 'Guardar Alerta'}</button>
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
                                    {alertItem.criteria.locationText && <span className="alert-zone">{alertItem.criteria.locationText}</span>}
                                    <span className="alert-radius">Radio: {alertItem.criteria.radius}km</span>
                                    <span className="alert-price">
                                        {alertItem.criteria.minPrice > 0 ? `$${alertItem.criteria.minPrice.toLocaleString()}` : '$0'} -
                                        {alertItem.criteria.maxPrice > 0 ? `$${alertItem.criteria.maxPrice.toLocaleString()}` : ' ∞'}
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
                                ) : <p className="no-matches">Sin coincidencias actuales en la base de datos.</p>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : !showForm && (
                <div className="empty-state">
                    <p>No tienes alertas activas. Crea una para recibir notificaciones.</p>
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
                .header-section h3 { margin: 0 0 4px 0; font-size: 1.25rem; font-weight: 700; }
                .header-section p { color: #666; margin: 0; font-size: 0.9rem; }
                
                .btn-create { background: #111; color: white; border: none; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 600; transition: background 0.2s; }
                .btn-create:hover { background: #333; }

                .alert-form-card { background: #fff; padding: 24px; border-radius: 16px; margin-bottom: 32px; border: 1px solid #eee; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .alert-form-card h4 { margin-top: 0; margin-bottom: 20px; font-size: 1.1rem; }
                
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
                .form-grid.four-cols { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); }
                
                .form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; color: #333; }
                .form-group input, .form-group select { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e0e0e0; background: #fcfcfc; }
                .form-group input:focus, .form-group select:focus { border-color: #111; outline: none; background: #fff; }

                .help-text { font-size: 0.8rem; color: #777; margin: 0 0 8px 0; }
                .map-section { margin-top: 20px; margin-bottom: 20px; }

                .preferences-section { display: flex; gap: 16px; margin-bottom: 20px; padding: 12px; background: #f5f5f5; border-radius: 8px; }
                .preferences-section label { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer; margin: 0; }
                
                .btn-save { width: 100%; background: #111; color: white; border: none; padding: 12px; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 1rem; }
                .btn-save:hover { background: #000; }
                
                .alerts-list { display: flex; flex-direction: column; gap: 20px; }
                .alert-wrapper { border: 1px solid #eee; border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
                .alert-card { padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f5f5f5; }
                .alert-info { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
                .alert-type { font-weight: 700; color: #111; }
                .alert-zone, .alert-radius { background: #f0f0f0; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; color: #555; }
                .alert-price { font-family: monospace; color: #666; font-size: 0.9rem; margin-left: auto; }
                .btn-delete { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 8px; border-radius: 50%; transition: background 0.2s; }
                .btn-delete:hover { background: #fee2e2; }
                
                .matches-section { background: #fafafa; padding: 16px; }
                .matches-header { font-size: 0.75rem; font-weight: 700; color: #888; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }
                .matches-scroll { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; scroll-behavior: smooth; }
                .matches-scroll::-webkit-scrollbar { height: 6px; }
                .matches-scroll::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
                .mini-card { min-width: 240px; width: 240px; }
                .no-matches { font-size: 0.9rem; color: #999; font-style: italic; margin: 0; }
                
                .empty-state { text-align: center; padding: 60px 20px; color: #888; background: #f9f9f9; border-radius: 16px; border: 2px dashed #eee; }
                
                @media (max-width: 600px) {
                    .form-grid { grid-template-columns: 1fr; }
                    .alert-info { gap: 8px; }
                    .alert-price { width: 100%; margin-left: 0; margin-top: 4px; }
                }
            `}</style>
        </div>
    );
}
