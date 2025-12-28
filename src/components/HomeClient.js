'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';
import SkeletonCard from '@/components/SkeletonCard';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { getPropertiesByType } from '@/lib/db/properties';



const TABS = ['Destacados', 'Lotes', 'Casas', 'Apartamentos', 'Fincas', 'Locales'];

export default function HomeClient({ initialProperties = [] }) {
  const [activeTab, setActiveTab] = useState('Destacados');
  const [properties, setProperties] = useState(initialProperties);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cache, setCache] = useState({ 'Destacados': initialProperties });

  // Handle Tab Change with Real Fetching
  useEffect(() => {
    const fetchTabData = async () => {
      // If we have it in cache, use it
      if (cache[activeTab]) {
        setProperties(cache[activeTab]);
        return;
      }

      setLoading(true);
      try {
        let results = [];
        if (activeTab === 'Casas/apartamentos') {
          // Complex case, maybe handled simpler by splitting tabs or parallel queries
          // For now let's simplify tabs to match DB types usually or do 2 queries
          const casas = await getPropertiesByType('Casa');
          const aptos = await getPropertiesByType('Apartamento');
          results = [...casas, ...aptos];
        } else {
          results = await getPropertiesByType(activeTab); // 'Lote', 'Finca', etc.
        }

        setProperties(results);
        setCache(prev => ({ ...prev, [activeTab]: results }));
      } catch (error) {
        console.error("Error changing tab:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab !== 'Destacados') {
      fetchTabData();
    } else {
      setProperties(initialProperties);
    }
  }, [activeTab, initialProperties]); // Adding initialProperties to deps is safe

  // Filter by search term on the Client Side (for the current view)
  // Ideally search should also be server-side but for < 50 items client is fine for "interactive" feel
  const displayProperties = properties.filter(p => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();
    return (
      p.title?.toLowerCase().includes(lowerTerm) ||
      p.location?.toLowerCase().includes(lowerTerm) ||
      p.type?.toLowerCase().includes(lowerTerm)
    );
  });

  return (
    <main id="main-content">
      {/* Hero Section */}
      <section className="hero" aria-label="Bienvenida">
        <div className="hero-bg" aria-hidden="true">
          <Image
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80"
            alt="Finca de lujo en el Oriente Antioqueño"
            fill
            priority
            style={{ objectFit: 'cover' }}
            sizes="100vw"
          />
          <div className="overlay"></div>
        </div>

        <div className="container hero-content">
          <h1 className="hero-title">
            El origen de tu <br />
            <span className="highlight">próximo proyecto.</span>
          </h1>
          <p className="hero-subtitle">Descubre lotes, fincas y locales exclusivos en el Oriente Antioqueño.</p>

          {/* Premium Search Bar */}
          <div className="search-wrapper">
            <div className="search-bar" role="search">
              <div className="search-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <label htmlFor="hero-search" className="sr-only">Buscar propiedades</label>
              <input
                id="hero-search"
                type="text"
                placeholder="¿Qué estás buscando? (Ej. Rionegro, Lote...)"
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Link
                href={`/propiedades?search=${searchTerm}`}
                className="search-btn"
                aria-label="Buscar propiedades"
              >
                Buscar
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* Categories / Properties Section */}
      <section className="categories-section" id="properties-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Explora por Categoría</h2>
            <p className="section-desc">Encuentra el espacio perfecto para tu inversión.</p>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <div className="tabs-scroll" role="tablist" aria-label="Categorías de propiedades">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls="properties-grid"
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Properties Grid */}
          <div id="properties-grid" className="properties-grid" role="region" aria-live="polite">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-wrapper">
                  <SkeletonCard />
                </div>
              ))
            ) : displayProperties.length > 0 ? (
              displayProperties.map(property => (
                <div key={property.id} className="prop-card-wrapper">
                  <PropertyCard property={property} />
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No encontramos propiedades en esta categoría.</p>
                <button
                  onClick={() => setActiveTab('Destacados')}
                  className="btn-reset"
                >
                  Ver destacados
                </button>
              </div>
            )}
          </div>

          <div className="view-more-container">
            <Link href="/propiedades" className="btn-view-more">
              Ver Catálogo Completo <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Global & Layout */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem; /* 24px */
        }

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }

        /* Hero Section */
        .hero {
          position: relative;
          height: 90vh;
          min-height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
        }
        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.95));
        }
        .hero-content {
          position: relative;
          text-align: center;
          max-width: 800px;
          padding-top: 3.75rem; /* 60px */
        }
        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem; /* 24px */
          letter-spacing: -1.5px;
          color: #111;
        }
        .highlight {
          background: linear-gradient(120deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 100%);
          padding: 0 0.625rem; /* 10px */
          border-radius: 8px;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          color: #555;
          margin-bottom: 3rem; /* 48px */
          font-weight: 400;
        }

        /* Search Bar */
        .search-wrapper {
          max-width: 600px;
          margin: 0 auto;
        }
        .search-bar {
          background: white;
          padding: 0.5rem; /* 8px */
          border-radius: 50px;
          display: flex;
          align-items: center;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .search-bar:focus-within {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }
        .search-icon {
          padding: 0 1rem; /* 16px */
          color: #999;
        }
        .search-input {
          flex: 1;
          border: none;
          font-size: 1rem;
          outline: none;
          color: #111;
          background: transparent;
        }
        .search-btn {
          background: #111;
          color: white;
          padding: 0.75rem 2rem; /* 12px 32px */
          border-radius: 40px;
          text-decoration: none;
          font-weight: 600;
          transition: background 0.2s;
        }
        .search-btn:hover {
          background: #333;
        }
        .search-btn:focus-visible {
            outline: 3px solid #333;
            outline-offset: 2px;
        }

        /* Categories Section */
        .categories-section {
          padding: 5rem 0; /* 80px */
          background: #fff;
        }
        .section-header {
          text-align: center;
          margin-bottom: 2.5rem; /* 40px */
        }
        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem; /* 16px */
          letter-spacing: -1px;
        }
        .section-desc {
          font-size: 1.1rem;
          color: #666;
        }

        /* Tabs */
        .tabs-container {
          display: flex;
          justify-content: center;
          margin-bottom: 2.5rem; /* 40px */
        }
        .tabs-scroll {
          display: flex;
          gap: 0.75rem; /* 12px */
          overflow-x: auto;
          padding: 0.5rem; /* 8px */
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .tabs-scroll::-webkit-scrollbar {
          display: none;
        }
        .tab-btn {
          padding: 0.75rem 1.5rem; /* 12px 24px */
          border-radius: 30px;
          border: 1px solid #eee;
          background: white;
          color: #666;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          min-height: 44px; /* A11y */
        }
        .tab-btn:hover {
          background: #f9f9f9;
          border-color: #ddd;
          color: #333;
        }
        .tab-btn:focus-visible {
            outline: 3px solid #111;
            outline-offset: 2px;
        }
        .tab-btn.active {
          background: #111;
          color: white;
          border-color: #111;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        /* Properties Grid */
        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem; /* 32px */
          min-height: 400px;
        }
        
        .map-loading {
            height: 450px;
            background: #f0f0f0;
            margin: 40px 0;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
        }

        .empty-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3.75rem; /* 60px */
            background: #f9f9f9;
            border-radius: 24px;
        }
        .btn-reset {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: #111;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }
        .btn-reset:hover { background: #333; }
        .btn-reset:focus-visible { outline: 3px solid #333; outline-offset: 2px; }
        
        .view-more-container {
            margin-top: 3.75rem; /* 60px */
            display: flex;
            justify-content: center;
        }
        .btn-view-more {
            padding: 0.875rem 2rem; /* 14px 32px */
            background: white;
            border: 1px solid #111;
            color: #111;
            border-radius: 50px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
        }
        .btn-view-more:hover {
            background: #111;
            color: white;
        }
        .btn-view-more:focus-visible {
            outline: 3px solid #111;
            outline-offset: 2px;
        }

        @media (max-width: 768px) {
          .hero {
            height: 80vh; /* Better for mobile viewports */
            min-height: 500px;
          }
          .hero-content {
            padding-top: 2rem;
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .hero-title { 
            font-size: 2.25rem; /* ~36px */
            margin-bottom: 1rem;
          }
          .hero-subtitle {
            font-size: 1rem;
            margin-bottom: 2rem;
          }
          .search-bar {
            padding: 0.25rem; /* Tighter on mobile */
          }
          .search-btn {
            padding: 0.75rem 1.5rem;
          }
          
          .categories-section {
            padding: 3rem 0;
          }
          
          .tabs-container {
            justify-content: flex-start;
            margin-left: -1.5rem; /* Break container padding */
            margin-right: -1.5rem;
            padding-left: 1.5rem; /* Add it back inside scroll */
            padding-right: 1.5rem;
          }
          .tabs-scroll {
             padding: 0.5rem 1.5rem; /* Extra padding for edge clicking */
          }
          
          .properties-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </main>
  );
}
