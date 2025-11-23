'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);

export default function HomeMapPreview() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="map-skeleton">Cargando mapa...</div>;
    }

    // Rionegro coordinates
    const center = [6.1551, -75.3737];

    // Custom Icon Logic (Client-side only)
    const L = require('leaflet');

    const createIcon = (color) => {
        return L.divIcon({
            className: 'preview-marker',
            html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
    };

    return (
        <section className="map-preview-section">
            <div className="container">
                <div className="map-card">
                    <div className="map-container">
                        <MapContainer
                            center={center}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={false}
                            dragging={false}
                            scrollWheelZoom={false}
                            doubleClickZoom={false}
                            touchZoom={false}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />
                            {/* Decorative Markers */}
                            <Marker position={[6.1551, -75.3737]} icon={createIcon('#E67E22')} />
                            <Marker position={[6.1450, -75.3600]} icon={createIcon('#27AE60')} />
                            <Marker position={[6.1333, -75.3833]} icon={createIcon('#2C3E50')} />
                            <Marker position={[6.1167, -75.4167]} icon={createIcon('#E67E22')} />
                        </MapContainer>
                    </div>

                    <div className="map-overlay">
                        <div className="overlay-content">
                            <h2>Mapa Interactivo</h2>
                            <p>
                                Busca de manera fácil, rápida y sencilla el inmueble ideal.
                                Explora por ubicación, ve qué hay alrededor y encuentra tu próximo proyecto.
                            </p>
                            <Link href="/mapa" className="btn-explore">
                                Explorar Mapa 🗺️
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .map-preview-section {
          padding: 40px 0;
          background: #fff;
        }
        .map-card {
          position: relative;
          height: 450px;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .map-container {
          height: 100%;
          width: 100%;
          filter: grayscale(20%); /* Subtle aesthetic touch */
          transition: filter 0.5s;
        }
        .map-card:hover .map-container {
          filter: grayscale(0%);
        }
        .map-skeleton {
          height: 450px;
          background: #f0f0f0;
          border-radius: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
        }

        .map-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(255,255,255,0.95) 30%, rgba(255,255,255,0.4) 100%);
          display: flex;
          align-items: center;
          padding: 60px;
          pointer-events: none; /* Let clicks pass through to map if needed, but here we want the button to work */
        }
        
        .overlay-content {
          max-width: 450px;
          pointer-events: auto;
        }

        h2 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #111;
          margin-bottom: 16px;
          letter-spacing: -1px;
          line-height: 1.1;
        }
        p {
          font-size: 1.1rem;
          color: #555;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .btn-explore {
          display: inline-block;
          background: #111;
          color: white;
          padding: 16px 32px;
          border-radius: 50px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }
        .btn-explore:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.25);
          background: #000;
        }

        @media (max-width: 768px) {
          .map-card {
            height: 500px;
          }
          .map-overlay {
            background: linear-gradient(to top, rgba(255,255,255,0.98) 40%, rgba(255,255,255,0.1) 100%);
            align-items: flex-end;
            padding: 30px;
          }
          .overlay-content {
            text-align: center;
            max-width: 100%;
          }
          h2 {
            font-size: 2rem;
          }
        }
      `}</style>
        </section>
    );
}
