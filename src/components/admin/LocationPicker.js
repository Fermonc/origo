'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
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
    const markerRef = useMemo(() => ({ current: null }), []);

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
                <span>Arrastra para ajustar la ubicación</span>
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

export default function LocationPicker({ position, onPositionChange }) {
    // Default to Rionegro/Llanogrande center if no position
    const defaultCenter = { lat: 6.1387, lng: -75.434 };
    const center = position?.lat ? position : defaultCenter;

    const handleSetPosition = (latlng) => {
        onPositionChange({ lat: latlng.lat, lng: latlng.lng });
    };

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 0, border: '1px solid #ddd' }}>
            <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMarker position={center} setPosition={handleSetPosition} />
                <MapEvents setPosition={handleSetPosition} />
            </MapContainer>
        </div>
    );
}
