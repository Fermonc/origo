'use client';

import { useState, useEffect } from 'react';

export default function MapSidebar({
    locations,
    filters,
    setFilters,
    onLocationSelect,
    isOpen,
    onClose
}) {
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedZone, setSelectedZone] = useState('');

    // Update local state when filters change externally
    useEffect(() => {
        if (filters.city !== selectedCity) setSelectedCity(filters.city);
        if (filters.zone !== selectedZone) setSelectedZone(filters.zone);
    }, [filters]);

    const handleCityChange = (e) => {
        const city = e.target.value;
        setSelectedCity(city);
        setSelectedZone(''); // Reset zone
        setFilters(prev => ({ ...prev, city, zone: '' }));

        // Find city coords and center map
        const cityData = locations.find(l => l.name === city);
        if (cityData) {
            onLocationSelect(cityData.coords, 13);
        }
    };

    const handleZoneChange = (e) => {
        const zone = e.target.value;
        setSelectedZone(zone);
        setFilters(prev => ({ ...prev, zone }));

        // Find zone coords
        const cityData = locations.find(l => l.name === selectedCity);
        if (cityData) {
            const zoneData = cityData.zones.find(z => z.name === zone);
            if (zoneData) {
                onLocationSelect(zoneData.coords, 15);
            }
        }
    };

    const handleTypeToggle = (type) => {
        setFilters(prev => ({
            ...prev,
            type: prev.type === type ? 'all' : type
        }));
    };

    const amenitiesList = [
        'Parqueadero', 'Patio', 'Estudio', 'Balcón', 'Portería', 'Ascensor'
    ];

    const handleAmenityToggle = (amenity) => {
        setFilters(prev => {
            const current = prev.amenities || [];
            if (current.includes(amenity)) {
                return { ...prev, amenities: current.filter(a => a !== amenity) };
            } else {
                return { ...prev, amenities: [...current, amenity] };
            }
        });
    };

    return (
        <div className={`map-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <h2>Filtros</h2>
                <button className="close-btn mobile-only" onClick={onClose}>×</button>
            </div>

            <div className="sidebar-content">
                {/* Location Section */}
                <div className="filter-section">
                    <h3>Ubicación</h3>

                    <div className="form-group">
                        <label>Ciudad</label>
                        <select value={selectedCity} onChange={handleCityChange}>
                            <option value="">Seleccionar Ciudad</option>
                            {locations.map(loc => (
                                <option key={loc.name} value={loc.name}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Zona</label>
                        <select
                            value={selectedZone}
                            onChange={handleZoneChange}
                            disabled={!selectedCity}
                        >
                            <option value="">Seleccionar Zona</option>
                            {selectedCity && locations.find(l => l.name === selectedCity)?.zones.map(zone => (
                                <option key={zone.name} value={zone.name}>{zone.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Barrio (Opcional)</label>
                        <input
                            type="text"
                            placeholder="Escribe el barrio..."
                            value={filters.neighborhood || ''}
                            onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })}
                        />
                    </div>
                </div>

                <hr className="divider" />

                {/* Characteristics Section */}
                <div className="filter-section">
                    <h3>Características</h3>

                    <div className="form-group">
                        <label>Tipo de Inmueble</label>
                        <div className="chip-group">
                            {['Casa', 'Apartamento', 'Finca', 'Local', 'Lote'].map(type => (
                                <button
                                    key={type}
                                    className={`chip ${filters.type === type ? 'active' : ''}`}
                                    onClick={() => handleTypeToggle(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="row-group">
                        <div className="form-group half">
                            <label>Habitaciones</label>
                            <div className="counter-input">
                                <button onClick={() => setFilters(p => ({ ...p, bedrooms: Math.max(0, (p.bedrooms || 0) - 1) }))}>-</button>
                                <span>{filters.bedrooms || '0+'}</span>
                                <button onClick={() => setFilters(p => ({ ...p, bedrooms: (p.bedrooms || 0) + 1 }))}>+</button>
                            </div>
                        </div>
                        <div className="form-group half">
                            <label>Baños</label>
                            <div className="counter-input">
                                <button onClick={() => setFilters(p => ({ ...p, bathrooms: Math.max(0, (p.bathrooms || 0) - 1) }))}>-</button>
                                <span>{filters.bathrooms || '0+'}</span>
                                <button onClick={() => setFilters(p => ({ ...p, bathrooms: (p.bathrooms || 0) + 1 }))}>+</button>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Precio (Millones)</label>
                        <div className="row-group">
                            <input
                                type="number"
                                placeholder="Mín"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Máx"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Espacios y Amenities</label>
                        <div className="checkbox-grid">
                            {amenitiesList.map(amenity => (
                                <label key={amenity} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={filters.amenities?.includes(amenity) || false}
                                        onChange={() => handleAmenityToggle(amenity)}
                                    />
                                    {amenity}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .map-sidebar {
          width: 350px;
          background: white;
          border-right: 1px solid var(--color-border);
          height: 100%;
          display: flex;
          flex-direction: column;
          z-index: 1001;
          box-shadow: 4px 0 20px rgba(0,0,0,0.05);
          transition: transform 0.3s ease;
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sidebar-header h2 {
          margin: 0;
          font-size: 1.2rem;
          color: var(--color-primary);
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .filter-section {
          margin-bottom: 24px;
        }

        .filter-section h3 {
          font-size: 0.95rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
          font-weight: 700;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 0.9rem;
          color: var(--color-text-main);
          margin-bottom: 8px;
          font-weight: 500;
        }

        select, input[type="text"], input[type="number"] {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-size: 0.95rem;
          color: var(--color-text-main);
          background: var(--color-bg);
          transition: border-color 0.2s;
        }

        select:focus, input:focus {
          outline: none;
          border-color: var(--color-primary);
          background: white;
        }

        .chip-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .chip {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--color-text-main);
        }

        .chip.active {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .row-group {
          display: flex;
          gap: 12px;
        }

        .half {
          flex: 1;
        }

        .counter-input {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 4px;
        }

        .counter-input button {
          width: 32px;
          height: 32px;
          border: none;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          color: var(--color-primary);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .counter-input span {
          font-weight: 600;
          color: var(--color-text-main);
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          color: var(--color-text-main);
        }

        .divider {
          border: none;
          border-top: 1px solid var(--color-border);
          margin: 20px 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--color-text-main);
        }

        .mobile-only { display: none; }

        @media (max-width: 768px) {
          .map-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            transform: translateX(-100%);
          }
          
          .map-sidebar.open {
            transform: translateX(0);
          }

          .mobile-only { display: block; }
        }
      `}</style>
        </div>
    );
}
