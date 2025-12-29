'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (path) => pathname === path;

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
      href: '/contacto',
      label: 'Contacto',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      )
    }
  ];

  return (
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
          z-index: 10000;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          pointer-events: auto !important;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #000000;
          opacity: 0.6;
          transition: all 0.2s ease;
          padding: 12px;
          border-radius: 20px;
          position: relative;
          min-width: 60px;
          min-height: 60px;
          cursor: pointer;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
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
