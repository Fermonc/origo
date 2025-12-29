'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer desktop-only">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col">
            <h3 className="footer-logo">Origo</h3>
            <p className="footer-desc">
              Conectamos personas con espacios únicos en el Oriente Antioqueño.
              Tu próximo proyecto comienza aquí.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Instagram">📸</a>
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="WhatsApp">💬</a>
            </div>
          </div>

          {/* Company Column */}
          <div className="footer-col">
            <h4>Empresa</h4>
            <nav className="footer-nav">
              <Link href="/contacto">Sobre Nosotros</Link>
              <Link href="/contacto">Contáctanos</Link>
              <Link href="/terminos">Términos y Condiciones</Link>
              <Link href="/privacidad">Política de Privacidad</Link>
            </nav>
          </div>

          {/* Contact Column */}
          <div className="footer-col">
            <h4>Contacto</h4>
            <p>📍 Rionegro, Antioquia</p>
            <p>📞 +57 300 123 4567</p>
            <p>✉️ info@origo.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Origo Inmobiliaria. Todos los derechos reservados.</p>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background-color: #111;
          color: white;
          padding: var(--space-lg) 0 var(--space-md);
          margin-top: auto;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-lg);
          margin-bottom: var(--space-lg);
        }

        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: 2fr 1fr 1fr;
          }
        }

        .footer-logo {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 1rem;
          letter-spacing: -1px;
        }

        .footer-desc {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 1.5rem;
          max-width: 300px;
        }

        .social-links {
          display: flex;
          gap: 1rem;
          font-size: 1.5rem;
        }

        .social-links a {
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        .social-links a:hover {
          opacity: 1;
        }

        h4 {
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
          color: var(--color-secondary);
        }

        .footer-nav {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-nav a {
          color: rgba(255, 255, 255, 0.7);
          transition: color 0.2s;
        }

        .footer-nav a:hover {
          color: white;
        }

        .footer-col p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.75rem;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: var(--space-md);
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
        }
      `}</style>
    </footer>
  );
}
