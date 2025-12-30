import "server-only";
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Note: In production, use standard GOOGLE_APPLICATION_CREDENTIALS or
// specific environment variables for the Service Account.
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Handle private key newlines correctly
    privateKey: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : undefined,
};

let app;

if (!getApps().length) {
    if (process.env.FIREBASE_PRIVATE_KEY) {
        app = initializeApp({
            credential: cert(serviceAccount),
        });
    } else {
        // Fallback or setup for Google Cloud Run / automatic credentials
        app = initializeApp();
    }
} else {
    app = getApp();
}

const adminDb = getFirestore(app);
const adminAuth = getAuth(app);

export { adminDb, adminAuth };
