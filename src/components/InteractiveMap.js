'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MapPopup from './MapPopup';
import PropertyMapList from './PropertyMapList';

// Custom Marker Icon Definition
const createCustomIcon = (price, type) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-pin ${type.toLowerCase()}">
             <span class="marker-price">${formatPriceShort(price)}</span>
           </div>`,
    iconSize: [60, 30],
    iconAnchor: [30, 30],
    popupAnchor: [0, -35]
  });
};

const formatPriceShort = (price) => {
  if (!price) return '';
  // Extract numbers
  const num = parseInt(price.replace(/\D/g, ''));
  if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}MM`;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(0)}M`;
  return price;
};

// Component to handle map view updates and events
function MapController({ center, onBoundsChange }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 14);
    }
  }, [center, map]);

  useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
    }
  });

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
  const [visibleProperties, setVisibleProperties] = useState([]);
  const [showList, setShowList] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  // Hierarchical Locations Configuration
  const locations = [
    {
      name: 'Rionegro',
      coords: [6.1551, -75.3737],
      zones: [
        { name: 'Centro', coords: [6.1530, -75.3740] },
        { name: 'San Antonio', coords: [6.1333, -75.3833] },
        { name: 'El Porvenir', coords: [6.1450, -75.3600] },
        { name: 'Llanogrande', coords: [6.1167, -75.4167] },
        { name: 'Gualanday', coords: [6.1100, -75.4200] }
      ]
    },
    {
      name: 'La Ceja',
      coords: [6.0333, -75.4333],
      zones: [
        { name: 'Centro', coords: [6.0333, -75.4333] },
        { name: 'Pontezuela', coords: [6.0500, -75.4200] }
      ]
    },
    {
      name: 'El Retiro',
      coords: [6.0583, -75.5000],
      zones: [
        { name: 'Puro Cuero', coords: [6.0600, -75.5000] },
        { name: 'Fizebad', coords: [6.0800, -75.4800] }
      ]
    },
    {
      name: 'Marinilla',
      coords: [6.1750, -75.3333],
      zones: [
        { name: 'Centro', coords: [6.1750, -75.3333] }
      ]
    },
    {
      name: 'Cali',
      coords: [3.4516, -76.5320],
      zones: [
        { name: 'Pance', coords: [3.3333, -76.5333] },
        { name: 'Ciudad Jardín', coords: [3.3667, -76.5333] },
        { name: 'Granada', coords: [3.4550, -76.5350] },
        { name: 'El Peñón', coords: [3.4500, -76.5400] }
      ]
    }
  ];

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      // Type filter
      if (filters.type !== 'all' && p.type !== filters.type) return false;

      // Price filter
      if (filters.minPrice || filters.maxPrice) {
        const price = parseInt(p.price.replace(/\D/g, ''));
        if (filters.minPrice && price < parseInt(filters.minPrice)) return false;
        if (filters.maxPrice && price > parseInt(filters.maxPrice)) return false;
      }

      return true;
    });
  }, [properties, filters]);

  // Update visible properties when bounds change
  const handleBoundsChange = (bounds) => {
    const visible = filteredProperties.filter(p => {
      if (!p.lat || !p.lng) return false;
      const latLng = L.latLng(p.lat, p.lng);
      return bounds.contains(latLng);
    });
    setVisibleProperties(visible);
  };

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

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setMapCenter(city.coords);
  };

  const handleZoneSelect = (zone) => {
    setMapCenter(zone.coords);
  };

  const handleBackToCities = () => {
    setSelectedCity(null);
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
          whenReady={(map) => {
            // Initial bounds check
            handleBoundsChange(map.target.getBounds());
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController center={mapCenter} onBoundsChange={handleBoundsChange} />

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
            if (!property.lat || !property.lng) return null;

            return (
              <Marker
                key={property.id}
                position={[property.lat, property.lng]}
                icon={createCustomIcon(property.price, property.type)}
              >
                <Popup className="custom-popup" closeButton={false}>
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
          </div>
        )}

        {/* Zone Selector Chips */}
        <div className="zones-scroll">
          {selectedCity ? (
            <>
              <button className="zone-chip back-btn" onClick={handleBackToCities}>
                ← Volver
              </button>
              <span className="city-label">{selectedCity.name}:</span>
              {selectedCity.zones.map(zone => (
                <button
                  key={zone.name}
                  className="zone-chip"
                  onClick={() => handleZoneSelect(zone)}
                >
                  {zone.name}
                </button>
              ))}
            </>
          ) : (
            locations.map(city => (
              <button
                key={city.name}
                className="zone-chip"
                onClick={() => handleCitySelect(city)}
              >
                {city.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Property List View */}
      <PropertyMapList
        properties={visibleProperties}
        isOpen={showList}
        onClose={() => setShowList(false)}
      />

      {/* Bottom Controls */}
      <div className="fab-container">
        <button
          className="fab list-fab"
          onClick={() => setShowList(!showList)}
          title="Ver lista"
        >
          {showList ? '🗺️' : '📋'}
          <span className="fab-badge">{visibleProperties.length}</span>
        </button>

        <button className="fab" onClick={handleLocateMe} title="Cerca de mí">
          📍
        </button>
      </div>

      <style jsx global>{`
        /* Custom Marker Styles */
        .custom-marker {
          background: none;
          border: none;
        }
        .marker-pin {
          background: white;
          border-radius: 20px;
          padding: 4px 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.75rem;
          color: var(--color-primary);
          border: 2px solid var(--color-primary);
          white-space: nowrap;
          transition: transform 0.2s;
        }
        .marker-pin:hover {
          transform: scale(1.1);
          z-index: 1000 !important;
        }
        .marker-pin.lote { border-color: var(--color-accent); }
        .marker-pin.finca { border-color: var(--color-secondary); }
        
        /* Popup Styles Override */
        .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
      `}</style>

      <style jsx>{`
        .map-wrapper {
          position: relative;
          height: calc(100vh - 60px);
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
          border: 1px solid #e0e0e0;
        }

        .search-input-group {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .search-icon {
          color: #333;
        }

        .type-select {
          border: none;
          background: transparent;
          font-size: 1rem;
          color: #333; /* High contrast */
          font-weight: 500;
          width: 100%;
          outline: none;
          cursor: pointer;
        }

        .filter-toggle {
          background: #f8f9fa;
          border: 1px solid #ddd;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          color: #333; /* High contrast */
          font-weight: 500;
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

        .zones-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 4px 0;
          scrollbar-width: none;
          align-items: center;
        }
        .zones-scroll::-webkit-scrollbar { display: none; }

        .city-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #333;
          background: rgba(255,255,255,0.8);
          padding: 4px 8px;
          border-radius: 8px;
        }

        .zone-chip {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(4px);
          border: 1px solid #e0e0e0;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-primary);
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: transform 0.2s;
        }
        .zone-chip:hover {
          transform: translateY(-2px);
          background: white;
          border-color: var(--color-primary);
        }

        .back-btn {
          background: var(--color-primary);
          color: white;
          border: none;
        }
        .back-btn:hover {
          background: var(--color-secondary);
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
          color: #555;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .filter-group input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
          color: #333;
        }

        .fab-container {
          position: absolute;
          bottom: 30px;
          right: 30px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 1000;
        }
        
        @media (max-width: 767px) {
          .fab-container {
            bottom: 90px;
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
          position: relative;
        }

        .fab:active {
          transform: scale(0.95);
        }

        .list-fab {
          background: var(--color-primary);
          color: white;
        }

        .fab-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: var(--color-secondary);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
}
