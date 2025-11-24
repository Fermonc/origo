import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

/**
 * Toggles a property in the user's favorites list
 * @param {string} userId 
 * @param {string} propertyId 
 * @param {boolean} isFavorite - Current state (if true, we remove it)
 */
export const toggleFavorite = async (userId, propertyId, isFavorite) => {
    if (!userId || !propertyId) return;

    const userRef = doc(db, 'users', userId);

    if (isFavorite) {
        await updateDoc(userRef, {
            favorites: arrayRemove(propertyId)
        });
    } else {
        await updateDoc(userRef, {
            favorites: arrayUnion(propertyId)
        });
    }
};

/**
 * Checks if a property is in the user's favorites
 * @param {string} userId 
 * @param {string} propertyId 
 * @returns {Promise<boolean>}
 */
export const checkIsFavorite = async (userId, propertyId) => {
    if (!userId || !propertyId) return false;

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        return data.favorites?.includes(propertyId) || false;
    }
    return false;
};

/**
 * Gets all favorite property IDs for a user
 * @param {string} userId 
 * @returns {Promise<string[]>}
 */
export const getUserFavorites = async (userId) => {
    if (!userId) return [];

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data().favorites || [];
    }
    return [];
};
