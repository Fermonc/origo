'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import PropertyCard from '@/components/PropertyCard';
import SkeletonCard from '@/components/SkeletonCard';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [properties, setProperties] = useState({});
  const [loading, setLoading] = useState(true);

  // Categories configuration
  const categories = [
    { id: 'Lote', title: 'Lotes', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', description: 'Terrenos listos para construir tus sueños.' },
    { id: 'Local', title: 'Locales', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', description: 'Espacios comerciales estratégicos.' },
    { id: 'Finca', title: 'Fincas', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80', description: 'Descanso y naturaleza en un solo lugar.' }
  ];

  useEffect(() => {
    const fetchAllProperties = async () => {
      try {
        // Fetch recent properties for all categories to have them ready
        // In a larger app, we might fetch on demand, but for "snappy" feel with few items, this is better.
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
      setActiveCategory(null); // Close if clicking same
    } else {
      setActiveCategory(catId); // Open new
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
        {/* New Hero Section */}
        <section className="hero-new">
          <div className="container">
            <h1 className="hero-title-new">Origo</h1>
            <p className="hero-subtitle-new">El origen de tu próximo proyecto.</p>
            <p className="hero-text">Explora nuestras categorías exclusivas.</p>
          </div>
        </section>

        {/* Interactive Categories Section */}
        <section className="categories-section">
          <div className="container">
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
    </div>
  );
}
