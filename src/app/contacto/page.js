'use client';

import { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            await addDoc(collection(db, 'messages'), {
                ...formData,
                createdAt: new Date(),
                read: false
            });
            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error("Error sending message:", error);
            setStatus('error');
        }
    };

    return (
        <div className="page">
            <header className="desktop-only" style={{ padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--color-border)', background: 'white' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Origo</Link>
                    <nav>
                        <Link href="/propiedades" style={{ marginRight: 'var(--space-sm)', fontWeight: 'bold', color: 'var(--color-secondary)' }}>Propiedades</Link>
                        <Link href="/contacto" className="btn btn-primary">Contacto</Link>
                    </nav>
                </div>
            </header>

            <main style={{ padding: 'var(--space-xl) 0' }}>
                <div className="container">
                    <div className="contact-grid">

                        {/* About Us */}
                        <div>
                            <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>Sobre Origo</h1>
                            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
                                Somos una inmobiliaria boutique especializada en propiedades campestres, lotes y locales comerciales exclusivos en el Oriente Antioqueño.
                            </p>
                            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
                                Nuestra misión es conectar a las personas con espacios que inspiren, ya sea para vivir en armonía con la naturaleza o para emprender nuevos negocios.
                            </p>

                            <div style={{ marginTop: 'var(--space-lg)' }}>
                                <h3 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-sm)' }}>¿Por qué elegirnos?</h3>
                                <ul style={{ listStyle: 'none', color: 'var(--color-text-muted)' }}>
                                    <li style={{ marginBottom: '0.5rem' }}>✅ Curaduría exclusiva de propiedades</li>
                                    <li style={{ marginBottom: '0.5rem' }}>✅ Asesoría legal y financiera</li>
                                    <li style={{ marginBottom: '0.5rem' }}>✅ Acompañamiento personalizado</li>
                                </ul>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="form-card">
                            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>Contáctanos</h2>

                            {status === 'success' ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                                    <h3 style={{ color: 'var(--color-primary)' }}>¡Mensaje Enviado!</h3>
                                    <p style={{ color: 'var(--color-text-muted)' }}>Gracias por escribirnos. Te contactaremos muy pronto.</p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="btn-text"
                                        style={{ marginTop: '1rem', textDecoration: 'underline' }}
                                    >
                                        Enviar otro mensaje
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div style={{ marginBottom: 'var(--space-sm)' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nombre</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                                            placeholder="Tu nombre"
                                        />
                                    </div>
                                    <div style={{ marginBottom: 'var(--space-sm)' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                                            placeholder="tucorreo@ejemplo.com"
                                        />
                                    </div>
                                    <div style={{ marginBottom: 'var(--space-sm)' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Mensaje</label>
                                        <textarea
                                            rows="4"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                                            placeholder="¿En qué podemos ayudarte?"
                                        ></textarea>
                                    </div>

                                    {status === 'error' && (
                                        <p style={{ color: 'red', marginBottom: '1rem' }}>Hubo un error al enviar el mensaje. Intenta de nuevo.</p>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        style={{ width: '100%' }}
                                        disabled={status === 'loading'}
                                    >
                                        {status === 'loading' ? 'Enviando...' : 'Enviar Mensaje'}
                                    </button>
                                </form>
                            )}

                            <div style={{ marginTop: 'var(--space-md)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <p>O escríbenos directamente:</p>
                                <p style={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>+57 300 000 0000</p>
                                <p>info@origo.com</p>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <style jsx>{`
                .contact-grid {
                    display: grid; 
                    grid-template-columns: 1fr; 
                    gap: var(--space-xl);
                }
                .form-card {
                    background: white; 
                    padding: var(--space-lg); 
                    border-radius: 12px; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05); 
                    border: 1px solid var(--color-border);
                }
                @media (min-width: 768px) {
                    .contact-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
