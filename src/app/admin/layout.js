'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile } from '@/lib/db/users';

export default function AdminLayout({ children }) {
    const { user, loading: authLoading } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [checkingRole, setCheckingRole] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Wait for Auth Context to Initialize
        if (authLoading) return;

        if (!user) {
            router.replace('/admin/login');
            return;
        }

        const verifyAdmin = async () => {
            try {
                const profile = await getUserProfile(user.uid);
                if (profile?.role === 'admin' || profile?.role === 'seller') {
                    // Allow admins and sellers to enter the "admin area" (dashboard)
                    // Specific permissions for what they can SEE are handled in the pages/components
                    setIsAuthorized(true);
                } else {
                    // Regular users shouldn't be here
                    router.replace('/perfil');
                }
            } catch (error) {
                console.error("Role verification failed", error);
                router.replace('/');
            } finally {
                setCheckingRole(false);
            }
        };

        verifyAdmin();
    }, [user, authLoading, router]);

    if (authLoading || checkingRole) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
                <p>Verificando permisos...</p>
                <style jsx>{`
            .admin-loading {
                height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 16px;
                color: #666;
            }
            .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #eee;
                border-top: 3px solid #111;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Will redirect
    }

    return (
        <>
            {children}
        </>
    );
}
