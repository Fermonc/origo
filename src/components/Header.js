"use client";
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import styles from './Header.module.css';

export default function Header() {
  const { user, role, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    // Clean header structure
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <Link href="/" className={styles.logo}>
            Origo
          </Link>
        </div>

        <nav className={styles.nav}>
          <Link href="/mapa" className={styles.link}>
            Mapa
          </Link>

          {!loading && (
            <div className={styles.authSection}>
              {user ? (
                <>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.displayName || 'Usuario'}</span>
                    <span className={styles.userRole}>{role === 'admin' ? 'Admin' : 'Cliente'}</span>
                  </div>
                  <button onClick={handleLogout} className={styles.logoutBtn}>
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className={styles.loginBtn}>
                    Ingresar
                  </Link>
                  <Link href="/registro" className={styles.registerBtn}>
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
