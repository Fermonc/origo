'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// Dynamically import the map component to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
    ssr: false,
    loading: () => (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f2f5',
            color: '#666'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🗺️</div>
                <div>Cargando mapa interactivo...</div>
            </div>
        </div>
    )
});

export default function MapPage() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                // Estrategia de ahorro aplicada: Límite en Mapa
                // Limitamos a 100 propiedades para evitar leer toda la base de datos en una vista de mapa.
                const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'), limit(100));
                const querySnapshot = await getDocs(q);

                const props = [];
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    // Only include properties that have location data
                    // In a real app, you might want to filter this on the server or handle it more gracefully
                    if (data.lat && data.lng) {
                        props.push({ id: doc.id, ...data });
                    } else {
                        // Mock coordinates for demo purposes if missing (Rionegro area)
                        // Remove this in production!
                        props.push({
                            id: doc.id,
                            ...data,
                            lat: 6.15 + (Math.random() * 0.05 - 0.025),
                            lng: -75.37 + (Math.random() * 0.05 - 0.025)
                        });
                    }
                });

                setProperties(props);
            } catch (error) {
                console.error("Error fetching properties for map:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    return (
        <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
            <InteractiveMap properties={properties} />

            {/* Back button for mobile if needed, though BottomNav is present */}
            <style jsx global>{`
        /* Hide footer on map page to give full screen experience */
        footer {
          display: none !important;
        }
        /* Reset body padding for map page specifically */
        body {
          padding-bottom: 0 !important;
        }
      `}</style>
        </div>
    );
}
