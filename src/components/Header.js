'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      // Force scrolled state (white background) if not on home page
      if (pathname !== '/') {
        setScrolled(true);
      } else {
        setScrolled(window.scrollY > 20);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
      if (user) {
          const q = query(collection(db, 'users', user.uid, 'notifications'), where('read', '==', false));
          const unsubscribe = onSnapshot(q, (snapshot) => {
              setUnreadNotifications(snapshot.size);
          });
          return () => unsubscribe();
      }
  }, [user]);

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

            {user && (
              <Link href="/vender" className="btn-publish">Publicar</Link>
            )}

            {!loading && (
              user ? (
                <Link href="/perfil" className="user-profile-link">
                  <div className="avatar-small">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt="User"
                        width={32}
                        height={32}
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <span>{user.displayName ? user.displayName[0].toUpperCase() : 'U'}</span>
                    )}
                    {unreadNotifications > 0 && <span className="notification-dot"></span>}
                  </div>
                  <span className="user-name">{user.displayName?.split(' ')[0] || 'Perfil'}</span>
                </Link>
              ) : (
                <div className="auth-buttons">
                  <Link href="/login" className="btn-login-text">Ingresar</Link>
                  <Link href="/register" className="btn-register">Registrarse</Link>
                </div>
              )
            )}
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
        
        .auth-buttons {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .btn-login-text {
            color: #111;
            font-weight: 600;
            text-decoration: none;
            font-size: 0.95rem;
        }
        .btn-register {
          padding: 8px 20px;
          background: #111;
          color: white;
          border-radius: 30px;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          transition: transform 0.2s, background 0.2s;
        }
        .btn-register:hover {
          transform: scale(1.05);
          background: #000;
        }

        .btn-publish {
            padding: 8px 16px;
            border: 2px solid #111;
            border-radius: 30px;
            color: #111;
            font-weight: 700;
            text-decoration: none;
            font-size: 0.9rem;
            transition: all 0.2s;
        }
        .btn-publish:hover {
            background: #111;
            color: white;
        }

        .user-profile-link {
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            color: #111;
            padding: 4px 12px 4px 4px;
            background: #f5f5f5;
            border-radius: 30px;
            transition: background 0.2s;
        }
        .user-profile-link:hover {
            background: #e0e0e0;
        }
        .avatar-small {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #111;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
            overflow: hidden;
            position: relative;
        }
        .notification-dot {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 8px;
            height: 8px;
            background-color: #ef4444;
            border-radius: 50%;
            border: 1px solid white;
        }
        .avatar-small img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .user-name {
            font-weight: 600;
            font-size: 0.9rem;
        }

        .desktop-only { display: none; }
        @media (min-width: 768px) { .desktop-only { display: flex; } }
      `}</style>
    </>
  );
}
