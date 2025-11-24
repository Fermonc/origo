'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createOrUpdateUser } from '@/lib/db/users';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                // Ensure user exists in DB on every auth state change (or at least login)
                // We do it here to catch session restoration too
                try {
                    await createOrUpdateUser(user);
                } catch (error) {
                    console.error("Error updating user profile in DB:", error);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const googleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            return result.user;
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, googleLogin, logout }}>
            {loading ? <div>Cargando...</div> : children}
        </AuthContext.Provider>
    );
};
