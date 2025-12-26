'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import styles from './Header.module.css';

export default function Header() {
  // Force rebuild hash v3
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
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.headerContent}`}>
          <div className={styles.leftSection}>
            <Link href="/" className={`${styles.logo} ${scrolled ? styles.logoScrolled : ''}`}>
              Origo<span>.</span>
            </Link>
          </div>

          <nav className={`${styles.nav} ${styles.desktopOnly}`}>
            <Link href="/" className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>
              Inicio
            </Link>
            <Link href="/servicios" className={`${styles.navLink} ${isActive('/servicios') ? styles.active : ''}`}>
              Servicios
            </Link>
            <Link href="/nosotros" className={`${styles.navLink} ${isActive('/nosotros') ? styles.active : ''}`}>
              Nosotros
            </Link>
            <Link href="/propiedades" className={`${styles.navLink} ${isActive('/propiedades') ? styles.active : ''}`}>
              Propiedades
            </Link>
            <Link href="/mapa" className={`${styles.navLink} ${isActive('/mapa') ? styles.active : ''}`}>
              Mapa
            </Link>
            <Link href="/contacto" className={`${styles.navLink} ${isActive('/contacto') ? styles.active : ''}`}>
              Contacto
            </Link>
          </nav>

          <div className={styles.rightSection}>
            {user && (
              <Link href="/vender" className={styles.btnPublish}>Publicar</Link>
            )}

            {!loading && (
              user ? (
                <Link href="/perfil" className={styles.userProfileLink}>
                  <div className={styles.avatarSmall}>
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
                    {unreadNotifications > 0 && <span className={styles.notificationDot}></span>}
                  </div>
                  <span className={styles.userName}>{user.displayName?.split(' ')[0] || 'Perfil'}</span>
                </Link>
              ) : (
                <div className={styles.authButtons}>
                  <Link href="/login" className={styles.btnLoginText}>Ingresar</Link>
                  <Link href="/register" className={styles.btnRegister}>Registrarse</Link>
                </div>
              )
            )}
          </div>
        </div>
      </header>
    </>
  );
}
