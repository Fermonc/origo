import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * Creates or updates a user document in Firestore
 * @param {Object} user - Firebase Auth user object
 * @param {Object} additionalData - Any extra data to save (e.g. role, phone)
 */
export const createOrUpdateUser = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        lastLogin: new Date().toISOString(),
        ...additionalData
    };

    if (!userSnap.exists()) {
        // Create new user
        await setDoc(userRef, {
            ...userData,
            createdAt: new Date().toISOString(),
            role: 'user', // Default role
            favorites: [], // Initialize favorites
            alerts: []     // Initialize alerts
        });
    } else {
        // Update existing user (merge)
        await updateDoc(userRef, {
            lastLogin: new Date().toISOString(),
            ...additionalData
        });
    }

    return userRef;
};

/**
 * Gets user profile data
 * @param {string} uid 
 * @returns {Promise<Object|null>}
 */
export const getUserProfile = async (uid) => {
    if (!uid) return null;
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data();
    }
    return null;
};
