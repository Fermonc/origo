'use client';
// Triggering redeploy - Billing Reactivated


import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MapPopup from './MapPopup';
import PropertyMapList from './PropertyMapList';
import MapSidebar from './MapSidebar';

// SVG Icons for Markers
const icons = {
  house: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M11.67 3.87L9.9 2.1 0 12h5v10h14V12h5l-9.9-9.9-1.77 1.77z"/></svg>`,
  building: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7zM11 7h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zM15 7h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2z"/></svg>`,
  tree: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M10 21v-2H3V5h2v2h2V5h2v2h2V5h2v2h2V5h2v14h-7v2h6v2H10z"/></svg>`, // Simplified tree/nature
  lot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z"/></svg>` // Actually user icon but used for generic plot
};

const getIconForType = (type) => {
  const t = type?.toLowerCase() || '';
  if (t.includes('finca') || t.includes('lote')) return icons.tree;
  if (t.includes('local') || t.includes('oficina')) return icons.building;
  return icons.house;
};

const createCustomIcon = (type) => {
  const iconSvg = getIconForType(type);
  const colorClass = type?.toLowerCase().includes('lote') ? 'lote' :
    type?.toLowerCase().includes('finca') ? 'finca' : 'casa';

  return L.divIcon({
    className: 'custom-marker-icon',
    html: `<div class="marker-circle ${colorClass}">
             ${iconSvg}
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
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
    city: '',
    zone: '',
    neighborhood: '',
    bedrooms: 0,
    bathrooms: 0,
    amenities: []
  });

  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([6.1551, -75.3737]); // Default: Rionegro
  const [visibleProperties, setVisibleProperties] = useState([]);
  const [showList, setShowList] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop

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
        // Extract numeric price from property string (e.g., "$ 1.200.000.000" -> 1200000000)
        const price = parseInt(p.price.replace(/\D/g, ''));

        if (filters.minPrice) {
          let min = parseInt(filters.minPrice.replace(/\D/g, ''));
          // Heuristic: If user types < 100,000, assume they mean millions. 
          // E.g. "200" -> 200,000,000. "200000000" -> 200,000,000.
          if (min < 100000) min = min * 1000000;
          if (price < min) return false;
        }

        if (filters.maxPrice) {
          let max = parseInt(filters.maxPrice.replace(/\D/g, ''));
          if (max < 100000) max = max * 1000000;
          if (price > max) return false;
        }
      }

      // Bedrooms & Bathrooms
      if (filters.bedrooms > 0 && (parseInt(p.bedrooms) || 0) < filters.bedrooms) return false;
      if (filters.bathrooms > 0 && (parseInt(p.bathrooms) || 0) < filters.bathrooms) return false;

      // Amenities (if data exists)
      if (filters.amenities && filters.amenities.length > 0) {
        // This assumes p.features or p.amenities exists. 
        // If not, we skip this check or implement strictly if data is available.
        // For now, lax check to avoid hiding everything if data is missing.
        if (p.features) {
          const hasAll = filters.amenities.every(a => p.features.includes(a));
          if (!hasAll) return false;
        }
      }

      return true;
    });
  }, [properties, filters]);

  const [mapBounds, setMapBounds] = useState(null);

  // Update visible properties when bounds OR filters change
  useEffect(() => {
    if (!mapBounds) return;

    const visible = filteredProperties.filter(p => {
      if (!p.lat || !p.lng) return false;
      const latLng = L.latLng(p.lat, p.lng);
      return mapBounds.contains(latLng);
    });
    setVisibleProperties(visible);
  }, [filteredProperties, mapBounds]);

  // Update bounds state
  const handleBoundsChange = (bounds) => {
    setMapBounds(bounds);
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

  const handleLocationSelect = (coords, zoom) => {
    setMapCenter(coords);
    // Zoom logic is handled by MapController flying to center
  };

  return (
    <div className="map-wrapper">
      {/* Sidebar */}
      <MapSidebar
        locations={locations}
        filters={filters}
        setFilters={setFilters}
        onLocationSelect={handleLocationSelect}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Map Area */}
      <div className="map-area">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          whenReady={(map) => {
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
                icon={createCustomIcon(property.type)}
              >
                <Popup className="custom-popup" closeButton={false}>
                  <MapPopup property={property} />
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Mobile Sidebar Toggle */}
        {!isSidebarOpen && (
          <button
            className="sidebar-toggle mobile-only"
            onClick={() => setIsSidebarOpen(true)}
          >
            🔍 Filtros
          </button>
        )}

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
      </div>

      {/* Property List View */}
      <PropertyMapList
        properties={visibleProperties}
        isOpen={showList}
        onClose={() => setShowList(false)}
      />

      <style jsx global>{`
        /* Custom Marker Styles */
        .custom-marker-icon {
          background: none;
          border: none;
        }
        .marker-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          border: 2px solid var(--color-primary);
          transition: transform 0.2s;
        }
        .marker-circle svg {
          width: 20px;
          height: 20px;
        }
        .marker-circle:hover {
          transform: scale(1.15);
          z-index: 1000 !important;
        }
        .marker-circle.lote { 
          border-color: var(--color-accent); 
          color: var(--color-accent);
        }
        .marker-circle.finca { 
          border-color: var(--color-secondary); 
          color: var(--color-secondary);
        }
        
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

        .map-area {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 0;
        }

        .sidebar-toggle {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 1000;
          background: white;
          border: none;
          padding: 10px 20px;
          border-radius: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          font-weight: 600;
          color: var(--color-primary);
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
        
        .mobile-only { display: none; }

        @media (max-width: 768px) {
          .mobile-only { display: block; }
          
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
