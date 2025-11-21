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
        <Link href="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Inicio</span>
        </Link>

        <Link href="/propiedades" className={`nav-item ${isActive('/propiedades') ? 'active' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span>Explorar</span>
        </Link>

        <Link href="/admin/dashboard" className={`nav-item ${isActive('/admin/dashboard') || isActive('/admin/login') ? 'active' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Perfil</span>
        </Link>

        <Link href="/contacto" className={`nav-item ${isActive('/contacto') ? 'active' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Contacto</span>
        </Link>
      </div>

      <style jsx>{`
        .bottom-nav-container {
          position: fixed;
          bottom: 20px;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          z-index: 1000;
          pointer-events: none; /* Allow clicks to pass through the container area */
        }

        .bottom-nav {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 24px;
          display: flex;
          justify-content: space-around;
          padding: 12px 16px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          pointer-events: auto; /* Re-enable clicks on the nav itself */
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: #888;
          font-size: 0.7rem;
          gap: 4px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 0 8px;
          position: relative;
        }

        .nav-item.active {
          color: var(--color-primary);
          transform: translateY(-2px);
          font-weight: 600;
        }
        
        .nav-item.active svg {
          stroke-width: 2.5;
        }

        .nav-item svg {
          width: 22px;
          height: 22px;
          transition: all 0.3s ease;
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
