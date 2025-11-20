'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <nav className="bottom-nav">
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

      <style jsx>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: var(--color-surface);
          /* backdrop-filter: blur(10px); Removed as it requires rgba background for effect, prioritizing visibility first */
          border-top: 1px solid var(--color-border);
          display: flex;
          justify-content: space-around;
          padding: 10px 0;
          z-index: 1000;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
        }

        .nav-item {
          display: flex;
          flex-direction: column !important;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: var(--color-text-muted);
          font-size: 0.7rem;
          gap: 4px;
          transition: color 0.2s;
          width: 100%;
        }

        .nav-item.active {
          color: var(--color-primary);
        }

        .nav-item svg {
          width: 24px;
          height: 24px;
        }

        /* Hide on desktop */
        @media (min-width: 768px) {
          .bottom-nav {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
