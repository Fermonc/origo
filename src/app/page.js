'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import PropertyCard from '@/components/PropertyCard';
import SkeletonCard from '@/components/SkeletonCard';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [properties, setProperties] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Categories configuration
  const categories = [
    { id: 'Lote', title: 'Lotes', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', description: 'Terrenos listos para construir tus sueños.' },
    { id: 'Local', title: 'Locales', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', description: 'Espacios comerciales estratégicos.' },
    { id: 'Finca', title: 'Fincas', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80', description: 'Descanso y naturaleza en un solo lugar.' }
  ];

  useEffect(() => {
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
        {/* New Hero Section with Search */}
        <section className="hero-new">
          <div className="container">
            <h1 className="hero-title-new">Origo</h1>
            <p className="hero-subtitle-new">El origen de tu próximo proyecto.</p>

            {/* Search Bar */}
            <div className="search-container">
              <input
                type="text"
                placeholder="¿Qué estás buscando? (Ej. Rionegro, Lote...)"
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Link href={`/propiedades?search=${searchTerm}`} className="search-btn">
                🔍 Buscar
              </Link>
            </div>
          </div>
        </section>

        {/* Interactive Categories Section */}
        <section className="categories-section">
          <div className="container">
            <h2 className="section-title">Explora por Categoría</h2>
            <div className="categories-wrapper">
              {categories.map((cat) => (
                <div key={cat.id} className={`category-group ${activeCategory === cat.id ? 'active' : ''}`}>

                  {/* Category Card / Trigger */}
                  <div
                    className="category-card"
                    onClick={() => toggleCategory(cat.id)}
                    style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${cat.image})` }}
                  >
                    <div className="category-content">
                      <h2>{cat.title}</h2>
                      <p>{cat.description}</p>
                      <span className="btn-explore">{activeCategory === cat.id ? 'Cerrar ▲' : 'Explorar ▼'}</span>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  <div className={`accordion-content ${activeCategory === cat.id ? 'open' : ''}`}>
                    <div className="accordion-inner">
                      <div className="properties-scroll">
                        {loading ? (
                          <>
                            <div style={{ minWidth: '280px' }}><SkeletonCard /></div>
                            <div style={{ minWidth: '280px' }}><SkeletonCard /></div>
                          </>
                        ) : properties[cat.id]?.length > 0 ? (
                          properties[cat.id].map(property => (
                            <div key={property.id} style={{ minWidth: '300px' }}>
                              <PropertyCard property={property} />
                            </div>
                          ))
                        ) : (
                          <div className="no-props">
                            <p>Pronto tendremos propiedades en esta categoría.</p>
                          </div>
                        )}

                        {properties[cat.id]?.length > 0 && (
                          <div className="see-more-card">
                            <Link href={`/propiedades?type=${cat.id}`} className="btn btn-outline-dark">
                              Ver todos los {cat.title} →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .search-container {
          max-width: 600px;
          margin: var(--space-md) auto 0;
          display: flex;
          gap: 0.5rem;
          background: white;
          padding: 0.5rem;
          border-radius: 50px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .search-input {
          flex: 1;
          border: none;
          padding: 0.8rem 1.5rem;
          font-size: 1rem;
          outline: none;
          border-radius: 50px;
        }

        .search-btn {
          background: var(--color-primary);
          color: white;
          padding: 0.8rem 1.5rem;
          border-radius: 50px;
          font-weight: 600;
          display: flex;
          align-items: center;
          transition: background 0.2s;
        }
        
        .search-btn:hover {
          background: var(--color-secondary);
        }

        .section-title {
          font-size: 1.5rem;
          color: var(--color-text-muted);
          margin-bottom: var(--space-md);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .search-container {
            flex-direction: column;
            background: transparent;
            box-shadow: none;
            padding: 0;
          }
          
          .search-input {
            width: 100%;
            padding: 1rem;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          }
          
          .search-btn {
            width: 100%;
            justify-content: center;
            border-radius: 12px;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
