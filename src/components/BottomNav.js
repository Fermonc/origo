'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on property detail pages to avoid overlap with the sticky contact bar
  // Matches /propiedades/ followed by any character (indicating an ID)
  const isPropertyDetail = /^\/propiedades\/.+/.test(pathname);

  if (isPropertyDetail) {
    return null;
  }

  const isActive = (path) => pathname === path;

  return (
    <nav className="bottom-nav-container">
      <div className="bottom-nav">
        <Link href="/" className={`nav-item ${isActive('/') ? 'active' : ''}`} aria-label="Inicio">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </Link>

        <Link href="/propiedades" className={`nav-item ${isActive('/propiedades') ? 'active' : ''}`} aria-label="Explorar">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </Link>

        <Link href="/mapa" className={`nav-item ${isActive('/mapa') ? 'active' : ''}`} aria-label="Mapa">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="6" x2="15" y2="21" />
          </svg>
        </Link>

        <Link href="/admin/dashboard" className={`nav-item ${isActive('/admin/dashboard') || isActive('/admin/login') ? 'active' : ''}`} aria-label="Perfil">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </Link>

        <Link href="/contacto" className={`nav-item ${isActive('/contacto') ? 'active' : ''}`} aria-label="Contacto">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </Link>
      </div>

      <style jsx>{`
        .bottom-nav-container {
          position: fixed;
          bottom: 24px;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          z-index: 1000;
          pointer-events: none;
        }

        .bottom-nav {
          background: rgba(20, 20, 20, 0.85); /* Darker background for better contrast with white icons or lighter for dark icons? User wants premium. Let's go with a sleek dark glass or pure white glass. Let's stick to white glass but cleaner. */
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 30px;
          display: flex;
          justify-content: space-between;
          padding: 12px 24px;
          width: auto;
          gap: 24px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
          pointer-events: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: #111; /* Changed from #999 to #111 for better visibility */
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 8px;
          border-radius: 12px;
          position: relative;
        }

        .nav-item:hover {
          background: rgba(0, 0, 0, 0.03);
          color: #000;
        }

        .nav-item.active {
          color: #111; /* Strong black for active */
          background: rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }
        
        .nav-item.active svg {
          stroke-width: 2.5;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .nav-item svg {
          transition: all 0.3s ease;
          stroke: #111; /* Force black stroke */
        }

        /* Hide on desktop */
        @media (min-width: 768px) {
          .bottom-nav-container {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
