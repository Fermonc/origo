'use client';

import { useState, useEffect } from 'react';
import PropertyCard from '@/components/PropertyCard';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import SkeletonCard from '@/components/SkeletonCard';

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'), limit(3));
        const querySnapshot = await getDocs(q);
        const props = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeaturedProperties(props);
      } catch (error) {
        console.error("Error fetching featured:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="page">
      <header className="header desktop-only">
        <div className="container header-content">
          <div className="logo">Origo</div>
          <nav className="nav">
            <Link href="/propiedades">Propiedades</Link>
            <Link href="/contacto">Contacto</Link>
            <Link href="/admin/login" className="btn-login">Admin</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-overlay"></div>
          <div className="container hero-content">
            <h2 className="hero-title">
              Encuentra tu espacio ideal
            </h2>
            <p className="hero-subtitle">
              Locales, Lotes y Fincas exclusivas. Conectamos con la naturaleza y el comercio.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center' }}>
              <Link href="/propiedades" className="btn btn-primary">Ver Inmuebles</Link>
              <Link href="/contacto" className="btn btn-outline">Contáctanos</Link>
            </div>
          </div>
        </section>

        <style jsx>{`
          .hero-section {
            position: relative;
            padding: var(--space-xl) 0;
            text-align: center;
            background-image: url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80');
            background-size: cover;
            background-position: center;
            color: white;
            min-height: 60vh;
            display: flex;
            align-items: center;
          }
          .hero-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1;
          }
          .hero-content {
            position: relative;
            z-index: 2;
          }
          .hero-title {
            font-size: 3.5rem;
            margin-bottom: var(--space-sm);
            color: white;
            letter-spacing: -1px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .hero-subtitle {
            font-size: 1.25rem;
            color: #f3f4f6;
            margin-bottom: var(--space-md);
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          }
          .btn-outline {
            background: transparent;
            border: 2px solid white;
            color: white;
          }
          .btn-outline:hover {
            background: white;
            color: var(--color-primary);
          }
        `}</style>

        {/* Featured Properties */}
        <section style={{ padding: 'var(--space-lg) 0' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 'var(--space-md)' }}>
              <div>
                <h3 style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>Propiedades Destacadas</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>Oportunidades únicas seleccionadas para ti</p>
              </div>
              <Link href="/propiedades" style={{ color: 'var(--color-secondary)', fontWeight: '600' }}>Ver todas →</Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 'var(--space-md)'
            }}>
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                featuredProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
