"use server";

import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { headers } from "next/headers";

/**
 * Helper to get current User from Session/Token
 * This assumes you are passing the ID token in headers or cookies.
 * For this simplified version, we'll verify a token passed as argument or mocked context.
 * Ideally, use a robust session management (next-auth or verifyIdToken vs cookie).
 */
async function getCurrentUserRole(idToken) {
    if (!idToken) return "public";
    try {
        // In a real Server Action flow without passing token explicitly, 
        // you'd read a session cookie here.
        // For now, we will assume the caller passes the token or we handle "public" if missing.
        const decoded = await adminAuth.verifyIdToken(idToken);
        return decoded.role || "user";
    } catch (e) {
        return "public";
    }
}

/**
 * Creates a new property listing.
 * Stores sensitive contact info in protected fields.
 */
export async function createProperty(data, idToken) {
    try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        const uid = decoded.uid;
        const role = decoded.role || "user";

        // Logic based on Role
        // If USER: Store real data, but ensure it's marked as private.
        // If ADMIN: Can choose to make contact public.

        const propertyData = {
            ...data,
            ownerId: uid,
            ownerRole: role,
            createdAt: new Date().toISOString(),
            // Ensure strict schema for privacy
            // These fields specifically store the sensitive data
            realAddress: data.address,
            realPhone: data.phone,

            // Public-facing fields (Calculated)
            publicAddress: role === "admin" ? data.address : (data.neighborhood || "Ubicación aproximada"),
            publicPhone: role === "admin" ? data.phone : "Contactar a Plataforma",

            // Helper for UI
            isPrivateUserListing: role === "user"
        };

        const res = await adminDb.collection("properties").add(propertyData);
        return { success: true, id: res.id };
    } catch (error) {
        console.error("Error creating property:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches properties with Privacy Masking applied.
 */
export async function getProperties(idToken = null) {
    try {
        let viewerRole = "public";
        if (idToken) {
            try {
                const decoded = await adminAuth.verifyIdToken(idToken);
                viewerRole = decoded.role || "user";
            } catch (e) { /* ignore invalid token */ }
        }

        const snapshot = await adminDb.collection("properties").get();

        // MAP and MASK data
        const properties = snapshot.docs.map(doc => {
            const data = doc.data();
            const sensitive = (viewerRole === "admin"); // Only Admin sees real data

            return {
                id: doc.id,
                title: data.title,
                description: data.description,
                price: data.price,

                // Conditional Return
                address: sensitive ? data.realAddress : data.publicAddress,
                phone: sensitive ? data.realPhone : data.publicPhone,

                // Helpful Metadata
                isMasked: !sensitive
            };
        });

        return { success: true, data: properties };

    } catch (error) {
        console.error("Error fetching properties:", error);
        return { success: false, error: error.message };
    }
}
