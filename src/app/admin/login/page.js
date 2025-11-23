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
      <div className="login-container">
        <div className="login-card">
          <div className="logo-area">
            <h1>Origo</h1>
            <p>Acceso Administrativo</p>
          </div>

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
                placeholder="••••••"
                required
              />
            </div>

            <button type="submit" className="btn-login">
              Ingresar
            </button>
          </form>

          <div className="back-link">
            <a href="/">← Volver al inicio</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80');
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .login-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(8px);
        }

        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          padding: 20px;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.5);
        }

        .logo-area {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo-area h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #111;
          margin-bottom: 4px;
          letter-spacing: -1px;
        }
        .logo-area p {
          color: #666;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
        }
        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          background: #fff;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
        }
        .form-group input:focus {
          border-color: #111;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
        }

        .btn-login {
          width: 100%;
          padding: 14px;
          background: #111;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 8px;
        }
        .btn-login:hover {
          background: #333;
        }

        .error-message {
          background-color: #fee2e2;
          color: #ef4444;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
          font-size: 0.9rem;
        }

        .back-link {
          text-align: center;
          margin-top: 24px;
        }
        .back-link a {
          color: #666;
          font-size: 0.9rem;
          text-decoration: none;
          transition: color 0.2s;
        }
        .back-link a:hover {
          color: #111;
        }
      `}</style>
    </div>
  );
}
