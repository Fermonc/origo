'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import PropertyCard from '@/components/PropertyCard';

export default function UserFavorites({ user }) {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadFavorites();
        }
    }, [user]);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            // 1. Get User's favorite IDs
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists() && userSnap.data().favorites?.length > 0) {
                const favIds = userSnap.data().favorites;

                // 2. Fetch Property Details for each ID
                // Note: In a real app with many favs, use 'in' query or batch get. 
                // For now, parallel requests are okay for small lists.
                const propsPromises = favIds.map(id => getDoc(doc(db, 'properties', id)));
                const propsSnaps = await Promise.all(propsPromises);

                const loadedProps = propsSnaps
                    .filter(snap => snap.exists())
                    .map(snap => ({ id: snap.id, ...snap.data() }));

                setFavorites(loadedProps);
            } else {
                setFavorites([]);
            }
        } catch (error) {
            console.error("Error loading favorites:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state">Cargando favoritos...</div>;

    if (favorites.length === 0) {
        return (
            <div className="empty-state">
                <div className="icon">❤️</div>
                <h3>Aún no tienes favoritos</h3>
                <p>Guarda los inmuebles que te gusten para verlos aquí.</p>
            </div>
        );
    }

    return (
        <div className="favorites-grid">
            {favorites.map(property => (
                <div key={property.id} className="fav-card-wrapper">
                    <PropertyCard property={property} />
                </div>
            ))}
            <style jsx>{`
                .favorites-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 24px;
                }
                .loading-state {
                    text-align: center;
                    padding: 40px;
                    color: #666;
                }
                .empty-state {
                    text-align: center;
                    padding: 60px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                }
                .icon {
                    font-size: 3rem;
                    margin-bottom: 16px;
                }
                h3 { margin: 0 0 8px 0; font-size: 1.2rem; }
                p { color: #666; margin: 0; }
            `}</style>
        </div>
    );
}
