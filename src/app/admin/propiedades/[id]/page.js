'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import PropertyForm from '@/components/admin/PropertyForm';
import Link from 'next/link';

export default function EditPropertyPage({ params }) {
    const { id } = params;
    const { user, loading: authLoading } = useAuth();
    const { addToast } = useToast();
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
                        addToast('Propiedad no encontrada', 'error');
                        router.push('/admin/dashboard');
                    }
                } catch (error) {
                    console.error("Error fetching property:", error);
                    addToast('Error al cargar la propiedad', 'error');
                } finally {
                    setLoadingData(false);
                }
            }
        };

        fetchProperty();
    }, [id, user, router, addToast]);

    const handleUpdate = async (propertyData) => {
        setSaving(true);
        try {
            const docRef = doc(db, 'properties', id);
            await updateDoc(docRef, {
                ...propertyData,
                updatedAt: new Date().toISOString(),
                updatedBy: user.email,
                priceNumber: Number(propertyData.price.replace(/[^0-9]/g, '')) || 0
            });

            addToast('Propiedad actualizada exitosamente', 'success');
            router.push('/admin/dashboard');
        } catch (error) {
            console.error("Error updating property:", error);
            addToast("Error al actualizar la propiedad: " + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || !user || loadingData) {
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
            <header className="admin-header">
                <div className="container header-container">
                    <Link href="/admin/dashboard" className="back-link">
                        ← Volver
                    </Link>
                    <h1>Editar Propiedad</h1>
                    <div style={{ width: '60px' }}></div>
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
