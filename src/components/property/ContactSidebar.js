'use client';

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatPrice } from '@/utils/format';

export default function ContactSidebar({ property }) {
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setContactForm(prev => ({ ...prev, [name]: value }));
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await addDoc(collection(db, 'messages'), {
                ...contactForm,
                propertyId: property.id,
                propertyTitle: property.title,
                createdAt: new Date().toISOString(),
                read: false
            });
            setSent(true);
            setContactForm({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Hubo un error al enviar el mensaje. Intenta nuevamente.");
        } finally {
            setSending(false);
        }
    };

    return (
        <aside className="sidebar-column">
            <div className="sticky-card">
                <div className="card-price">
                    <span className="price-amount">{formatPrice(property.price)}</span>
                </div>

                <div className="contact-box">
                    {sent ? (
                        <div className="success-message">
                            <div className="success-icon">✅</div>
                            <h3>¡Mensaje enviado!</h3>
                            <p>Un asesor te contactará pronto.</p>
                            <button onClick={() => setSent(false)} className="btn-link">Nuevo mensaje</button>
                        </div>
                    ) : (
                        <form onSubmit={handleContactSubmit} className="contact-form">
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Nombre completo"
                                    value={contactForm.name}
                                    onChange={handleContactChange}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Correo electrónico"
                                    value={contactForm.email}
                                    onChange={handleContactChange}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Teléfono"
                                    value={contactForm.phone}
                                    onChange={handleContactChange}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="input-group">
                                <textarea
                                    name="message"
                                    placeholder="Hola, me interesa..."
                                    value={contactForm.message}
                                    onChange={handleContactChange}
                                    rows="3"
                                    className="form-input textarea"
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
                                {sending ? 'Enviando...' : 'Contactar Agente'}
                            </button>
                        </form>
                    )}

                    <div className="separator">
                        <span>o</span>
                    </div>

                    <a
                        href={`https://wa.me/573000000000?text=Hola, estoy interesado en la propiedad ${property.title} (ID: ${property.id})`}
                        target="_blank"
                        className="btn btn-whatsapp btn-block"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                            <path d="M17.472 14.382C17.112 14.202 15.344 13.332 15.013 13.212C14.682 13.092 14.442 13.032 14.202 13.392C13.962 13.752 13.272 14.562 13.062 14.802C12.852 15.042 12.642 15.072 12.282 14.892C11.922 14.712 10.762 14.332 9.382 13.102C8.272 12.112 7.522 10.892 7.312 10.532C7.102 10.172 7.292 9.982 7.472 9.802C7.632 9.642 7.832 9.382 8.012 9.172C8.192 8.962 8.252 8.812 8.372 8.572C8.492 8.332 8.432 8.122 8.342 7.942C8.252 7.762 7.532 5.992 7.232 5.272C6.942 4.572 6.642 4.672 6.432 4.672C6.232 4.662 6.002 4.662 5.762 4.662C5.522 4.662 5.132 4.752 4.802 5.112C4.472 5.472 3.542 6.342 3.542 8.112C3.542 9.882 4.832 11.592 5.012 11.832C5.192 12.072 7.562 15.732 11.192 17.302C12.052 17.672 12.732 17.892 13.262 18.062C14.322 18.402 15.282 18.352 16.042 18.232C16.892 18.102 18.662 17.152 19.032 16.112C19.402 15.072 19.402 14.192 19.282 13.992C19.172 13.792 18.932 13.662 18.572 13.482H17.472V14.382Z" />
                            <path d="M12 0C5.373 0 0 5.373 0 12C0 14.084 0.536 16.036 1.476 17.748L0.085 22.833L5.29 21.467C6.936 22.364 8.803 22.835 10.724 22.835H12C18.627 22.835 24 17.462 24 10.835C24 4.208 18.627 0 12 0ZM12 20.949C10.187 20.949 8.468 20.449 6.988 19.57L6.638 19.362L2.885 20.347L3.887 16.688L3.658 16.323C2.706 14.809 2.159 13.049 2.159 11.165C2.159 5.743 6.572 1.33 11.994 1.33C17.416 1.33 21.829 5.743 21.829 11.165C21.829 16.587 17.416 20.949 12 20.949Z" />
                        </svg>
                        WhatsApp
                    </a>
                </div>
            </div>

            <style jsx>{`
        .sidebar-column {
          display: none;
        }
        @media (min-width: 1024px) {
          .sidebar-column { display: block; }
        }
        .sticky-card {
          position: sticky;
          top: 100px;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          background: white;
        }
        .card-price {
          margin-bottom: 20px;
        }
        .price-amount {
          font-size: 1.8rem;
          font-weight: 700;
          color: #111;
        }
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .input-group {
          position: relative;
        }
        .form-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: #222;
        }
        .textarea {
          resize: vertical;
          min-height: 80px;
        }
        .btn {
          padding: 14px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          border: none;
          font-size: 1rem;
        }
        .btn-primary {
          background: linear-gradient(135deg, #222 0%, #000 100%);
          color: white;
        }
        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .btn-link {
          background: none;
          border: none;
          color: #111;
          text-decoration: underline;
          cursor: pointer;
          margin-top: 10px;
          font-weight: 600;
        }
        .success-message {
            text-align: center;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
        }
        .success-icon { font-size: 2rem; margin-bottom: 8px; }
        
        .separator {
            display: flex;
            align-items: center;
            text-align: center;
            margin: 16px 0;
            color: #bdc3c7;
        }
        .separator::before, .separator::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid #e0e0e0;
        }
        .separator span { padding: 0 10px; }

        .btn-whatsapp {
            background: #25D366;
            color: white;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .btn-whatsapp:hover { background: #128c7e; }
        .btn-block { width: 100%; }
      `}</style>
        </aside>
    );
}
