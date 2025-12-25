'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function MessagesPage() {
    const { user, loading: authLoading } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/admin/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const msgs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
                }));
                setMessages(msgs);
                setLoadingData(false);
            }, (error) => {
                console.error("Error fetching messages:", error);
                setLoadingData(false);
                addToast('Error al cargar mensajes', 'error');
            });
            return () => unsubscribe();
        }
    }, [user, addToast]);

    const handleToggleRead = async (msg) => {
        try {
            await updateDoc(doc(db, 'messages', msg.id), {
                read: !msg.read
            });
        } catch (error) {
            console.error("Error updating message:", error);
            addToast('Error al actualizar estado', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('¿Eliminar este mensaje permanentemente?')) {
            try {
                await deleteDoc(doc(db, 'messages', id));
                addToast('Mensaje eliminado', 'success');
            } catch (error) {
                console.error("Error deleting message:", error);
                addToast('Error al eliminar mensaje', 'error');
            }
        }
    };

    if (authLoading || !user) {
        return <div className="loading-screen"><div className="spinner"></div></div>;
    }

    return (
        <div className="admin-page">
            <main className="container main-content" style={{ paddingTop: '100px' }}>
                <div className="admin-breadcrumb">
                    <Link href="/admin/dashboard" className="back-link">← Volver al Panel</Link>
                    <h1>Mensajes y Leads</h1>
                </div>
                {loadingData ? (
                    <div className="loading-grid">Cargando mensajes...</div>
                ) : messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No hay mensajes nuevos</h3>
                    </div>
                ) : (
                    <div className="messages-list">
                        {messages.map(msg => (
                            <div key={msg.id} className={`message-card ${msg.read ? 'read' : 'unread'}`}>
                                <div className="message-header">
                                    <div className="sender-info">
                                        <h3 className="sender-name">{msg.name}</h3>
                                        <span className="sender-email">{msg.email}</span>
                                    </div>
                                    <div className="message-meta">
                                        <span className="msg-date">
                                            {msg.createdAt.toLocaleDateString()} {msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <div className="actions">
                                            <button
                                                onClick={() => handleToggleRead(msg)}
                                                className="btn-icon"
                                                title={msg.read ? "Marcar como no leído" : "Marcar como leído"}
                                            >
                                                {msg.read ? '📩' : '👀'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(msg.id)}
                                                className="btn-icon delete"
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="message-body">
                                    <p>{msg.message}</p>
                                </div>
                                {!msg.read && <div className="unread-dot"></div>}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <style jsx>{`
                .admin-page {
                    min-height: 100vh;
                    background-color: #f8fafc;
                }
                .admin-header {
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 1rem 0;
                    margin-bottom: 2rem;
                    position: sticky; top: 0; z-index: 100;
                }
                .header-container {
                    display: flex; align-items: center; justify-content: space-between;
                }
                h1 { margin: 0; font-size: 1.25rem; color: #0f172a; font-weight: 700; }
                .back-link {
                    color: #64748b; font-weight: 500; font-size: 0.9rem; text-decoration: none;
                    padding: 0.5rem 1rem; border-radius: 8px; transition: background 0.2s;
                }
                .back-link:hover { background: #f1f5f9; color: #0f172a; }
                .main-content { padding-bottom: 4rem; max-width: 800px; }

                .messages-list {
                    display: flex; flex-direction: column; gap: 16px;
                }
                .message-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    border: 1px solid #e2e8f0;
                    position: relative;
                    transition: all 0.2s;
                }
                .message-card.unread {
                    border-left: 4px solid #3b82f6;
                    background: #fff;
                }
                .unread-dot {
                    position: absolute; top: 20px; right: 20px;
                    width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;
                }
                
                .message-header {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    margin-bottom: 12px;
                }
                .sender-name {
                    font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;
                }
                .sender-email {
                    font-size: 0.9rem; color: #64748b;
                }
                .message-meta {
                    display: flex; flex-direction: column; align-items: flex-end; gap: 8px;
                }
                .msg-date {
                    font-size: 0.8rem; color: #94a3b8;
                }
                .actions {
                    display: flex; gap: 8px;
                }
                .btn-icon {
                    background: none; border: none; font-size: 1.1rem; cursor: pointer;
                    padding: 4px; border-radius: 4px; transition: background 0.2s;
                }
                .btn-icon:hover { background: #f1f5f9; }
                
                .message-body {
                    color: #334155; line-height: 1.5; font-size: 0.95rem;
                    white-space: pre-wrap;
                }

                .empty-state {
                    text-align: center; padding: 60px;
                    background: white; border-radius: 20px; border: 2px dashed #e2e8f0;
                }
                .empty-icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.5; }

                .loading-screen {
                    height: 100vh; display: flex; align-items: center; justify-content: center;
                }
                .spinner {
                    width: 40px; height: 40px; border: 3px solid #f3f3f3;
                    border-top: 3px solid #0f172a; border-radius: 50%; animation: spin 1s linear infinite;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
