'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, createOrUpdateUser } from '@/lib/db/users';

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        phoneNumber: '',
        preferences: {
            notifications: true,
            newsletter: false
        }
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            loadProfile();
        }
    }, [user, loading, router]);

    const loadProfile = async () => {
        try {
            const data = await getUserProfile(user.uid);
            if (data) {
                setProfile(data);
                setFormData({
                    phoneNumber: data.phoneNumber || '',
                    preferences: {
                        notifications: data.preferences?.notifications ?? true,
                        newsletter: data.preferences?.newsletter ?? false
                    }
                });
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await createOrUpdateUser(user, {
                phoneNumber: formData.phoneNumber,
                preferences: formData.preferences
            });
            alert('Perfil actualizado correctamente');
            loadProfile(); // Reload to ensure sync
        } catch (error) {
            console.error("Error saving profile:", error);
            alert('Error al guardar el perfil');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    if (loading || !user) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-header">
                    <h1>Mi Perfil</h1>
                    <button onClick={handleLogout} className="btn-logout">
                        Cerrar Sesión
                    </button>
                </div>

                <div className="profile-grid">
                    <div className="profile-card info-card">
                        <div className="avatar-section">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName} className="avatar" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                                </div>
                            )}
                            <div className="user-info">
                                <h2>{user.displayName || 'Usuario'}</h2>
                                <p>{user.email}</p>
                                <span className="role-badge">{profile?.role || 'Usuario'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-card form-card">
                        <h3>Información Personal</h3>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    placeholder="+54 9 11 ..."
                                />
                            </div>

                            <div className="form-section">
                                <h4>Preferencias</h4>
                                <div className="checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.preferences.notifications}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                preferences: { ...formData.preferences, notifications: e.target.checked }
                                            })}
                                        />
                                        Recibir notificaciones de alertas
                                    </label>
                                </div>
                                <div className="checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.preferences.newsletter}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                preferences: { ...formData.preferences, newsletter: e.target.checked }
                                            })}
                                        />
                                        Suscribirse al newsletter
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="btn-save" disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background-color: #f8f9fa;
          padding: 40px 0;
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .profile-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #111;
          margin: 0;
        }

        .btn-logout {
          padding: 10px 20px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          color: #ef4444;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-logout:hover {
          background: #fee2e2;
          border-color: #fee2e2;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 24px;
        }

        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }

        .profile-card {
          background: white;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }

        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 16px;
          border: 4px solid #f0f0f0;
        }

        .avatar-placeholder {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: #111;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .user-info h2 {
          margin: 0 0 4px 0;
          font-size: 1.25rem;
        }

        .user-info p {
          color: #666;
          margin: 0 0 12px 0;
          font-size: 0.9rem;
        }

        .role-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #f0f0f0;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #555;
          text-transform: uppercase;
        }

        .form-card h3 {
          margin: 0 0 24px 0;
          font-size: 1.25rem;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          font-size: 1rem;
        }

        .form-section {
          margin-bottom: 32px;
          padding-top: 24px;
          border-top: 1px solid #eee;
        }

        .form-section h4 {
          margin: 0 0 16px 0;
          font-size: 1rem;
          color: #555;
        }

        .checkbox-group {
          margin-bottom: 12px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          color: #333;
        }

        .btn-save {
          width: 100%;
          padding: 14px;
          background: #111;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-save:hover {
          background: #333;
        }

        .btn-save:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.2rem;
          color: #666;
        }
      `}</style>
        </div>
    );
}
