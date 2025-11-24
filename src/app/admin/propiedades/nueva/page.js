'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import PropertyForm from '@/components/admin/PropertyForm';
import Link from 'next/link';

export default function NewPropertyPage() {
  const { user, loading: authLoading } = useAuth();
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
        createdAt: new Date().toISOString(),
        createdBy: user.email
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
        // Don't block the flow if matchmaker fails
      }

      alert('Propiedad creada exitosamente');
      router.push('/admin/dashboard');
    } catch (error) {
      console.error("Error creating property:", error);
      alert("Error al crear la propiedad: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container">
          <div className="header-flex">
            <Link href="/admin/dashboard" className="back-link">← Volver al Dashboard</Link>
            <h1>Nueva Propiedad</h1>
          </div>
        </div>
      </header>

      <main className="container main-content">
        <PropertyForm onSubmit={handleCreate} loading={saving} />
      </main>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          background-color: var(--color-bg);
        }

        .admin-header {
          background: white;
          border-bottom: 1px solid var(--color-border);
          padding: 1.5rem 0;
          margin-bottom: 2rem;
        }

        .header-flex {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .back-link {
          color: var(--color-text-muted);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .back-link:hover {
          color: var(--color-primary);
        }

        h1 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--color-primary);
        }

        .main-content {
          padding-bottom: 4rem;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.2rem;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
