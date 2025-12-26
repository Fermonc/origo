'use client';
// Triggering redeploy - Billing Reactivated


import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MapPopup from './MapPopup';
import PropertyMapList from './PropertyMapList';
import MapSidebar from './MapSidebar';
import { LOCATIONS, INITIAL_MAP_CENTER } from '@/constants/locations';
import { createCustomIcon } from '@/utils/mapIcons';
import { usePropertyFilters } from '@/hooks/usePropertyFilters';


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
  // Use the custom hook for state and filtering
  const { filters, updateFilters: setFilters, filteredProperties } = usePropertyFilters(properties);

  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(INITIAL_MAP_CENTER); // Default: Rionegro
  const [visibleProperties, setVisibleProperties] = useState([]);
  const [showList, setShowList] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop

  // Note: Previous filteredProperties useMemo block is removed because the hook provides it.

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
        locations={LOCATIONS}
        filters={filters}
        setFilters={setFilters} // Hook handles partial updates
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
              iconUrl: '/leaflet/marker-icon-2x-red.png',
              shadowUrl: '/leaflet/marker-shadow.png',
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
          height: 100%;
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
            bottom: 120px;
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
