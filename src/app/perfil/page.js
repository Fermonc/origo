'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, createOrUpdateUser } from '@/lib/db/users';
import Header from '@/components/Header';
import UserFavorites from '@/components/UserFavorites';
import UserAlerts from '@/components/UserAlerts';
import UserDocuments from '@/components/UserDocuments';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account'); // account, favorites, alerts, documents
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    preferences: { notifications: true, newsletter: false }
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
      loadProfile();
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

  if (loading || !user) return <div className="loading">Cargando...</div>;

  return (
    <div className="page">
      <Header />
      <div className="profile-container">
        <div className="container">
          {/* Profile Header */}
          <div className="profile-header-card">
            <div className="user-summary">
              <div className="avatar-large">
                {user.photoURL ? <img src={user.photoURL} alt={user.displayName} /> : <span>{user.displayName?.[0]}</span>}
              </div>
              <div>
                <h1>{user.displayName}</h1>
                <p>{user.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
          </div>

          {/* Tabs Navigation */}
          <div className="tabs-nav">
            <button className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>👤 Mi Cuenta</button>
            <button className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>❤️ Favoritos</button>
            <button className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>🔍 Buscando</button>
            <button className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>📂 Documentos</button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'account' && (
              <div className="account-settings">
                <div className="settings-card">
                  <h3>Información Personal</h3>
                  <form onSubmit={handleSave}>
                    <div className="form-group">
                      <label>Teléfono de Contacto</label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="+57 300 ..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Preferencias</label>
                      <div className="checkbox-group">
                        <label><input type="checkbox" checked={formData.preferences.notifications} onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, notifications: e.target.checked } })} /> Recibir notificaciones</label>
                        <label><input type="checkbox" checked={formData.preferences.newsletter} onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, newsletter: e.target.checked } })} /> Suscribirse al newsletter</label>
                      </div>
                    </div>
                    <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Guardando...' : 'Guardar Cambios'}</button>
                  </form>
                </div>
                <div className="settings-card danger-zone">
                  <h3>Zona de Peligro</h3>
                  <p>Estas acciones no se pueden deshacer.</p>
                  <button className="btn-delete-account" onClick={() => alert('Funcionalidad de eliminar cuenta pendiente de implementación segura.')}>Eliminar Cuenta</button>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && <UserFavorites user={user} />}
            {activeTab === 'alerts' && <UserAlerts user={user} />}
            {activeTab === 'documents' && <UserDocuments user={user} />}
          </div>
        </div>
      </div>

      <style jsx>{`
                .page { min-height: 100vh; background: #f8f9fa; padding-top: 80px; }
                .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
                
                .profile-header-card {
                    background: white;
                    padding: 32px;
                    border-radius: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                }
                .user-summary { display: flex; align-items: center; gap: 24px; }
                .avatar-large {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: #111;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    font-weight: 700;
                    overflow: hidden;
                }
                .avatar-large img { width: 100%; height: 100%; object-fit: cover; }
                h1 { margin: 0 0 4px 0; font-size: 1.8rem; }
                p { margin: 0; color: #666; }
                
                .btn-logout {
                    padding: 10px 20px;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 12px;
                    color: #ef4444;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-logout:hover { background: #fee2e2; border-color: #fee2e2; }

                .tabs-nav {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 32px;
                    overflow-x: auto;
                    padding-bottom: 4px;
                }
                .tab-btn {
                    padding: 12px 24px;
                    background: white;
                    border: none;
                    border-radius: 30px;
                    color: #666;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .tab-btn.active {
                    background: #111;
                    color: white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .settings-card {
                    background: white;
                    padding: 32px;
                    border-radius: 20px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                }
                .settings-card h3 { margin: 0 0 24px 0; font-size: 1.25rem; }
                
                .form-group { margin-bottom: 24px; }
                .form-group label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; }
                .form-group input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd; }
                
                .checkbox-group { display: flex; flex-direction: column; gap: 12px; }
                .checkbox-group label { display: flex; align-items: center; gap: 10px; font-weight: 400; cursor: pointer; }
                
                .btn-save { padding: 12px 32px; background: #111; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
                
                .danger-zone { border: 1px solid #fee2e2; }
                .danger-zone h3 { color: #ef4444; }
                .btn-delete-account { padding: 12px 24px; background: #fee2e2; color: #ef4444; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
                
                .loading { display: flex; justify-content: center; align-items: center; height: 100vh; color: #666; }
                
                @media (max-width: 768px) {
                    .profile-header-card { flex-direction: column; text-align: center; gap: 24px; }
                    .user-summary { flex-direction: column; }
                }
            `}</style>
    </div>
  );
}
