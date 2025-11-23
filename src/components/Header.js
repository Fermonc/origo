'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => pathname === path;

    return (
        <>
            <header className={`header ${scrolled ? 'scrolled' : ''}`}>
                <div className="container header-content">
                    <Link href="/" className="logo">Origo</Link>
                    <nav className="nav desktop-only">
                        <Link href="/propiedades" className={`nav-link ${isActive('/propiedades') ? 'active' : ''}`}>Propiedades</Link>
                        <Link href="/mapa" className={`nav-link ${isActive('/mapa') ? 'active' : ''}`}>Mapa</Link>
                        <Link href="/contacto" className={`nav-link ${isActive('/contacto') ? 'active' : ''}`}>Contacto</Link>
                        <Link href="/admin/login" className="btn-login">Admin</Link>
                    </nav>
                </div>
            </header>

            <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 100;
          padding: 20px 0;
          transition: all 0.3s ease;
          background: transparent;
        }
        .header.scrolled {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          padding: 12px 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -1px;
          color: #111;
          text-decoration: none;
        }
        .nav {
          display: flex;
          gap: 32px;
          align-items: center;
        }
        .nav-link {
          color: #666;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
          font-size: 0.95rem;
        }
        .nav-link:hover, .nav-link.active {
          color: #111;
          font-weight: 600;
        }
        .btn-login {
          padding: 8px 24px;
          background: #111;
          color: white;
          border-radius: 30px;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          transition: transform 0.2s, background 0.2s;
        }
        .btn-login:hover {
          transform: scale(1.05);
          background: #000;
        }
        .desktop-only { display: none; }
        @media (min-width: 768px) { .desktop-only { display: flex; } }
      `}</style>
        </>
    );
}
