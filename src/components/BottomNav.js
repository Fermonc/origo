'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on property detail pages to avoid overlap with the sticky contact bar
  const isPropertyDetail = /^\/propiedades\/.+/.test(pathname);

  if (isPropertyDetail) {
    return null;
  }

  const isActive = (path) => pathname === path;

  const navItems = [
    {
      href: '/',
      label: 'Inicio',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      href: '/propiedades',
      label: 'Buscar',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      )
    },
    {
      href: '/mapa',
      label: 'Mapa',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="6" x2="15" y2="21" />
        </svg>
      )
    },
    {
      href: '/perfil',
      label: 'Perfil',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    }
  ];

  return (
    <nav className="bottom-nav-container">
      <div className="bottom-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
            aria-label={item.label}
          >
            <div className="icon-wrapper">
              {item.icon}
            </div>
            {isActive(item.href) && <span className="active-dot"></span>}
          </Link>
        ))}
      </div>

      <style jsx>{`
        .bottom-nav-container {
          position: fixed;
          bottom: 20px;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          z-index: var(--z-bottom-nav);
          pointer-events: none;
        }

        .bottom-nav {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(0, 0, 0, 0.15);
          border-radius: 40px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 8px 12px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
          pointer-events: auto;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: #000;
          opacity: 0.4;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 12px;
          border-radius: 20px;
          position: relative;
          min-width: 60px;
          min-height: 60px;
        }

        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .nav-item.active {
          opacity: 1;
        }

        .nav-item.active .icon-wrapper {
          transform: translateY(-4px);
        }

        .active-dot {
          position: absolute;
          bottom: 8px;
          width: 5px;
          height: 5px;
          background-color: #000;
          border-radius: 50%;
        }

        .nav-item svg {
          stroke: currentColor;
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
