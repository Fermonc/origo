import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            {/* Logo Section */}
            <Link href="/" className={styles.logo}>
                <span>ORIGO</span>
            </Link>

            {/* Navigation Links */}
            <nav className={styles.nav}>
                <Link href="/" className={styles.navLink}>Inicio</Link>
                <Link href="/servicios" className={styles.navLink}>Servicios</Link>
                <Link href="/nosotros" className={styles.navLink}>Nosotros</Link>
                <Link href="/propiedades" className={styles.navLink}>Propiedades</Link>
            </nav>

            {/* Action Buttons */}
            <div className={styles.actions}>
                <Link href="/login" className={styles.loginBtn}>
                    Iniciar Sesión
                </Link>
                <Link href="/registro" className={styles.registerBtn}>
                    Registrarse
                </Link>
            </div>
        </header>
    );
}
