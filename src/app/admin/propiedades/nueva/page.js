'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import PropertyForm from '@/components/admin/PropertyForm';
import Link from 'next/link';

export default function NewPropertyPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  const handleCreate = async (propertyData) => {
    setSaving(true);
    try {
      // Add metadata
      const dataToSave = {
        ...propertyData,
        // Estrategia de ahorro aplicada: Denormalización
        // Guardamos el nombre y foto del usuario en la propiedad para NO tener que leer
        // la colección 'users' cada vez que mostramos la tarjeta de la propiedad.
        createdAt: new Date().toISOString(),
        createdBy: user.email,
        publisherName: user.displayName || 'Usuario Origo',
        publisherPhoto: user.photoURL || null,
        userId: user.uid, // Aseguramos el ID para reglas de seguridad
        priceNumber: Number(propertyData.price.replace(/[^0-9]/g, '')) || 0
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'properties'), dataToSave);

      // Trigger Matchmaker
      try {
        await fetch('/api/matchmaker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: docRef.id, ...dataToSave })
        });
      } catch (matchError) {
        console.error("Matchmaker trigger failed:", matchError);
      }

      addToast('Propiedad creada exitosamente', 'success');
      router.push('/admin/dashboard');
    } catch (error) {
      console.error("Error creating property:", error);
      addToast("Error al crear la propiedad: " + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <style jsx>{`
            .loading-screen {
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #0f172a;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <main className="container main-content" style={{ paddingTop: '100px' }}>
        <div className="admin-breadcrumb" style={{ marginBottom: '20px' }}>
          <Link href="/admin/dashboard" className="back-link">← Volver</Link>
          <h1 style={{ marginTop: '10px' }}>Nueva Propiedad</h1>
        </div>
        <PropertyForm onSubmit={handleCreate} loading={saving} />
      </main>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          background-color: #f8fafc;
        }

        .admin-header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 1rem 0;
          margin-bottom: 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        h1 {
          margin: 0;
          font-size: 1.25rem;
          color: #0f172a;
          font-weight: 700;
        }

        .back-link {
          color: #64748b;
          font-weight: 500;
          font-size: 0.9rem;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .back-link:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .main-content {
          padding-bottom: 4rem;
        }
      `}</style>
    </div>
  );
}
