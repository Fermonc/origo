'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Fix for default Leaflet icons in Next.js/React
const iconFix = () => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
};

function MapBounds({ properties }) {
    const map = useMap();

    useEffect(() => {
        if (!properties || properties.length === 0) return;

        const bounds = new L.LatLngBounds(properties.map(p => [p.lat, p.lng]));
        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 15
        });
    }, [properties, map]);

    return null;
}

export default function PropertyMap({ properties }) {
    useEffect(() => {
        iconFix();
    }, []);

    // Filter properties with valid coordinates
    const validProperties = properties.filter(
        (p) => p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng)
    );

    // Default center (Rionegro, Antioquia approx) if no properties
    const defaultCenter = [6.1551, -75.3737];

    // Use first property as center if available, otherwise default
    const center = validProperties.length > 0
        ? [validProperties[0].lat, validProperties[0].lng]
        : defaultCenter;

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapBounds properties={validProperties} />

            {validProperties.map((property) => (
                <Marker
                    key={property.id}
                    position={[property.lat, property.lng]}
                >
                    <Popup className="custom-popup">
                        <div style={{ minWidth: '220px', borderRadius: '8px', overflow: 'hidden' }}>
                            {/* Simple image preview if available */}
                            {(property.images?.[0] || property.image) && (
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '120px',
                                    marginBottom: '8px',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}>
                                    <Image
                                        src={property.images?.[0] || property.image}
                                        alt={property.title}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="220px"
                                    />
                                </div>
                            )}

                            <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#1F2937' }}>{property.title}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold', color: '#E67E22', fontSize: '0.95rem' }}>
                                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(property.price)}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                                    {property.type}
                                </span>
                            </div>
                            <Link
                                href={`/propiedades/${property.id}`}
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    background: '#1F2937',
                                    color: 'white',
                                    textDecoration: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontWeight: '500'
                                }}
                            >
                                Ver Detalles
                            </Link>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
