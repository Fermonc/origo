'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on property detail pages to avoid overlap with the sticky contact bar
  const isPropertyDetail = /^\/propiedades\/.+/.test(pathname);

  if (isPropertyDetail) {
    return null;
  }

  const isActive = (path) => pathname === path;

  const handleNavClick = (e, href) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(href);
  };

  const navItems = [
    {
      href: '/',
      label: 'Inicio',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      href: '/propiedades',
      label: 'Buscar',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      )
    },
    {
      href: '/mapa',
      label: 'Mapa',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    }
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.href}
          onClick={(e) => handleNavClick(e, item.href)}
          className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
          aria-label={item.label}
        >
          <div className="icon-wrapper">
            {item.icon}
          </div>
          {isActive(item.href) && <span className="active-dot"></span>}
        </button>
      ))}

      <style jsx>{`
        .bottom-nav {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 40px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 8px 12px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          z-index: 9999;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          pointer-events: auto !important;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: #000000;
          opacity: 0.6;
          transition: all 0.2s ease;
          padding: 12px;
          border-radius: 20px;
          position: relative;
          min-width: 60px;
          min-height: 60px;
          cursor: pointer;
        }

        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
          pointer-events: none;
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
          width: 6px;
          height: 6px;
          background-color: #000000;
          border-radius: 50%;
          pointer-events: none;
        }

        .nav-item svg {
          stroke: #000000;
        }

        /* Hide on desktop */
        @media (min-width: 768px) {
          .bottom-nav {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
