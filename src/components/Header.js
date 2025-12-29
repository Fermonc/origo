'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(pathname !== '/');

  useEffect(() => {
    const handleScroll = () => {
      if (pathname !== '/') {
        setScrolled(true);
      } else {
        setScrolled(window.scrollY > 20);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const isActive = (path) => pathname === path;

  return (
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
          <Link href="/contacto" className={`${styles.navLink} ${isActive('/contacto') ? styles.active : ''}`}>
            Contacto
          </Link>
        </nav>

        <div className={styles.rightSection}>
          {/* Right section empty after removing auth/publish */}
        </div>
      </div>
    </header>
  );
}
