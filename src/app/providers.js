'use client';

import { AuthContextProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { useFcmToken } from '@/hooks/useFcmToken';

function FcmHandler() {
    const { user } = useAuth();
    useFcmToken(user);
    return null;
}

export function Providers({ children }) {
    return (
        <AuthContextProvider>
            <ToastProvider>
                <FcmHandler />
                {children}
            </ToastProvider>
        </AuthContextProvider>
    );
}
