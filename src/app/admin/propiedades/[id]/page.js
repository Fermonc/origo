'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import PropertyForm from '@/components/admin/PropertyForm';
import Link from 'next/link';

export default function EditPropertyPage({ params }) {
    const { id } = params;
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [property, setProperty] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/admin/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchProperty = async () => {
            if (id && user) {
                try {
                    const docRef = doc(db, 'properties', id);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setProperty({ id: docSnap.id, ...docSnap.data() });
                    } else {
                        alert('Propiedad no encontrada');
                        router.push('/admin/dashboard');
                    }
                } catch (error) {
                    console.error("Error fetching property:", error);
                } finally {
                    setLoadingData(false);
                }
            }
        };

        fetchProperty();
    }, [id, user, router]);

    const handleUpdate = async (propertyData) => {
        setSaving(true);
        try {
            const docRef = doc(db, 'properties', id);
            await updateDoc(docRef, {
                ...propertyData,
                updatedAt: new Date().toISOString(),
                updatedBy: user.email
            });

            alert('Propiedad actualizada exitosamente');
            router.push('/admin/dashboard');
        } catch (error) {
            console.error("Error updating property:", error);
            alert("Error al actualizar la propiedad: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || !user || loadingData) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="container">
                    <div className="header-flex">
                        <Link href="/admin/dashboard" className="back-link">← Volver al Dashboard</Link>
                        <h1>Editar Propiedad</h1>
                    </div>
                </div>
            </header>

            <main className="container main-content">
                {property && (
                    <PropertyForm
                        initialData={property}
                        onSubmit={handleUpdate}
                        loading={saving}
                    />
                )}
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
