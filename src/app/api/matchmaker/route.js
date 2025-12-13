import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications';

export async function POST(request) {
    try {
        const propertyData = await request.json();

        // 1. Get all alerts. The current structure seems to be that we need to scan users.
        // Optimally, 'alerts' should be a root collection or collection group.
        // Assuming 'users' -> 'alerts' subcollection is not easily queryable without collectionGroup index.
        // Let's assume we iterate users for now (prototype scale).

        // Wait, looking at `src/app/alertas/page.js`, it uses `getUserAlerts` from `lib/db/alerts`.
        // Let's see if we can query all alerts.
        // If not, we fall back to scanning users.

        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);

        const matches = [];

        // Iterate through users in parallel
        await Promise.all(usersSnap.docs.map(async (userDoc) => {
            // Get alerts subcollection for this user
            const alertsRef = collection(db, 'users', userDoc.id, 'alerts');
            const alertsSnap = await getDocs(alertsRef);

            alertsSnap.forEach(alertDoc => {
                const alertData = alertDoc.data();
                if (isMatch(propertyData, alertData.criteria)) {
                    matches.push({
                        userId: userDoc.id,
                        alertId: alertDoc.id,
                        propertyId: propertyData.id,
                        propertyTitle: propertyData.title
                    });
                }
            });
        }));

        // 2. Send Notifications
        const notificationPromises = matches.map(async (match) => {
            await sendNotification(
                match.userId,
                '¡Nueva Propiedad Encontrada!',
                `Hemos encontrado un inmueble que coincide con tu búsqueda: ${match.propertyTitle}`,
                'match',
                `/propiedades/${match.propertyId}`
            );
        });

        await Promise.all(notificationPromises);

        return NextResponse.json({
            success: true,
            matchesFound: matches.length
        });

    } catch (error) {
        console.error("Matchmaker Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

function isMatch(property, criteria) {
    if (!criteria) return false;

    // 1. Type Match
    if (criteria.type && criteria.type !== property.type) {
        return false;
    }

    // 2. Location/Zone Match
    // Improve logic: Check if property city/location contains the criteria city
    if (criteria.city) {
        const propLoc = (property.location || '').toLowerCase();
        const critLoc = criteria.city.toLowerCase();
        if (!propLoc.includes(critLoc)) {
            // Check if coordinates are close? (Advanced)
            // For now, text match is safer if we just added geocoding to the form
             return false;
        }
    }

    // 3. Price Match
    let price = property.priceNumber;
    if (price === undefined || price === null || isNaN(price)) {
        // Fallback if priceNumber is missing (legacy properties or error)
        try {
             price = Number(String(property.price || '0').replace(/[^0-9]/g, ''));
        } catch (e) {
             price = 0;
        }
    }

    if (criteria.minPrice && price < Number(criteria.minPrice)) return false;
    if (criteria.maxPrice && Number(criteria.maxPrice) > 0 && price > Number(criteria.maxPrice)) return false;

    return true;
}
