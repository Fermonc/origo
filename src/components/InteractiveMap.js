'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MapPopup from './MapPopup';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map view updates
function MapController({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 14);
        }
    }, [center, map]);
    return null;
}

export default function InteractiveMap({ properties }) {
    const [filters, setFilters] = useState({
        type: 'all',
        minPrice: '',
        maxPrice: '',
    });
    const [userLocation, setUserLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState([6.1551, -75.3737]); // Default: Rionegro
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filter properties
    const filteredProperties = useMemo(() => {
        return properties.filter(p => {
            // Type filter
            if (filters.type !== 'all' && p.type !== filters.type) return false;

            // Price filter (simple parsing, assuming format like "$100.000.000")
            if (filters.minPrice || filters.maxPrice) {
                const price = parseInt(p.price.replace(/\D/g, ''));
                if (filters.minPrice && price < parseInt(filters.minPrice)) return false;
                if (filters.maxPrice && price > parseInt(filters.maxPrice)) return false;
            }

            return true;
        });
    }, [properties, filters]);

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPos = [latitude, longitude];
                    setUserLocation(newPos);
                    setMapCenter(newPos);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("No pudimos obtener tu ubicación. Asegúrate de dar permisos.");
                }
            );
        }
    };

    return (
        <div className="map-wrapper">
            {/* Map Container */}
            <div className="map-container">
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapController center={mapCenter} />

                    {/* User Location Marker */}
                    {userLocation && (
                        <Marker position={userLocation} icon={new L.Icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        })}>
                            <Popup>Estás aquí</Popup>
                        </Marker>
                    )}

                    {/* Property Markers */}
                    {filteredProperties.map(property => {
                        // Fallback if coords are missing (should be validated in data)
                        if (!property.lat || !property.lng) return null;

                        return (
                            <Marker key={property.id} position={[property.lat, property.lng]}>
                                <Popup className="custom-popup">
                                    <MapPopup property={property} />
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>

            {/* Floating UI Controls */}
            <div className="map-ui">
                {/* Search/Filter Bar */}
                <div className="search-bar">
                    <div className="search-input-group">
                        <span className="search-icon">🔍</span>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="type-select"
                        >
                            <option value="all">Todos los tipos</option>
                            <option value="Lote">Lotes</option>
                            <option value="Finca">Fincas</option>
                            <option value="Local">Locales</option>
                        </select>
                    </div>

                    <button
                        className={`filter-toggle ${isFilterOpen ? 'active' : ''}`}
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        Filtros
                    </button>
                </div>

                {/* Expanded Filters */}
                {isFilterOpen && (
                    <div className="filters-panel">
                        <div className="filter-group">
                            <label>Precio Mínimo</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            />
                        </div>
                        <div className="filter-group">
                            <label>Precio Máximo</label>
                            <input
                                type="number"
                                placeholder="Sin límite"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            />
                        </div>
                        <div className="filter-results">
                            {filteredProperties.length} propiedades encontradas
                        </div>
                    </div>
                )}

                {/* Floating Action Buttons */}
                <div className="fab-container">
                    <button className="fab" onClick={handleLocateMe} title="Cerca de mí">
                        📍
                    </button>
                </div>
            </div>

            <style jsx>{`
        .map-wrapper {
          position: relative;
          height: calc(100vh - 60px); /* Adjust for bottom nav/header if needed */
          width: 100%;
          overflow: hidden;
        }
        .map-container {
          height: 100%;
          width: 100%;
          z-index: 0;
        }
        
        /* UI Overlay */
        .map-ui {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 600px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .search-bar {
          background: white;
          border-radius: 50px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .search-input-group {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .type-select {
          border: none;
          background: transparent;
          font-size: 1rem;
          color: var(--color-text-main);
          width: 100%;
          outline: none;
          cursor: pointer;
        }

        .filter-toggle {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-toggle.active {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .filters-panel {
          background: white;
          padding: 16px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .filter-group {
          margin-bottom: 12px;
        }

        .filter-group label {
          display: block;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-bottom: 4px;
        }

        .filter-group input {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-size: 1rem;
        }

        .filter-results {
          text-align: center;
          font-size: 0.9rem;
          color: var(--color-secondary);
          font-weight: 600;
          margin-top: 8px;
        }

        .fab-container {
          position: absolute;
          bottom: -80vh; /* Push to bottom right relative to top container, hacky but works within relative parent */
          right: -45%; /* Adjust based on parent width */
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        /* Better positioning for FAB */
        @media (min-width: 768px) {
           .fab-container {
             position: fixed;
             bottom: 30px;
             right: 30px;
           }
        }
        
        /* Mobile FAB positioning override */
        @media (max-width: 767px) {
          .fab-container {
            position: fixed;
            bottom: 90px; /* Above bottom nav */
            right: 20px;
          }
        }

        .fab {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: white;
          border: none;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .fab:active {
          transform: scale(0.95);
        }
      `}</style>
        </div>
    );
}
