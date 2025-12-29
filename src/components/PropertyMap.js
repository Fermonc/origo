'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// --- Fix for Leaflet Icons in Next.js ---
const iconFix = () => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
};

// --- Component to Fit Bounds via useMap Hook ---
function MapBounds({ properties }) {
    const map = useMap();

    useEffect(() => {
        if (!properties || properties.length === 0) return;

        // Create Leaflet LatLngBounds
        const bounds = new L.LatLngBounds(properties.map(p => [p.coordinates.lat, p.coordinates.lng]));

        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 15, // Don't zoom in too close for single markers
            animate: true
        });
    }, [properties, map]);

    return null;
}

export default function PropertyMap({ properties }) {
    useEffect(() => {
        iconFix();
    }, []);

    // Robust Filtering for Properties with Valid Coordinates
    const validProperties = useMemo(() => {
        return properties.filter(p =>
            p.coordinates &&
            typeof p.coordinates.lat === 'number' &&
            typeof p.coordinates.lng === 'number'
        );
    }, [properties]);

    // Center Logic
    const defaultCenter = [6.1551, -75.3737]; // Rionegro, Antioquia
    const center = validProperties.length > 0
        ? [validProperties[0].coordinates.lat, validProperties[0].coordinates.lng]
        : defaultCenter;

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
            zoomControl={false} // We can add a custom one if needed, or leave default top-left
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // Standard OSM
            // Alternative: CartoDB Voyager for a cleaner look ? (Optional improvement)
            // url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            <MapBounds properties={validProperties} />

            {validProperties.map((property) => (
                <Marker
                    key={property.id}
                    position={[property.coordinates.lat, property.coordinates.lng]}
                >
                    <Popup className="custom-popup" minWidth={260}>
                        <div className="popup-content">
                            {/* Image Header */}
                            <div className="popup-image-container">
                                {(property.images?.[0] || property.image) ? (
                                    <Image
                                        src={property.images?.[0] || property.image}
                                        alt={property.title}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="260px"
                                        priority={false} // Lazy load map images
                                    />
                                ) : (
                                    <div className="no-image-placeholder">🏠</div>
                                )}
                                <div className="price-tag">
                                    {new Intl.NumberFormat('es-CO', {
                                        style: 'currency',
                                        currency: 'COP',
                                        maximumFractionDigits: 0
                                    }).format(property.price)}
                                </div>
                            </div>

                            {/* Info Body */}
                            <div className="popup-body">
                                <h3 className="popup-title">{property.title}</h3>
                                <p className="popup-location">📍 {property.location}</p>

                                <div className="popup-specs">
                                    {property.area && (
                                        <span title="Área">📏 {property.area}m²</span>
                                    )}
                                    {property.bedrooms > 0 && (
                                        <span title="Habitaciones">🛏️ {property.bedrooms}</span>
                                    )}
                                    {property.bathrooms > 0 && (
                                        <span title="Baños">🚿 {property.bathrooms}</span>
                                    )}
                                </div>

                                <Link
                                    href={`/propiedades/${property.id}`}
                                    className="popup-btn"
                                >
                                    Ver Propiedad
                                </Link>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            <style jsx global>{`
                .leaflet-popup-content-wrapper {
                    padding: 0;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                }
                .leaflet-popup-content {
                    margin: 0;
                    width: 260px !important;
                }
                .leaflet-container {
                    font-family: 'Inter', sans-serif;
                }
            `}</style>

            <style jsx>{`
                .popup-image-container {
                    position: relative;
                    height: 150px;
                    background: #f0f0f0;
                }
                .no-image-placeholder {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    color: #ccc;
                }
                .price-tag {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 700;
                    backdrop-filter: blur(4px);
                }
                .popup-body {
                    padding: 15px;
                }
                .popup-title {
                    margin: 0 0 5px 0;
                    font-size: 1rem;
                    font-weight: 700;
                    color: #111;
                    line-height: 1.3;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .popup-location {
                    margin: 0 0 10px 0;
                    font-size: 0.8rem;
                    color: #666;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .popup-specs {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 15px;
                    font-size: 0.85rem;
                    color: #444;
                    font-weight: 500;
                }
                .popup-btn {
                    display: block;
                    width: 100%;
                    padding: 10px 0;
                    background: #111;
                    color: white;
                    text-align: center;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: background 0.2s;
                }
                .popup-btn:hover {
                    background: #333;
                }
            `}</style>
        </MapContainer>
    );
}
