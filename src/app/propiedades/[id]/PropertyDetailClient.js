'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import SkeletonDetail from '@/components/SkeletonDetail';
import PropertyMap from '@/components/PropertyMap';
import PropertyCard from '@/components/PropertyCard';
import ImageGallery from '@/components/property/ImageGallery';
import ContactSidebar from '@/components/property/ContactSidebar';
import { formatPrice } from '@/utils/format';

export default function PropertyDetailClient({ id }) {
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStickyNav, setShowStickyNav] = useState(false);

  useEffect(() => {
    const fetchPropertyAndSimilar = async () => {
      try {
        const docRef = doc(db, 'properties', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const propData = { id: docSnap.id, ...docSnap.data() };
          setProperty(propData);

          if (propData.type) {
            const q = query(
              collection(db, 'properties'),
              where('type', '==', propData.type),
              limit(4)
            );
            const querySnapshot = await getDocs(q);
            const similar = [];
            querySnapshot.forEach((doc) => {
              if (doc.id !== id) {
                similar.push({ id: doc.id, ...doc.data() });
              }
            });
            setSimilarProperties(similar);
          }
        }
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPropertyAndSimilar();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => setShowStickyNav(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <SkeletonDetail />;

  if (!property) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h1>Propiedad no encontrada</h1>
        <Link href="/propiedades" className="btn-back">
          Volver al catálogo
        </Link>
        <style jsx>{`
            .btn-back {
                display: inline-block;
                margin-top: 16px;
                padding: 10px 20px;
                background: #111;
                color: white;
                text-decoration: none;
                border-radius: 8px;
            }
        `}</style>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : property.image
      ? [property.image]
      : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="page page-offset-top">
      {/* Scroll Sticky Header moved to RootLayout */}

      {/* Scroll Sticky Property Bar (optional, can replace Header behavior if desired) */}
      <header className={`main-header ${showStickyNav ? 'scrolled' : ''}`}>
        <div className="container header-content">
          <span className="logo detail-title">{property.title}</span>
          <div className="header-actions">
            <button className="btn-icon">❤️</button>
            <button className="btn-icon">🔗</button>
          </div>
        </div>
      </header>

      <main style={{ paddingBottom: '80px' }}>
        <ImageGallery images={images} title={property.title} />

        <div className="container content-wrapper">
          <div className="content-grid">

            {/* Main Info Column */}
            <div className="details-column">
              <div className="property-header">
                <div className="header-top">
                  <span className="badge">{property.type}</span>
                  <span className="location-text">📍 {property.location}</span>
                </div>
                <h1 className="title">{property.title}</h1>

                <div className="key-features">
                  <div className="feature-pill">
                    <span className="feature-value">{property.area} m²</span>
                    <span className="feature-label">Área</span>
                  </div>
                  {property.bedrooms && (
                    <div className="feature-pill">
                      <span className="feature-value">{property.bedrooms}</span>
                      <span className="feature-label">Habitaciones</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="feature-pill">
                      <span className="feature-value">{property.bathrooms}</span>
                      <span className="feature-label">Baños</span>
                    </div>
                  )}
                </div>

                <div className="extra-details-grid">
                  {property.yearBuilt && <DetailItem label="Año" value={property.yearBuilt} />}
                  {property.estrato && <DetailItem label="Estrato" value={property.estrato} />}
                  {property.administration && <DetailItem label="Admin" value={formatPrice(property.administration)} />}
                  {property.access && <DetailItem label="Acceso" value={property.access} />}
                </div>
              </div>

              <hr className="divider" />

              <section className="section">
                <h2>Descripción</h2>
                <p className="description-text">{property.description}</p>
              </section>

              <hr className="divider" />

              <section className="section">
                <h2>Características</h2>
                <ul className="features-grid">
                  {property.features?.map((feature, index) => (
                    <li key={index}>✅ {feature}</li>
                  ))}
                </ul>
              </section>

              {property.videoUrl && (
                <>
                  <hr className="divider" />
                  <section className="section">
                    <h2>Video</h2>
                    <div className="video-container">
                      <iframe
                        src={property.videoUrl.replace("watch?v=", "embed/")}
                        title="Video"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </section>
                </>
              )}

              <hr className="divider" />

              {property.lat && property.lng && (
                <section className="section">
                  <h2>Ubicación</h2>
                  <div className="map-container">
                    <PropertyMap lat={property.lat} lng={property.lng} title={property.title} />
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar Column */}
            <ContactSidebar property={property} />

          </div>

          {/* Similar Properties */}
          {similarProperties.length > 0 && (
            <section className="section similar-section">
              <h2>Propiedades Similares</h2>
              <div className="similar-grid">
                {similarProperties.map(sim => (
                  <div key={sim.id} className="similar-item">
                    <PropertyCard property={sim} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Mobile Sticky Bar - Simplified */}
      <div className="mobile-sticky-bar">
        <div className="bar-content">
          <div className="bar-price">
            <span className="value">{formatPrice(property.price)}</span>
          </div>
          <a
            href={`https://wa.me/573000000000?text=Info ${property.title}`}
            target="_blank"
            className="btn-whatsapp-mobile"
          >
            Contactar
          </a>
        </div>
      </div>

      <style jsx>{`
        .page { background-color: #fff; color: #222; font-family: 'Inter', sans-serif; }
        .container { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
        .content-wrapper { margin-top: 24px; }
        .content-grid { display: grid; grid-template-columns: 1fr; gap: 48px; }
        @media (min-width: 1024px) { .content-grid { grid-template-columns: 2fr 1fr; } }

        .main-header { position: fixed; top: var(--header-height); left: 0; right: 0; z-index: 900; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border-bottom: 1px solid #eee; height: 64px; display: flex; align-items: center; transition: transform 0.3s; transform: translateY(-100%); }
        .main-header.scrolled { transform: translateY(0); }
        .header-content { display: flex; justify-content: space-between; width: 100%; }
        .logo { font-weight: 800; font-size: 1.5rem; text-decoration: none; color: #111; }
        .header-actions { display: flex; gap: 10px; }
        .btn-icon { background: none; border: 1px solid #eee; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; }

        .badge { background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; }
        .location-text { color: #666; font-size: 0.95rem; }
        .header-top { display: flex; gap: 12px; margin-bottom: 12px; align-items: center; }
        .title { font-size: 2rem; font-weight: 800; line-height: 1.2; margin-bottom: 20px; color: #111; }

        .key-features { display: flex; gap: 16px; flex-wrap: wrap; }
        .feature-pill { border: 1px solid #ddd; padding: 8px 16px; border-radius: 8px; text-align: center; }
        .feature-value { display: block; font-weight: 700; font-size: 1.1rem; }
        .feature-label { font-size: 0.8rem; color: #666; }

        .extra-details-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; margin-top: 24px; background: #f9fafb; padding: 20px; border-radius: 12px; }
        
        .divider { border: 0; border-top: 1px solid #eee; margin: 32px 0; }
        .section h2 { font-size: 1.4rem; font-weight: 600; margin-bottom: 16px; }
        .description-text { font-size: 1rem; line-height: 1.6; color: #444; white-space: pre-line; }
        
        .features-grid { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
        .features-grid li { font-size: 1rem; color: #333; }

        .video-container { position: relative; padding-bottom: 56.25%; background: #000; border-radius: 12px; overflow: hidden; }
        .video-container iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
        
        .map-container { height: 300px; border-radius: 12px; overflow: hidden; background: #eee; }

        .similar-section { margin-top: 60px; }
        .similar-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }

        .mobile-sticky-bar { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #eee; padding: 12px 20px; z-index: 90; display: block; }
        @media (min-width: 1024px) { .mobile-sticky-bar { display: none; } }
        .bar-content { display: flex; justify-content: space-between; align-items: center; max-width: 1120px; margin: 0 auto; }
        .bar-price .value { font-weight: 800; font-size: 1.2rem; }
        .btn-whatsapp-mobile { background: #25D366; color: white; padding: 10px 24px; border-radius: 30px; text-decoration: none; font-weight: 600; }
      `}</style>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{label}</span>
      <span style={{ fontWeight: '600', color: '#0f172a' }}>{value}</span>
    </div>
  );
}
