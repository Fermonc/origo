'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserFavorites } from '@/lib/db/favorites';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

// Assuming PropertyCard is available. If not, we'll need to import it or create a simple list.
// I'll use a placeholder or try to import it if I knew the path for sure.
// Based on previous steps, it's likely in src/components/PropertyCard.js
import PropertyCard from '@/components/PropertyCard';

export default function FavoritesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [favorites, setFavorites] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            loadFavorites();
        }
    }, [user, loading, router]);

    const loadFavorites = async () => {
        setFetching(true);
        try {
            const favIds = await getUserFavorites(user.uid);

            if (favIds.length === 0) {
                setFavorites([]);
                setFetching(false);
                return;
            }

            // Fetch property details for each ID
            // Note: In a real app, we might want to use a "where in" query if IDs are < 10,
            // or fetch individually. For simplicity, I'll fetch individually here.
            const properties = await Promise.all(
                favIds.map(async (id) => {
                    const docRef = doc(db, 'properties', id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        return { id: docSnap.id, ...docSnap.data() };
                    }
                    return null;
                })
            );

            setFavorites(properties.filter(p => p !== null));
        } catch (error) {
            console.error("Error loading favorites:", error);
        } finally {
            setFetching(false);
        }
    };

    if (loading || !user) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="favorites-page">
            <div className="container">
                <div className="header">
                    <h1>Mis Favoritos</h1>
                    <p>{favorites.length} propiedades guardadas</p>
                </div>

                {fetching ? (
                    <div className="loading-grid">Cargando favoritos...</div>
                ) : favorites.length > 0 ? (
                    <div className="properties-grid">
                        {favorites.map(property => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">❤️</div>
                        <h2>Aún no tienes favoritos</h2>
                        <p>Guarda las propiedades que te interesen para verlas aquí.</p>
                        <Link href="/" className="btn-browse">
                            Explorar Propiedades
                        </Link>
                    </div>
                )}
            </div>

            <style jsx>{`
        .favorites-page {
          min-height: 100vh;
          background-color: #f8f9fa;
          padding: 40px 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .header {
          margin-bottom: 32px;
        }

        .header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #111;
          margin: 0 0 8px 0;
        }

        .header p {
          color: #666;
        }

        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .empty-state h2 {
          font-size: 1.5rem;
          color: #111;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          color: #666;
          margin: 0 0 24px 0;
        }

        .btn-browse {
          display: inline-block;
          padding: 12px 24px;
          background: #111;
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          transition: background 0.2s;
        }

        .btn-browse:hover {
          background: #333;
        }

        .loading, .loading-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          font-size: 1.2rem;
          color: #666;
        }
      `}</style>
        </div>
    );
}
