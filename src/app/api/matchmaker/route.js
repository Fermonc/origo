import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const propertyData = await request.json();

        // 1. Get all users (In a real app, we would query users with alerts, or use a dedicated 'alerts' collection group)
        // For this scale, fetching users is acceptable, but ideally we should have a separate 'alerts' collection.
        // However, our current design stores alerts inside 'users/{uid}/alerts'.
        // So we fetch all users and filter in memory.

        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);

        const notifications = [];

        usersSnap.forEach(userDoc => {
            const userData = userDoc.data();
            const userAlerts = userData.alerts || [];

            userAlerts.forEach(alert => {
                if (isMatch(propertyData, alert.criteria)) {
                    notifications.push({
                        userId: userDoc.id,
                        userEmail: userData.email,
                        propertyId: propertyData.id || 'unknown', // ID might not be passed if created just now, but we'll try
                        propertyTitle: propertyData.title,
                        alertId: alert.id
                    });
                }
            });
        });

        // 2. "Send" Notifications (Log & Store)
        const notificationPromises = notifications.map(async (notif) => {
            console.log(`[MATCHMAKER] Sending notification to ${notif.userEmail} for property "${notif.propertyTitle}"`);

            // Store in Firestore 'notifications' collection
            await addDoc(collection(db, 'notifications'), {
                userId: notif.userId,
                propertyId: notif.propertyId,
                message: `Nueva propiedad coincide con tu alerta: ${notif.propertyTitle}`,
                read: false,
                createdAt: new Date().toISOString()
            });
        });

        await Promise.all(notificationPromises);

        return NextResponse.json({
            success: true,
            matchesFound: notifications.length,
            notifications: notifications
        });

    } catch (error) {
        console.error("Matchmaker Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

function isMatch(property, criteria) {
    // 1. Type Match
    if (criteria.type && criteria.type !== property.type) {
        return false;
    }

    // 2. Zone Match (Simple string includes or exact match)
    // Assuming property.location contains the zone or we add a 'zone' field to property.
    // For now, let's assume property.location string contains the zone name.
    if (criteria.zone && !property.location?.toLowerCase().includes(criteria.zone.toLowerCase())) {
        return false;
    }

    // 3. Price Match
    let price = property.priceNumber;
    if (price === undefined || price === null || isNaN(price)) {
        // Fallback to parsing string if priceNumber not present
        price = Number(String(property.price).replace(/[^0-9]/g, ''));
    }

    if (criteria.minPrice && price < criteria.minPrice) return false;
    if (criteria.maxPrice && criteria.maxPrice > 0 && price > criteria.maxPrice) return false;

    return true;
}
