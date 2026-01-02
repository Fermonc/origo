'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './Header.module.css';

export default function Header() {
    const { user, loading } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    // Close menu when a link is clicked
    const closeMenu = () => setMenuOpen(false);

    return (
        <header className={styles.header}>
            {/* Logo Section */}
            <Link href="/" className={styles.logo} onClick={closeMenu}>
                <span>ORIGO</span>
            </Link>

            {/* Navigation Links */}
            <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
                <Link href="/" className={styles.navLink} onClick={closeMenu}>Inicio</Link>
                <Link href="/servicios" className={styles.navLink} onClick={closeMenu}>Servicios</Link>
                <Link href="/nosotros" className={styles.navLink} onClick={closeMenu}>Nosotros</Link>
                <Link href="/propiedades" className={styles.navLink} onClick={closeMenu}>Propiedades</Link>

                {/* Mobile only actions added to nav for better UX */}
                <div className={styles.mobileActions}>
                    {!loading && !user && (
                        <>
                            <Link href="/login" className={styles.loginBtnMobile} onClick={closeMenu}>Iniciar Sesión</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Action Buttons (Desktop / Always Visible) */}
            <div className={styles.actions}>
                {!loading && (
                    user ? (
                        <div className={styles.userSection}>
                            <span className={styles.welcomeText}>Hola, {user.displayName?.split(' ')[0] || 'Usuario'}</span>
                            <div className={styles.avatar}>
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Avatar" className={styles.avatarImg} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        {user.email?.[0].toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link href="/login" className={styles.loginBtn}>
                                Iniciar Sesión
                            </Link>
                            <Link href="/registro" className={styles.registerBtn}>
                                Registrarse
                            </Link>
                        </>
                    )
                )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
                className={styles.menuToggle}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                <div className={`${styles.bar} ${menuOpen ? styles.barOpen : ''}`} />
                <div className={`${styles.bar} ${menuOpen ? styles.barOpen : ''}`} />
                <div className={`${styles.bar} ${menuOpen ? styles.barOpen : ''}`} />
            </button>
        </header>
    );
}
