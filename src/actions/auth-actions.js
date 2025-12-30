"use server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";

/**
 * Sets a custom role for a user.
 * Only callable by existing Admins (security check needed in real app)
 * or commonly used by internal scripts for initial setup.
 * 
 * @param {string} uid - The User ID
 * @param {string} role - 'admin' | 'user'
 */
export async function setUserRole(uid, role) {
    try {
        // 1. Set Custom Claim on Firebase Auth User
        await adminAuth.setCustomUserClaims(uid, { role });

        // 2. Update/Create User Document in Firestore for easy querying
        await adminDb.collection("users").doc(uid).set({
            role,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        return { success: true };
    } catch (error) {
        console.error("Error setting role:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Gets the current role of a user from their ID token (server-side verification)
 * @param {string} token - The user's ID token
 */
export async function verifyUserRole(token) {
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken.role || "user";
    } catch (error) {
        return null; // Invalid token
    }
}
