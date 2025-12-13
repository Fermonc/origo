'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { createOrUpdateUser } from '@/lib/db/users';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { googleLogin } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update Profile (Display Name)
      await updateProfile(user, {
        displayName: name
      });

      // 3. Create Firestore Document
      await createOrUpdateUser(user, {
        displayName: name,
        phoneNumber: phone,
        role: isSeller ? 'seller' : 'buyer'
      });

      const nextRoute = isSeller ? '/admin/dashboard' : '/perfil';
      router.push(nextRoute);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('Error al registrarse. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const user = await googleLogin();

      if (isSeller) {
        await createOrUpdateUser(user, {
          role: 'seller'
        });
        router.push('/admin/dashboard');
      } else {
        // Check if user already has a role to avoid overwriting existing sellers who accidentally login here?
        // For now, standard behavior: just profile or dashboard depending on role?
        // Simpler: Just redirect to profile, but if they are ALREADY a seller, maybe dashboard?
        // Let's stick to the request: if 'isSeller' is checked, make them seller and go to dashboard.
        router.push('/perfil');
      }
    } catch (err) {
      console.error(err);
      setError('Error al registrarse con Google.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="logo-area">
            <Link href="/" className="logo-link">
              <h1>Origo</h1>
            </Link>
            <p>Crea tu cuenta</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Nombre Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="300 123 4567"
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
                minLength={6}
              />
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isSeller"
                checked={isSeller}
                onChange={(e) => setIsSeller(e.target.checked)}
              />
              <label htmlFor="isSeller">Quiero vender propiedades</label>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>

          <div className="divider">
            <span>O continúa con</span>
          </div>

          <button onClick={handleGoogleLogin} className="btn-google">
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
            Google
          </button>

          <div className="auth-footer">
            <p>¿Ya tienes cuenta? <Link href="/login">Inicia Sesión</Link></p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f5f5;
          padding: 20px;
        }

        .auth-container {
          width: 100%;
          max-width: 400px;
        }

        .auth-card {
          background: white;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .logo-area {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-link {
          text-decoration: none;
        }

        .logo-area h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #111;
          margin: 0 0 8px 0;
          letter-spacing: -1px;
        }

        .logo-area p {
          color: #666;
          font-size: 0.95rem;
          margin: 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
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
            box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 24px;
        }
        .checkbox-group input {
            width: auto;
        }
        .checkbox-group label {
            font-weight: 500;
            color: #333;
            cursor: pointer;
        }

        .btn-primary {
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
        }

        .btn-primary:hover {
          background: #333;
        }

        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: #888;
          font-size: 0.85rem;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #eee;
        }

        .divider span {
          padding: 0 10px;
        }

        .btn-google {
          width: 100%;
          padding: 12px;
          background: white;
          color: #333;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          font-weight: 500;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-google:hover {
          background: #f9f9f9;
          border-color: #d0d0d0;
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

        .auth-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 0.9rem;
          color: #666;
        }

        .auth-footer a {
          color: #111;
          font-weight: 600;
          text-decoration: none;
        }

        .auth-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
