'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, createOrUpdateUser } from '@/lib/db/users';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import Header from '@/components/Header';
import UserFavorites from '@/components/UserFavorites';
import UserAlerts from '@/components/UserAlerts';
import UserDocuments from '@/components/UserDocuments';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImg(true);
    try {
      // Create a reference to 'profile_images/UID'
      const storageRef = ref(storage, `profile_images/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      // Update Auth Profile
      await updateProfile(user, { photoURL });

      // Update Firestore User Doc
      await createOrUpdateUser(user, { photoURL });

      // Force reload to update UI
      window.location.reload();
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error al subir la imagen. Intenta de nuevo.");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("⚠️ ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible y perderás todos tus datos, favoritos y alertas.")) {
      return;
    }

    try {
      const uid = user.uid;
      // 1. Delete Firestore Data
      await deleteDoc(doc(db, 'users', uid));

      // 2. Delete Auth User
      await deleteUser(user);

      alert("Tu cuenta ha sido eliminada correctamente.");
      router.push('/');
    } catch (error) {
      console.error("Error deleting account:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert("Por seguridad, debes iniciar sesión nuevamente antes de eliminar tu cuenta.");
        await logout();
        router.push('/login');
      } else {
        alert("Hubo un error al eliminar la cuenta. Por favor contacta a soporte.");
      }
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

  if (loading || !user) return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );


  return (
    <div className="page">
      <Header />
      <div className="profile-container">
        <div className="container">
          {/* Profile Header */}
          <div className="profile-header-card">
            <div className="user-summary">
              <div className="avatar-wrapper" onClick={handleImageClick} title="Cambiar foto de perfil">
                <div className="avatar-large">
                  {user.photoURL ? <img src={user.photoURL} alt={user.displayName} /> : <span>{user.displayName?.[0]}</span>}
                </div>
                <div className="avatar-overlay">
                  <span>📷</span>
                </div>
                {uploadingImg && <div className="avatar-loading">...</div>}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: 'none' }}
                accept="image/*"
              />

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
                        className="input-premium"
                      />
                    </div>
                    <div className="form-group">
                      <label>Preferencias</label>
                      <div className="checkbox-group">
                        <label className="checkbox-label">
                          <input type="checkbox" checked={formData.preferences.notifications} onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, notifications: e.target.checked } })} />
                          <span>Recibir notificaciones</span>
                        </label>
                        <label className="checkbox-label">
                          <input type="checkbox" checked={formData.preferences.newsletter} onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, newsletter: e.target.checked } })} />
                          <span>Suscribirse al newsletter</span>
                        </label>
                      </div>
                    </div>
                    <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Guardando...' : 'Guardar Cambios'}</button>
                  </form>
                </div>

                <div className="settings-card">
                  <h3>Documentación</h3>
                  <UserDocuments user={user} profile={profile} />
                </div>

                <div className="settings-card danger-zone">
                  <h3>Zona de Peligro</h3>
                  <p>Estas acciones no se pueden deshacer. Se eliminarán permanentemente tus datos, favoritos y alertas.</p>
                  <button className="btn-delete-account" onClick={handleDeleteAccount}>Eliminar Cuenta</button>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && <UserFavorites user={user} />}
            {activeTab === 'alerts' && <UserAlerts user={user} />}
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
        
        .avatar-wrapper {
            position: relative;
            cursor: pointer;
            width: 80px;
            height: 80px;
        }
        .avatar-large {
            width: 100%;
            height: 100%;
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
        
        .avatar-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.2s;
        }
        .avatar-wrapper:hover .avatar-overlay { opacity: 1; }
        .avatar-overlay span { font-size: 1.5rem; }
        .avatar-loading {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255,255,255,0.8);
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%; color: #111; font-weight: bold;
        }

        h1 { margin: 0 0 4px 0; font-size: 1.8rem; color: #111; font-weight: 800; }
        p { margin: 0; color: #555; font-weight: 500; }
        
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
        .settings-card h3 { margin: 0 0 24px 0; font-size: 1.25rem; color: #111; font-weight: 700; }
        
        .form-group { margin-bottom: 24px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 700; font-size: 0.95rem; color: #111; }
        
        .input-premium {
            width: 100%;
            padding: 14px;
            border-radius: 12px;
            border: 1px solid #e0e0e0;
            background: #f9f9f9;
            font-size: 1rem;
            color: #111;
            transition: all 0.2s;
        }
        .input-premium:focus {
            background: white;
            border-color: #111;
            box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
            outline: none;
        }
        
        .checkbox-group { display: flex; flex-direction: column; gap: 16px; }
        .checkbox-label { 
            display: flex; 
            align-items: center; 
            gap: 12px; 
            font-weight: 500; 
            cursor: pointer; 
            color: #333;
            padding: 8px 0;
        }
        .checkbox-label input {
            width: 20px;
            height: 20px;
            accent-color: #111;
        }
        
        .btn-save { 
            padding: 14px 32px; 
            background: #111; 
            color: white; 
            border: none; 
            border-radius: 12px; 
            font-weight: 600; 
            cursor: pointer; 
            font-size: 1rem;
            transition: background 0.2s;
        }
        .btn-save:hover { background: #333; }
        
        .danger-zone { border: 1px solid #fee2e2; background: #fff5f5; }
        .danger-zone h3 { color: #ef4444; }
        .danger-zone p { color: #b91c1c; margin-bottom: 20px; }
        .btn-delete-account { 
            padding: 12px 24px; 
            background: #ef4444; 
            color: white; 
            border: none; 
            border-radius: 12px; 
            font-weight: 600; 
            cursor: pointer; 
            transition: background 0.2s;
        }
        .btn-delete-account:hover { background: #dc2626; }
        
        .loading { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f8f9fa; }
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #eee;
            border-top-color: #111;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
            .profile-header-card { flex-direction: column; text-align: center; gap: 24px; }
            .user-summary { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
