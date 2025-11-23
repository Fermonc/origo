'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import PropertyCard from '@/components/PropertyCard';
import SkeletonCard from '@/components/SkeletonCard';

import Header from '@/components/Header';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [properties, setProperties] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // scrolled state is handled in Header now

  // Categories configuration
  const categories = [
    { id: 'Lote', title: 'Lotes', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', description: 'Terrenos listos para construir tus sueños.' },
    { id: 'Local', title: 'Locales', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', description: 'Espacios comerciales estratégicos.' },
    { id: 'Finca', title: 'Fincas', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80', description: 'Descanso y naturaleza en un solo lugar.' }
  ];

  useEffect(() => {
    // Scroll listener removed as it's in Header
    const fetchAllProperties = async () => {
      try {
        const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'), limit(20));
        const querySnapshot = await getDocs(q);

        const propsByCategory = {
          Lote: [],
          Local: [],
          Finca: []
        };

        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (propsByCategory[data.type]) {
            propsByCategory[data.type].push({ id: doc.id, ...data });
          }
        });

        setProperties(propsByCategory);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProperties();
  }, []);

  const toggleCategory = (catId) => {
    if (activeCategory === catId) {
      setActiveCategory(null);
    } else {
      setActiveCategory(catId);
    }
  };

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

        {/* Categories Section */}
        <section className="categories-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Explora por Categoría</h2>
              <p className="section-desc">Encuentra el espacio perfecto para tu inversión.</p>
            </div>

            <div className="categories-grid">
              {categories.map((cat) => (
                <div key={cat.id} className={`category-card ${activeCategory === cat.id ? 'expanded' : ''}`}>
                  <div
                    className="card-visual"
                    onClick={() => toggleCategory(cat.id)}
                    style={{ backgroundImage: `url(${cat.image})` }}
                  >
                    <div className="card-overlay">
                      <div className="card-info">
                        <h3>{cat.title}</h3>
                        <p>{cat.description}</p>
                      </div>
                      <button className="card-toggle">
                        {activeCategory === cat.id ? '−' : '+'}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  <div className={`card-content ${activeCategory === cat.id ? 'show' : ''}`}>
                    <div className="content-inner">
                      {loading ? (
                        <div className="loading-state">Cargando...</div>
                      ) : properties[cat.id]?.length > 0 ? (
                        <div className="props-list">
                          {properties[cat.id].slice(0, 3).map(property => (
                            <div key={property.id} className="mini-prop-card">
                              <PropertyCard property={property} compact={true} />
                            </div>
                          ))}
                          <Link href={`/propiedades?type=${cat.id}`} className="view-all-link">
                            Ver todos los {cat.title} →
                          </Link>
                        </div>
                      ) : (
                        <p className="empty-state">Pronto tendremos propiedades aquí.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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

        /* Header */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 100;
          padding: 20px 0;
          transition: all 0.3s ease;
        }
        .header.scrolled {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          padding: 12px 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -1px;
          color: #111;
        }
        .nav {
          display: flex;
          gap: 32px;
          align-items: center;
        }
        .nav-link {
          color: #444;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: #000;
        }
        .btn-login {
          padding: 8px 20px;
          background: #111;
          color: white;
          border-radius: 20px;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          transition: transform 0.2s;
        }
        .btn-login:hover {
          transform: scale(1.05);
        }
        .desktop-only { display: none; }
        @media (min-width: 768px) { .desktop-only { display: flex; } }

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
          padding: 100px 0;
          background: #fff;
        }
        .section-header {
          text-align: center;
          margin-bottom: 60px;
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

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        .category-card {
          border-radius: 24px;
          overflow: hidden;
          background: #f7f7f7;
          transition: all 0.3s ease;
        }
        .card-visual {
          height: 400px;
          background-size: cover;
          background-position: center;
          position: relative;
          cursor: pointer;
        }
        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 32px;
          color: white;
        }
        .card-info h3 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 8px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .card-info p {
          font-size: 0.95rem;
          opacity: 0.9;
          max-width: 90%;
        }
        .card-toggle {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(4px);
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .card-toggle:hover {
          background: rgba(255,255,255,0.3);
        }

        .card-content {
          height: 0;
          overflow: hidden;
          transition: height 0.4s ease;
        }
        .card-content.show {
          height: auto;
        }
        .content-inner {
          padding: 24px;
        }
        .props-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .view-all-link {
          display: block;
          text-align: center;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 12px;
          text-decoration: none;
          color: #111;
          font-weight: 600;
          margin-top: 16px;
          transition: background 0.2s;
        }
        .view-all-link:hover {
          background: #f0f0f0;
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 2.5rem; }
          .categories-grid { grid-template-columns: 1fr; }
          .card-visual { height: 300px; }
        }
      `}</style>
    </div>
  );
}
