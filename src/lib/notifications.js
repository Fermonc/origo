
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Creates a notification for a user
 * @param {string} userId - The UID of the user to notify
 * @param {string} title - Title of the notification
 * @param {string} body - Body text
 * @param {string} type - Type (e.g., 'match', 'system')
 * @param {string} link - URL to redirect to (optional)
 */
export async function sendNotification(userId, title, body, type = 'system', link = null) {
  try {
    await addDoc(collection(db, 'users', userId, 'notifications'), {
      title,
      body,
      type,
      link,
      read: false,
      createdAt: serverTimestamp()
    });

    // Future: Call Firebase Cloud Messaging here for push notification
    // await sendPushNotification(userId, title, body);

    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
}
