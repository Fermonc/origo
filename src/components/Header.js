'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';


export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(pathname !== '/');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
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
            <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Inicio</Link>
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


    </>
  );
}
