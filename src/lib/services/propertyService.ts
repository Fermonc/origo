import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { PropertyData } from "@/types/property";

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
}

/**
 * Creates a new property listing in Firestore after uploading necessary files.
 */
export async function createProperty(
    data: Partial<PropertyData>,
    images: File[],
    legalDocs: File[]
): Promise<string> {
    try {
        const userId = "current_user_id"; // TODO: Get actual auth user ID
        // 1. Upload Images
        const imageUrls = await Promise.all(
            images.map((file) => uploadFile(file, `properties/${userId}/images`))
        );

        // 2. Upload Legal Docs
        const legalDocUrls = await Promise.all(
            legalDocs.map((file) => uploadFile(file, `properties/${userId}/legal`))
        );

        // 3. Prepare Data
        const propertyData = {
            ...data,
            userId,
            images: imageUrls,
            legal: {
                ...data.legal,
                documentNames: legalDocs.map(f => f.name),
                // Simple mapping assuming order checks out or single doc mainly used
                // In a real app we might want to map specific files to specific roles
                traditionCertificateUrl: legalDocUrls[0] || "",
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        // 4. Save to Firestore
        const docRef = await addDoc(collection(db, "properties"), propertyData);
        return docRef.id;

    } catch (error) {
        console.error("Error creating property:", error);
        throw error;
    }
}
