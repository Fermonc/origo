'use client';

import { AuthContextProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

export function Providers({ children }) {
    return (
        <AuthContextProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </AuthContextProvider>
    );
}
