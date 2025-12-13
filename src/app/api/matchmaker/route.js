import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications';

export async function POST(request) {
    try {
        const propertyData = await request.json();

        // 1. Get all alerts.
        // We iterate through all users and their 'alerts' subcollection.
        // NOTE: For production scale, this should use a Collection Group Query or a dedicated 'alerts' root collection.
        // Given the prompt "maximum level possible", Collection Group is better, but requires Firestore Index.
        // Since I cannot create Indexes via this agent, I will stick to iterating users for safety (as "testing app").
        // OR: I can use collectionGroup('alerts') if no index is required for basic queries, but where clauses usually need it.
        // Let's stick to iterating users which is robust for small-medium apps.

        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);

        const matches = [];

        // Iterate through users in parallel
        await Promise.all(usersSnap.docs.map(async (userDoc) => {
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
            console.log(`Sending match notification to user ${match.userId} for property ${match.propertyTitle}`);
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

    // 2. Price Match
    let price = property.priceNumber;
    if (price === undefined || price === null || isNaN(price)) {
        try {
             price = Number(String(property.price || '0').replace(/[^0-9]/g, ''));
        } catch (e) {
             price = 0;
        }
    }
    if (criteria.minPrice > 0 && price < Number(criteria.minPrice)) return false;
    if (criteria.maxPrice > 0 && price > Number(criteria.maxPrice)) return false;

    // 3. Rooms/Baths Match
    if (criteria.bedrooms > 0 && (property.bedrooms || 0) < criteria.bedrooms) return false;
    if (criteria.bathrooms > 0 && (property.bathrooms || 0) < criteria.bathrooms) return false;

    // 4. Geo Match (Radius)
    // If criteria has mapCenter and radius, and property has coordinates
    if (criteria.mapCenter && criteria.mapCenter.lat && criteria.radius && property.coordinates && property.coordinates.lat) {
        const dist = getDistanceFromLatLonInKm(
            criteria.mapCenter.lat,
            criteria.mapCenter.lng,
            property.coordinates.lat,
            property.coordinates.lng
        );
        // radius is in km
        if (dist > Number(criteria.radius)) return false;
    }
    // Fallback: Text Location Match (if map not used in alert)
    else if (criteria.locationText) {
        const propLoc = (property.location || '').toLowerCase();
        const critLoc = criteria.locationText.toLowerCase();
        if (!propLoc.includes(critLoc)) return false;
    }

    return true;
}

// Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);
    var dLon = deg2rad(lon2-lon1);
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}
