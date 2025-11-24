'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import PropertyCard from '@/components/PropertyCard';
import Header from '@/components/Header';
import dynamic from 'next/dynamic';

const HomeMapPreview = dynamic(() => import('@/components/HomeMapPreview'), {
  ssr: false,
  loading: () => <div style={{ height: '450px', background: '#f0f0f0', margin: '40px 0' }}></div>
});

export default function Home() {
  const [activeTab, setActiveTab] = useState('Destacados');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = ['Destacados', 'Lotes', 'Casas/apartamentos', 'Fincas', 'Locales'];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Fetch a larger batch of properties to populate all tabs
        const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        const props = [];
        querySnapshot.forEach(doc => {
          props.push({ id: doc.id, ...doc.data() });
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

  const getFilteredProperties = () => {
    if (activeTab === 'Destacados') return properties;
    if (activeTab === 'Lotes') return properties.filter(p => p.type === 'Lote');
    if (activeTab === 'Fincas') return properties.filter(p => p.type === 'Finca');
    if (activeTab === 'Locales') return properties.filter(p => p.type === 'Local');
    if (activeTab === 'Casas/apartamentos') return properties.filter(p => p.type === 'Casa' || p.type === 'Apartamento');
    return properties;
  };

  const filteredProps = getFilteredProperties();

  return (
    <div className="page">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-bg">
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
              <div className="search-bar">
                <div className="search-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="¿Qué estás buscando? (Ej. Rionegro, Lote...)"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Link href={`/propiedades?search=${searchTerm}`} className="search-btn">
                  Buscar
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Map Preview Section */}
        <HomeMapPreview />

        {/* Categories / Properties Section */}
        <section className="categories-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Explora por Categoría</h2>
              <p className="section-desc">Encuentra el espacio perfecto para tu inversión.</p>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
              <div className="tabs-scroll">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Properties Grid */}
            <div className="properties-grid">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Cargando propiedades...</p>
                </div>
              ) : filteredProps.length > 0 ? (
                filteredProps.map(property => (
                  <div key={property.id} className="prop-card-wrapper">
                    <PropertyCard property={property} />
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No encontramos propiedades en esta categoría por el momento.</p>
                  <button onClick={() => setActiveTab('Destacados')} className="btn-reset">
                    Ver todas las propiedades
                  </button>
                </div>
              )}
            </div>

            <div className="view-more-container">
              <Link href="/propiedades" className="btn-view-more">
                Ver Catálogo Completo →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        /* Global & Layout */
        .page {
          min-height: 100vh;
          background: #fff;
          color: #111;
          font-family: 'Inter', sans-serif;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
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
          background-image: url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80');
          background-size: cover;
          background-position: center;
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
          padding-top: 60px;
        }
        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -1.5px;
          color: #111;
        }
        .highlight {
          background: linear-gradient(120deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 100%);
          padding: 0 10px;
          border-radius: 8px;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          color: #555;
          margin-bottom: 48px;
          font-weight: 400;
        }

        /* Search Bar */
        .search-wrapper {
          max-width: 600px;
          margin: 0 auto;
        }
        .search-bar {
          background: white;
          padding: 8px;
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
          padding: 0 16px;
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
          padding: 12px 32px;
          border-radius: 40px;
          text-decoration: none;
          font-weight: 600;
          transition: background 0.2s;
        }
        .search-btn:hover {
          background: #333;
        }

        /* Categories Section */
        .categories-section {
          padding: 80px 0;
          background: #fff;
        }
        .section-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 16px;
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
          margin-bottom: 40px;
        }
        .tabs-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 8px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none; /* Firefox */
        }
        .tabs-scroll::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        .tab-btn {
          padding: 12px 24px;
          border-radius: 30px;
          border: 1px solid #eee;
          background: white;
          color: #666;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .tab-btn:hover {
          background: #f9f9f9;
          border-color: #ddd;
          color: #333;
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
          gap: 32px;
          min-height: 400px;
        }
        
        .loading-state {
            grid-column: 1 / -1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px;
            color: #666;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #eee;
            border-top-color: #111;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .empty-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 60px;
            background: #f9f9f9;
            border-radius: 24px;
        }
        .btn-reset {
            margin-top: 16px;
            padding: 10px 20px;
            background: #111;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }
        
        .view-more-container {
            margin-top: 60px;
            display: flex;
            justify-content: center;
        }
        .btn-view-more {
            padding: 14px 32px;
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

        @media (max-width: 768px) {
          .hero-title { font-size: 2.5rem; }
          .tabs-container {
            justify-content: flex-start; /* Align left on mobile for scrolling */
          }
          .properties-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
