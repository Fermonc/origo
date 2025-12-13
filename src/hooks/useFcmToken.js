
import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFcmToken(user) {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && user) {
            const messaging = getMessaging(app);

            const retrieveToken = async () => {
                try {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        // Try to get VAPID key from env, or fallback safely
                        const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
                        if (!vapidKey) {
                            console.warn("FCM VAPID key not found in environment variables. Push notifications will not work.");
                            return;
                        }

                        const token = await getToken(messaging, {
                            vapidKey: vapidKey
                        });

                        if (token) {
                            // Save token to user profile
                            await updateDoc(doc(db, 'users', user.uid), {
                                fcmToken: token
                            });
                        }
                    }
                } catch (error) {
                    console.error("FCM Token Error:", error);
                }
            };

            retrieveToken();

            // Handle foreground messages
            const unsubscribe = onMessage(messaging, (payload) => {
                console.log('Message received. ', payload);
                // Optionally show a toast here using the ToastContext if we had access to it
                // or let the OS notification handle it if configured
                new Notification(payload.notification.title, {
                    body: payload.notification.body,
                    icon: '/favicon.ico'
                });
            });

            return () => unsubscribe();
        }
    }, [user]);
}
