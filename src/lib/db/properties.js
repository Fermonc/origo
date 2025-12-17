import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where, startAfter } from 'firebase/firestore';

// Helper to serializable data (convert timestamps to strings for Next.js props)
const serializeData = (doc) => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toString() : null,
        updatedAt: data.updatedAt ? data.updatedAt.toString() : null,
    };
};

export const getFeaturedProperties = async (limitCount = 50) => {
    try {
        // Estrategia de ahorro aplicada: Limitación de lecturas (Pagination/Limits)
        // Se impone un límite por defecto para evitar traer toda la colección.
        const q = query(
            collection(db, 'properties'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(serializeData);
    } catch (error) {
        console.error("Error getting featured properties:", error);
        return [];
    }
};

export const getPropertiesByType = async (type, limitCount = 20) => {
    try {
        // Estrategia de ahorro aplicada: Filtrado en servidor + Limitación
        // Filtramos por tipo en el servidor y limitamos resultados para minimizar transferencia.
        const q = query(
            collection(db, 'properties'),
            where('type', '==', type),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(serializeData);
    } catch (error) {
        console.error(`Error getting properties of type ${type}:`, error);
        return [];
    }
};
