'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import PropertyForm from '@/components/admin/PropertyForm'; // Reusing the form
import Header from '@/components/Header';

export default function VenderPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (!authLoading) {
      if (!user) {
        // If not logged in, redirect to login with a return url
        router.push('/login?redirect=/vender');
      }
    }
  }, [user, authLoading, router]);

  const handleCreate = async (propertyData) => {
    setSaving(true);
    try {
      // Add metadata
      const dataToSave = {
        ...propertyData,
        createdAt: new Date().toISOString(),
        createdBy: user.email,
        creatorId: user.uid, // Track the specific user ID
        status: 'Disponible', // Default status
        role: 'seller', // Mark as seller-created (optional, but good for filtering)
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

      addToast('Propiedad publicada exitosamente', 'success');
      router.push('/perfil'); // Redirect to profile or the new property page
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
                background: #f8f9fa;
            }
            .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #eee;
                border-top-color: #111;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Header />
      <div className="container main-content">
        <div className="page-header">
           <h1>Publicar Propiedad</h1>
           <p>Completa la información para vender tu inmueble</p>
        </div>

        <div className="form-wrapper">
            <PropertyForm onSubmit={handleCreate} loading={saving} />
        </div>
      </div>

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background-color: #f8f9fa;
          padding-top: 80px; /* Space for fixed header */
        }

        .main-content {
          padding-bottom: 4rem;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
            text-align: center;
            margin-bottom: 40px;
        }

        .page-header h1 {
            font-size: 2.5rem;
            font-weight: 800;
            margin: 0 0 10px 0;
            color: #111;
        }

        .page-header p {
            color: #666;
            font-size: 1.1rem;
        }

        .form-wrapper {
            /* styles to make the form look good outside of admin context */
        }
      `}</style>
    </div>
  );
}
