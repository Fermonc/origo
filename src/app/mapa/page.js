'use client';

import dynamic from 'next/dynamic';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { useEffect, useState } from 'react';

// Dynamic import to avoid SSR with Leaflet
const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
    ssr: false,
    loading: () => (
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p>Cargando mapa...</p>
        </div>
    )
});

export default function MapPage() {
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                // Fetch some properties to display on the map
                const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'), limit(50));
                const querySnapshot = await getDocs(q);

                const props = [];
                querySnapshot.forEach(doc => {
                    props.push({ id: doc.id, ...doc.data() });
                });

                setProperties(props);
            } catch (error) {
                console.error("Error fetching properties:", error);
            }
        };

        fetchProperties();
    }, []);

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <PropertyMap properties={properties} />
        </div>
    );
}
