'use client';

import { useState, useEffect } from 'react';

// Major Colombian Cities Data
// Major Colombian Cities Data (Fallback)
const COLOMBIAN_CITIES = [
  { name: 'Bogotá', coords: [4.7110, -74.0721] },
  { name: 'Medellín', coords: [6.2442, -75.5812] },
  { name: 'Cali', coords: [3.4516, -76.5320] },
  { name: 'Barranquilla', coords: [10.9685, -74.7813] },
  { name: 'Cartagena', coords: [10.3910, -75.4794] },
  { name: 'Popayán', coords: [2.4448, -76.6147] }, // Added explicitly as requested
  { name: 'Rionegro', coords: [6.1551, -75.3737] }
];

export default function MapSidebar({
  locations, // Keeping for backward compatibility if needed, but mainly using COLOMBIAN_CITIES
  filters,
  setFilters,
  onLocationSelect,
  isOpen,
  onClose
}) {
  const [selectedCity, setSelectedCity] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCityList, setShowCityList] = useState(false);
  const [filteredCities, setFilteredCities] = useState(COLOMBIAN_CITIES);

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (citySearch.length > 2) {
        try {
          // First check local list for instant results
          const localMatches = COLOMBIAN_CITIES.filter(c =>
            c.name.toLowerCase().includes(citySearch.toLowerCase())
          );

          // Then fetch from API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(citySearch)}&countrycodes=co&limit=5`,
            {
              headers: {
                'User-Agent': 'OrigoWeb/1.0 (fermonc@origo.com)' // Required by Nominatim Usage Policy
              }
            }
          );
          const data = await response.json();

          const apiMatches = data.map(item => ({
            name: item.display_name.split(',')[0], // Get just the city/place name
            coords: [parseFloat(item.lat), parseFloat(item.lon)]
          }));

          // Combine and deduplicate (prefer API for broader search, but local for specific curated coords)
          // For simplicity, we'll just show API results if available, or fallback to local
          setFilteredCities(apiMatches.length > 0 ? apiMatches : localMatches);
        } catch (error) {
          console.error("Error searching cities:", error);
          // Fallback to local filtering on error
          setFilteredCities(COLOMBIAN_CITIES.filter(c =>
            c.name.toLowerCase().includes(citySearch.toLowerCase())
          ));
        }
      } else {
        setFilteredCities(COLOMBIAN_CITIES);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [citySearch]);

  // Update local state when filters change externally
  useEffect(() => {
    if (filters.city !== selectedCity) setSelectedCity(filters.city);
  }, [filters]);

  const handleCitySelect = (city) => {
    setSelectedCity(city.name);
    setCitySearch(city.name);
    setFilters(prev => ({ ...prev, city: city.name, zone: '' }));
    onLocationSelect(city.coords, 13);
    setShowCityList(false);
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
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="sidebar-content">
        {/* Location Section */}
        <div className="filter-section">
          <h3>Ubicación</h3>

          <div className="form-group relative">
            <label>Ciudad</label>
            <input
              type="text"
              placeholder="Buscar ciudad o municipio..."
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                // Debounce logic will be handled in useEffect
              }}
              onFocus={() => setShowCityList(true)}
            />
            {showCityList && (citySearch.length > 2 || filteredCities.length > 0) && (
              <ul className="city-dropdown">
                {filteredCities.map((city, index) => (
                  <li key={`${city.name}-${index}`} onClick={() => handleCitySelect(city)}>
                    {city.name}
                  </li>
                ))}
                {filteredCities.length === 0 && citySearch.length > 2 && (
                  <li className="no-results">Buscando...</li>
                )}
              </ul>
            )}
          </div>

          <div className="form-group">
            <label>Barrio / Sector (Opcional)</label>
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
            <label>Precio (COP)</label>
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
          position: absolute;
          top: 20px;
          left: 20px;
          width: 320px;
          max-height: calc(100vh - 40px);
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          display: flex;
          flex-direction: column;
          z-index: 2000;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
          overflow: hidden;
        }

        /* Mobile: Slide from bottom or full screen overlay */
        @media (max-width: 768px) {
          .map-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            max-height: 100vh;
            border-radius: 0;
            transform: translateY(100%);
            opacity: 0;
            background: rgba(255, 255, 255, 0.95);
          }
          
          .map-sidebar.open {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Desktop: Slide from left if hidden (though usually visible) */
        @media (min-width: 769px) {
           .map-sidebar {
             transform: translateX(0);
             opacity: 1;
           }
           /* If we want to hide it on desktop too, we can add a class */
           .map-sidebar.hidden {
             transform: translateX(-110%);
             opacity: 0;
           }
        }

        .sidebar-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sidebar-header h2 {
          margin: 0;
          font-size: 1.1rem;
          color: #1a1a1a;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          scrollbar-width: thin;
        }

        .filter-section {
          margin-bottom: 28px;
        }

        .filter-section h3 {
          font-size: 0.8rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group.relative {
          position: relative;
        }

        .form-group label {
          display: block;
          font-size: 0.9rem;
          color: #333;
          margin-bottom: 8px;
          font-weight: 500;
        }

        input[type="text"], input[type="number"] {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          font-size: 0.95rem;
          color: #333;
          background: rgba(255,255,255,0.6);
          transition: all 0.2s;
        }

        input:focus {
          outline: none;
          border-color: var(--color-primary);
          background: white;
          box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
        }

        .city-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          margin-top: 4px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 10;
          list-style: none;
          padding: 0;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .city-dropdown li {
          padding: 10px 16px;
          cursor: pointer;
          font-size: 0.9rem;
          color: #333;
          border-bottom: 1px solid #f5f5f5;
        }

        .city-dropdown li:hover {
          background: #f9f9f9;
        }

        .chip-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .chip {
          background: rgba(255,255,255,0.5);
          border: 1px solid rgba(0,0,0,0.1);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          color: #444;
          font-weight: 500;
        }

        .chip:hover {
          background: white;
          transform: translateY(-1px);
        }

        .chip.active {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
          box-shadow: 0 4px 10px rgba(var(--color-primary-rgb), 0.3);
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
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          padding: 6px;
        }

        .counter-input button {
          width: 32px;
          height: 32px;
          border: none;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          color: var(--color-primary);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          transition: transform 0.1s;
        }

        .counter-input button:active {
          transform: scale(0.95);
        }

        .counter-input span {
          font-weight: 600;
          color: #333;
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          color: #444;
        }
        
        .checkbox-label input {
          accent-color: var(--color-primary);
        }

        .divider {
          border: none;
          border-top: 1px solid rgba(0,0,0,0.05);
          margin: 20px 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.8rem;
          color: #333;
          cursor: pointer;
          line-height: 1;
          padding: 0 8px;
        }
      `}</style>
    </div>
  );
}
