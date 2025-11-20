'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import SkeletonDetail from '@/components/SkeletonDetail';
import PropertyMap from '@/components/PropertyMap';

export default function PropertyDetailClient({ id }) {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const docRef = doc(db, 'properties', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProperty({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return <SkeletonDetail />;
  }

  if (!property) {
    return (
      <div className="container" style={{ padding: 'var(--space-xl) 0', textAlign: 'center' }}>
        <h1>Propiedad no encontrada</h1>
        <Link href="/propiedades" className="btn btn-primary" style={{ marginTop: 'var(--space-sm)' }}>
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="desktop-only" style={{ padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--color-border)', background: 'white' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Origo</Link>
          <nav>
            <Link href="/propiedades" style={{ marginRight: 'var(--space-sm)', fontWeight: 'bold', color: 'var(--color-secondary)' }}>Propiedades</Link>
            <Link href="/contacto" className="btn btn-primary">Contacto</Link>
          </nav>
        </div>
      </header>

      <main style={{ paddingBottom: 'var(--space-xl)' }}>
        {/* Image Gallery Carousel */}
        <div className="gallery-container">
          <div className="gallery-scroll">
            {property.images && property.images.length > 0 ? (
              property.images.map((img, index) => (
                <div key={index} className="gallery-item">
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image
                      src={img}
                      alt={`${property.title} - ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      priority={index === 0}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="gallery-item">
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </div>
              </div>
            )}
          </div>

          <div className="overlay">
            <div className="container">
              <span className="badge">{property.type}</span>
              <h1 className="title">{property.title}</h1>
              <p className="location">📍 {property.location}</p>
              {property.images && property.images.length > 1 && (
                <div className="gallery-indicator">
                  📷 {property.images.length} Fotos (Desliza →)
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop: 'var(--space-lg)' }}>
          <div className="content-grid">
            {/* Main Info */}
            <div className="details">
              <div className="price-card mobile-only">
                <p className="price-label">Precio de Venta</p>
                <p className="price-value">{property.price}</p>
              </div>

              <section className="section">
                <h2>Descripción</h2>
                <p style={{ color: 'var(--color-text-muted)', whiteSpace: 'pre-line' }}>
                  {property.description}
                </p>
              </section>

              <section className="section">
                <h2>Características</h2>
                <ul className="features-list">
                  <li>📐 <strong>Área:</strong> {property.area}</li>
                  {property.beds && <li>🛏️ <strong>Habitaciones:</strong> {property.beds}</li>}
                  {property.baths && <li>🚿 <strong>Baños:</strong> {property.baths}</li>}
                  {/* Handle features if array or undefined */}
                  {property.features && Array.isArray(property.features) && property.features.map((feature, index) => (
                    <li key={index}>✅ {feature}</li>
                  ))}
                </ul>
              </section>

              {property.lat && property.lng && (
                <section className="section">
                  <h2>Ubicación</h2>
                  <PropertyMap lat={property.lat} lng={property.lng} title={property.title} />
                </section>
              )}
            </div>

            {/* Sidebar / Sticky Contact */}
            <aside className="sidebar">
              <div className="contact-card">
                <p className="price-label">Precio de Venta</p>
                <p className="price-value">{property.price}</p>
                <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  ¿Te interesa esta propiedad? Contáctanos directamente por WhatsApp para agendar una visita.
                </p>
                <a
                  href={`https://wa.me/573000000000?text=Hola, estoy interesado en la propiedad ${property.title} (ID: ${property.id})`}
                  target="_blank"
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  <span>💬</span> Contactar por WhatsApp
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <style jsx>{`
        .gallery-container {
          position: relative;
          height: 60vh;
          background-color: #eee;
        }
        
        .gallery-scroll {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          height: 100%;
          scrollbar-width: none; /* Firefox */
        }
        .gallery-scroll::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }

        .gallery-item {
          flex: 0 0 100%;
          scroll-snap-align: start;
          height: 100%;
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          padding: var(--space-lg) 0 var(--space-md);
          color: white;
          pointer-events: none; /* Let clicks pass through to image if needed */
        }
        
        .gallery-indicator {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(4px);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }

        .badge {
          background: var(--color-secondary);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: inline-block;
          margin-bottom: 0.5rem;
        }
        .title {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        .location {
          font-size: 1.1rem;
          opacity: 0.9;
        }
        
        .content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-lg);
        }
        
        @media (min-width: 768px) {
          .content-grid {
            grid-template-columns: 2fr 1fr;
          }
        }

        .section {
          margin-bottom: var(--space-lg);
        }
        .section h2 {
          font-size: 1.5rem;
          color: var(--color-primary);
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 0.5rem;
        }

        .features-list {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        .features-list li {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          color: var(--color-text-main);
        }

        .contact-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          border: 1px solid var(--color-border);
          position: sticky;
          top: 2rem;
        }
        .price-label {
          font-size: 0.9rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .price-value {
          font-size: 2rem;
          font-weight: bold;
          color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}
