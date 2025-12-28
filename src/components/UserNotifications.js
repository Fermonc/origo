'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function UserNotifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert timestamp if it exists, safely
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
        }));
        setNotifications(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error in UserNotifications listener:", error);
        setLoading(false);
        if (error.code === 'permission-denied') {
          setNotifications([]);
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id) => {
    try {
      const notifRef = doc(db, 'users', user.uid, 'notifications', id);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  if (loading) return <div className="loading">Cargando notificaciones...</div>;

  if (notifications.length === 0) {
    return (
      <div className="empty-state">
        <h3>No tienes notificaciones</h3>
        <p>Te avisaremos cuando encontremos inmuebles que coincidan con tus búsquedas.</p>
      </div>
    );
  }

  return (
    <div className="notifications-list">
      {notifications.map((note) => (
        <div
          key={note.id}
          className={`notification-item ${note.read ? 'read' : 'unread'}`}
          onClick={() => markAsRead(note.id)}
        >
          <div className="icon">
            {note.type === 'match' ? '🏠' : '🔔'}
          </div>
          <div className="content">
            <h4>{note.title}</h4>
            <p>{note.body}</p>
            <span className="time">{note.createdAt?.toLocaleDateString()}</span>
            {note.link && (
              <Link href={note.link} className="link-action">Ver Propiedad →</Link>
            )}
          </div>
          {!note.read && <div className="dot"></div>}
        </div>
      ))}

      <style jsx>{`
        .notifications-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .notification-item {
            display: flex;
            gap: 16px;
            padding: 16px;
            background: white;
            border-radius: 12px;
            border: 1px solid #eee;
            transition: all 0.2s;
            position: relative;
        }

        .notification-item.unread {
            background: #fff;
            border-color: #111;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .notification-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }

        .icon {
            font-size: 1.5rem;
            width: 40px;
            height: 40px;
            background: #f5f5f5;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .content { flex: 1; }

        h4 { margin: 0 0 4px 0; font-size: 1rem; color: #111; }
        p { margin: 0 0 8px 0; color: #555; font-size: 0.95rem; }
        .time { font-size: 0.8rem; color: #888; display: block; margin-bottom: 8px; }

        .link-action {
            display: inline-block;
            color: #111;
            font-weight: 600;
            font-size: 0.9rem;
            text-decoration: none;
            border-bottom: 1px solid #111;
        }

        .dot {
            width: 10px;
            height: 10px;
            background: #ef4444;
            border-radius: 50%;
            position: absolute;
            top: 16px;
            right: 16px;
        }

        .empty-state {
            text-align: center;
            padding: 40px;
            background: #f9f9f9;
            border-radius: 12px;
            color: #666;
        }
        .empty-state h3 { color: #111; margin-bottom: 8px; }
      `}</style>
    </div>
  );
}
