'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // El AuthContext detectará el cambio y redirigiremos
      router.push('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 style={{ textAlign: 'center', color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>Origo Admin</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@origo.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Ingresar
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-bg);
        }
        .login-card {
          background: white;
          padding: var(--space-lg);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          width: 100%;
          max-width: 400px;
          border: 1px solid var(--color-border);
        }
        .form-group {
          margin-bottom: var(--space-md);
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--color-text-main);
        }
        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          font-size: 1rem;
        }
        .error-message {
          background-color: #fee2e2;
          color: #ef4444;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: var(--space-md);
          text-align: center;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
