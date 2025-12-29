'use client';

import dynamic from 'next/dynamic';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import MapFilters from '@/components/MapFilters';

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
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        searchTerm: '',
        propertyType: 'all',
        priceRange: 'all'
    });

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                // Fetch properties
                const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'), limit(100));
                const querySnapshot = await getDocs(q);

                const props = [];
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    // Clean and normalize data for valid use in filters and map
                    // Handle various price formats if necessary, though new ones are stored as numbers (priceNumber/price)
                    const price = Number(data.priceNumber) || Number(data.price) || 0;

                    props.push({
                        id: doc.id,
                        ...data,
                        // Ensure price is numeric for filtering
                        price: price
                    });
                });

                setProperties(props);
            } catch (error) {
                console.error("Error fetching properties:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const filteredProperties = useMemo(() => {
        return properties.filter(property => {
            // Text Search (Location or Title)
            const searchLower = filters.searchTerm.toLowerCase();
            const searchMatch = !filters.searchTerm ||
                (property.title?.toLowerCase().includes(searchLower)) ||
                (property.location?.toLowerCase().includes(searchLower)) ||
                (property.address?.toLowerCase().includes(searchLower));

            // Type Filter
            // Note: DB values are capitalize (e.g. 'Lote'), filter values are also capitalize.
            const typeMatch = filters.propertyType === 'all' ||
                property.type === filters.propertyType;

            // Price Filter
            let priceMatch = true;
            if (filters.priceRange !== 'all') {
                const priceInMillions = property.price / 1000000;
                switch (filters.priceRange) {
                    case '0-200':
                        priceMatch = priceInMillions <= 200;
                        break;
                    case '200-500':
                        priceMatch = priceInMillions > 200 && priceInMillions <= 500;
                        break;
                    case '500-1000':
                        priceMatch = priceInMillions > 500 && priceInMillions <= 1000;
                        break;
                    case '1000-2000':
                        priceMatch = priceInMillions > 1000 && priceInMillions <= 2000;
                        break;
                    case '2000+':
                        priceMatch = priceInMillions > 2000;
                        break;
                }
            }

            return searchMatch && typeMatch && priceMatch;
        });
    }, [properties, filters]);

    return (
        <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
            <MapFilters onFilterChange={setFilters} />
            <PropertyMap properties={filteredProperties} />

            {/* Show message if no properties found after filter */}
            {!loading && filteredProperties.length === 0 && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'white',
                    padding: '24px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    zIndex: 900, // Below filters
                    textAlign: 'center',
                    maxWidth: '80%'
                }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>No se encontraron inmuebles</h3>
                    <p style={{ margin: 0, color: '#666', lineHeight: '1.5' }}>
                        No hay propiedades que coincidan con tus filtros en este momento.
                        <br />
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                marginTop: '12px',
                                background: 'transparent',
                                border: 'none',
                                color: '#0066cc',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: '0.95rem'
                            }}
                        >
                            Recargar aplicación
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
}
