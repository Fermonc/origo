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
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Origo
        </Link>
        <nav className={styles.nav}>
          <Link href="/mapa" className={styles.link}>
            Mapa
          </Link>

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-sm text-gray-300">
                    <span className="block font-medium text-white">{user.displayName || user.email}</span>
                    <span className="text-xs uppercase tracking-wider opacity-70">{role === 'admin' ? 'Administrador' : 'Usuario'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 ml-4">
                  <Link href="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                    Ingresar
                  </Link>
                  <Link href="/registro" className="px-4 py-2 text-sm bg-white text-gray-900 rounded-lg hover:bg-gray-100 font-medium transition-colors">
                    Registrarse
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
