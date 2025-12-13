'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function DraggableMarker({ position, setPosition }) {
    const markerRef = useRef(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    setPosition(marker.getLatLng());
                }
            },
        }),
        [setPosition],
    );

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}>
            <Popup minWidth={90}>
                <span>Arrastra para ubicar el centro de búsqueda</span>
            </Popup>
        </Marker>
    );
}

function MapEvents({ setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });
    return null;
}

// Helper to update map view when props change
function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

export default function RadiusMapPicker({ center, radius, onCenterChange, onRadiusChange }) {
    // Default: Medellin/Rionegro area
    const defaultCenter = { lat: 6.2442, lng: -75.5812 };
    const mapCenter = center?.lat ? center : defaultCenter;

    // radius is in km, Circle takes meters
    const radiusMeters = (radius || 5) * 1000;

    const handleSetPosition = (latlng) => {
        onCenterChange({ lat: latlng.lat, lng: latlng.lng });
    };

    return (
        <div className="radius-picker-container">
            <div className="map-wrapper">
                <MapContainer center={mapCenter} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <DraggableMarker position={mapCenter} setPosition={handleSetPosition} />
                    <Circle center={mapCenter} radius={radiusMeters} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }} />
                    <MapEvents setPosition={handleSetPosition} />
                    <MapUpdater center={mapCenter} />
                </MapContainer>
            </div>

            <div className="controls">
                <label>Radio de búsqueda: <strong>{radius} km</strong></label>
                <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={radius || 5}
                    onChange={(e) => onRadiusChange(Number(e.target.value))}
                    className="radius-slider"
                />
            </div>

            <style jsx>{`
                .radius-picker-container {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .map-wrapper {
                    height: 300px;
                    width: 100%;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid #ddd;
                    z-index: 0;
                }
                .controls {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 8px;
                    background: #f9f9f9;
                    border-radius: 8px;
                }
                .radius-slider {
                    width: 100%;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
