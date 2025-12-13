import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';

/**
 * Creates a new alert for the user in a subcollection
 * @param {string} userId 
 * @param {Object} criteria - { type, minPrice, maxPrice, zone, bedrooms, bathrooms, location, coordinates, radius, etc. }
 * @param {Object} preferences - { email: boolean, push: boolean }
 */
export const createAlert = async (userId, criteria, preferences = { email: true, push: false }) => {
    if (!userId) return;

    const alertsRef = collection(db, 'users', userId, 'alerts');

    const newAlert = {
        createdAt: new Date().toISOString(),
        criteria: criteria,
        preferences: preferences
    };

    const docRef = await addDoc(alertsRef, newAlert);
    return { id: docRef.id, ...newAlert };
};

/**
 * Deletes an alert
 * @param {string} userId 
 * @param {Object} alertObject - Must contain the id
 */
export const deleteAlert = async (userId, alertObject) => {
    if (!userId || !alertObject.id) return;

    const alertRef = doc(db, 'users', userId, 'alerts', alertObject.id);
    await deleteDoc(alertRef);
};

/**
 * Gets all alerts for a user from the subcollection
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const getUserAlerts = async (userId) => {
    if (!userId) return [];

    const alertsRef = collection(db, 'users', userId, 'alerts');
    const q = query(alertsRef, orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};
