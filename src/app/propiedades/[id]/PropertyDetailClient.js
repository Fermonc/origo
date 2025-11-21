'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { doc, getDoc, collection, addDoc, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import SkeletonDetail from '@/components/SkeletonDetail';
import PropertyMap from '@/components/PropertyMap';
import PropertyCard from '@/components/PropertyCard';
import { formatPrice } from '@/utils/format';

export default function PropertyDetailClient({ id }) {
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStickyNav, setShowStickyNav] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

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

    if (id) {
      fetchPropertyAndSimilar();
    }
  }, [id]);

  // Scroll effect for sticky nav
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyNav(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        ...contactForm,
        propertyId: property.id,
        propertyTitle: property.title,
        createdAt: new Date().toISOString(),
        read: false
      });
      setSent(true);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Hubo un error al enviar el mensaje. Intenta nuevamente.");
    } finally {
      setSending(false);
    }
  };

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

  const images = property.images && property.images.length > 0
    ? property.images
    : property.image
      ? [property.image]
      : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="page">
      {/* Header Navigation */}
      <header className={`main-header ${showStickyNav ? 'scrolled' : ''}`}>
        <div className="container header-content">
          <Link href="/" className="logo">Origo</Link>
          <div className="header-actions">
            <button className="btn-icon" aria-label="Compartir">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
            <button className="btn-icon" aria-label="Guardar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main style={{ paddingBottom: '80px' }}>
        {/* Gallery Section */}
        <div className="gallery-wrapper">
          {/* Mobile Carousel */}
          <div className="mobile-gallery">
            <div className="gallery-scroll">
              {images.map((img, index) => (
                <div key={index} className="gallery-item">
                  <Image
                    src={img}
                    alt={`${property.title} - ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
            <div className="gallery-counter">
              1 / {images.length}
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="desktop-gallery container">
            <div className="gallery-grid">
              <div className="grid-main">
                <Image
                  src={images[0]}
                  alt={property.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
              <div className="grid-sub">
                {images.slice(1, 5).map((img, index) => (
                  <div key={index} className="grid-item">
                    <Image
                      src={img}
                      alt={`${property.title} - ${index + 2}`}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    {index === 3 && images.length > 5 && (
                      <div className="more-overlay">
                        +{images.length - 5} fotos
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container content-wrapper">
          <div className="content-grid">
            {/* Main Info */}
            <div className="details-column">
              <div className="property-header">
                <div className="header-top">
                  <span className="badge">{property.type}</span>
                  <span className="location-text">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {property.location}
                  </span>
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
              </div>

              <hr className="divider" />

              <section className="section">
                <h2>Descripción</h2>
                <p className="description-text">
                  {property.description}
                </p>
              </section>

              <hr className="divider" />

              <section className="section">
                <h2>Lo que ofrece este lugar</h2>
                <ul className="features-grid">
                  {property.features && Array.isArray(property.features) && property.features.map((feature, index) => (
                    <li key={index}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="check-icon">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>

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

            {/* Sidebar / Sticky Contact */}
            <aside className="sidebar-column">
              <div className="sticky-card">
                <div className="card-price">
                  <span className="price-amount">{formatPrice(property.price)}</span>
                </div>

                <div className="contact-box">
                  {sent ? (
                    <div className="success-message">
                      <div className="success-icon">✅</div>
                      <h3>¡Mensaje enviado!</h3>
                      <p>Un asesor te contactará pronto.</p>
                      <button onClick={() => setSent(false)} className="btn-link">Nuevo mensaje</button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="contact-form">
                      <div className="input-group">
                        <input
                          type="text"
                          name="name"
                          placeholder="Nombre completo"
                          value={contactForm.name}
                          onChange={handleContactChange}
                          required
                          className="form-input"
                        />
                      </div>
                      <div className="input-group">
                        <input
                          type="email"
                          name="email"
                          placeholder="Correo electrónico"
                          value={contactForm.email}
                          onChange={handleContactChange}
                          required
                          className="form-input"
                        />
                      </div>
                      <div className="input-group">
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Teléfono"
                          value={contactForm.phone}
                          onChange={handleContactChange}
                          required
                          className="form-input"
                        />
                      </div>
                      <div className="input-group">
                        <textarea
                          name="message"
                          placeholder="Hola, me interesa..."
                          value={contactForm.message}
                          onChange={handleContactChange}
                          rows="3"
                          className="form-input textarea"
                        ></textarea>
                      </div>

                      <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
                        {sending ? 'Enviando...' : 'Contactar Agente'}
                      </button>
                    </form>
                  )}

                  <div className="separator">
                    <span>o</span>
                  </div>

                  <a
                    href={`https://wa.me/573000000000?text=Hola, estoy interesado en la propiedad ${property.title} (ID: ${property.id})`}
                    target="_blank"
                    className="btn btn-whatsapp btn-block"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382C17.112 14.202 15.344 13.332 15.013 13.212C14.682 13.092 14.442 13.032 14.202 13.392C13.962 13.752 13.272 14.562 13.062 14.802C12.852 15.042 12.642 15.072 12.282 14.892C11.922 14.712 10.762 14.332 9.382 13.102C8.272 12.112 7.522 10.892 7.312 10.532C7.102 10.172 7.292 9.982 7.472 9.802C7.632 9.642 7.832 9.382 8.012 9.172C8.192 8.962 8.252 8.812 8.372 8.572C8.492 8.332 8.432 8.122 8.342 7.942C8.252 7.762 7.532 5.992 7.232 5.272C6.942 4.572 6.642 4.672 6.432 4.672C6.232 4.662 6.002 4.662 5.762 4.662C5.522 4.662 5.132 4.752 4.802 5.112C4.472 5.472 3.542 6.342 3.542 8.112C3.542 9.882 4.832 11.592 5.012 11.832C5.192 12.072 7.562 15.732 11.192 17.302C12.052 17.672 12.732 17.892 13.262 18.062C14.322 18.402 15.282 18.352 16.042 18.232C16.892 18.102 18.662 17.152 19.032 16.112C19.402 15.072 19.402 14.192 19.282 13.992C19.172 13.792 18.932 13.662 18.572 13.482H17.472V14.382Z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12C0 14.084 0.536 16.036 1.476 17.748L0.085 22.833L5.29 21.467C6.936 22.364 8.803 22.835 10.724 22.835H12C18.627 22.835 24 17.462 24 10.835C24 4.208 18.627 0 12 0ZM12 20.949C10.187 20.949 8.468 20.449 6.988 19.57L6.638 19.362L2.885 20.347L3.887 16.688L3.658 16.323C2.706 14.809 2.159 13.049 2.159 11.165C2.159 5.743 6.572 1.33 11.994 1.33C17.416 1.33 21.829 5.743 21.829 11.165C21.829 16.587 17.416 20.949 12 20.949Z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            </aside>
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

      {/* Mobile Sticky Bottom Bar */}
      <div className="mobile-sticky-bar">
        <div className="bar-content">
          <div className="bar-price">
            <span className="label">Precio</span>
            <span className="value">{formatPrice(property.price)}</span>
          </div>
          <a
            href={`https://wa.me/573000000000?text=Hola, estoy interesado en la propiedad ${property.title} (ID: ${property.id})`}
            target="_blank"
            className="btn btn-whatsapp btn-compact"
          >
            Contactar
          </a>
        </div>
      </div>

      <style jsx>{`
        /* --- Global & Layout --- */
        .page {
          background-color: #fff;
          color: #222;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .container {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .content-wrapper {
          margin-top: 24px;
        }
        .content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
        }
        @media (min-width: 1024px) {
          .content-grid {
            grid-template-columns: 2fr 1fr;
          }
        }

        /* --- Header --- */
        .main-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          height: 64px;
          display: flex;
          align-items: center;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-primary);
          letter-spacing: -0.5px;
        }
        .header-actions {
          display: flex;
          gap: 12px;
        }
        .btn-icon {
          background: transparent;
          border: none;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          color: #222;
          transition: background 0.2s;
        }
        .btn-icon:hover {
          background: #f7f7f7;
        }

        /* --- Gallery --- */
        .gallery-wrapper {
          position: relative;
        }
        /* Mobile */
        .mobile-gallery {
          display: block;
          position: relative;
          height: 300px;
        }
        .gallery-scroll {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          height: 100%;
          scrollbar-width: none;
        }
        .gallery-scroll::-webkit-scrollbar { display: none; }
        .gallery-item {
          flex: 0 0 100%;
          scroll-snap-align: start;
          height: 100%;
          position: relative;
        }
        .gallery-counter {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        /* Desktop */
        .desktop-gallery {
          display: none;
          padding-top: 24px;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 8px;
          height: 400px;
          border-radius: 16px;
          overflow: hidden;
        }
        .grid-main {
          position: relative;
          height: 100%;
        }
        .grid-sub {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 8px;
          height: 100%;
        }
        .grid-item {
          position: relative;
          height: 100%;
        }
        .more-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
        }
        @media (min-width: 768px) {
          .mobile-gallery { display: none; }
          .desktop-gallery { display: block; }
        }

        /* --- Property Details --- */
        .property-header {
          margin-bottom: 24px;
        }
        .header-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .badge {
          background: #e0e7ff;
          color: #3730a3;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .location-text {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #666;
          font-size: 0.95rem;
          text-decoration: underline;
        }
        .title {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 20px;
          color: #111;
        }
        .key-features {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .feature-pill {
          border: 1px solid #ddd;
          padding: 8px 16px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .feature-value {
          font-weight: 700;
          font-size: 1.1rem;
          color: #222;
        }
        .feature-label {
          font-size: 0.8rem;
          color: #666;
        }

        .divider {
          border: none;
          border-top: 1px solid #eee;
          margin: 32px 0;
        }

        .section h2 {
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: #222;
        }
        .description-text {
          font-size: 1rem;
          line-height: 1.6;
          color: #444;
          white-space: pre-line;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          list-style: none;
        }
        @media (min-width: 600px) {
          .features-grid { grid-template-columns: 1fr 1fr; }
        }
        .features-grid li {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #333;
          font-size: 1rem;
        }
        .check-icon {
          color: #222;
        }

        .map-container {
          height: 300px;
          border-radius: 12px;
          overflow: hidden;
          background: #eee;
        }

        /* --- Sidebar / Sticky Card --- */
        .sidebar-column {
          display: none;
        }
        @media (min-width: 1024px) {
          .sidebar-column { display: block; }
        }
        .sticky-card {
          position: sticky;
          top: 100px;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          background: white;
        }
        .card-price {
          margin-bottom: 20px;
        }
        .price-amount {
          font-size: 1.8rem;
          font-weight: 700;
          color: #111;
        }
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .input-group {
          position: relative;
        }
        .form-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: #222;
        }
        .textarea {
          resize: vertical;
          min-height: 80px;
        }
        .btn {
          padding: 14px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          border: none;
          font-size: 1rem;
        }
        .btn-primary {
          background: linear-gradient(135deg, #222 0%, #000 100%);
          color: white;
        }
        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .btn-block {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .separator {
          text-align: center;
          margin: 16px 0;
          position: relative;
        }
        .separator span {
          background: white;
          padding: 0 10px;
          color: #666;
          font-size: 0.9rem;
          position: relative;
          z-index: 1;
        }
        .separator::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background: #eee;
        }
        .btn-whatsapp {
          background: #25D366;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .success-message {
          text-align: center;
          padding: 20px 0;
        }
        .success-icon {
          font-size: 2rem;
          margin-bottom: 10px;
        }
        .btn-link {
          background: none;
          border: none;
          color: #666;
          text-decoration: underline;
          cursor: pointer;
          margin-top: 10px;
        }

        /* --- Mobile Sticky Bar --- */
        .mobile-sticky-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #eee;
          padding: 16px 20px;
          z-index: 90;
          box-shadow: 0 -4px 10px rgba(0,0,0,0.05);
        }
        @media (min-width: 1024px) {
          .mobile-sticky-bar { display: none; }
        }
        .bar-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1120px;
          margin: 0 auto;
        }
        .bar-price {
          display: flex;
          flex-direction: column;
        }
        .bar-price .label {
          font-size: 0.8rem;
          color: #666;
        }
        .bar-price .value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #111;
        }
        .btn-compact {
          padding: 10px 24px;
          font-size: 0.95rem;
        }

        /* --- Similar Section --- */
        .similar-section {
          margin-top: 60px;
        }
        .similar-grid {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          padding-bottom: 20px;
          scroll-snap-type: x mandatory;
        }
        .similar-item {
          min-width: 280px;
          scroll-snap-align: start;
        }
      `}</style>
    </div>
  );
}
