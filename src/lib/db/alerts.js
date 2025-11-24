import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a new alert for the user
 * @param {string} userId 
 * @param {Object} criteria - { type, minPrice, maxPrice, zone, etc. }
 */
export const createAlert = async (userId, criteria) => {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const newAlert = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        criteria: criteria
    };

    await updateDoc(userRef, {
        alerts: arrayUnion(newAlert)
    });

    return newAlert;
};

/**
 * Deletes an alert
 * @param {string} userId 
 * @param {Object} alertObject - The exact alert object to remove
 */
export const deleteAlert = async (userId, alertObject) => {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        alerts: arrayRemove(alertObject)
    });
};

/**
 * Gets all alerts for a user
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const getUserAlerts = async (userId) => {
    if (!userId) return [];

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data().alerts || [];
    }
    return [];
};
