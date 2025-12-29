'use client';

import Image from 'next/image';

export default function HomeClient() {
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
        </div>
      </section>

      <style jsx>{`
        /* Global & Layout */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem; /* 24px */
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
        }
      `}</style>
    </main>
  );
}
