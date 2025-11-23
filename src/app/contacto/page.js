'use client';

{/* About Us */ }
<div className="about-section">
    <h1 className="section-title">Sobre Nosotros</h1>
    <p className="about-text">
        En Origo, nos especializamos en conectar personas con espacios únicos en el Oriente Antioqueño.
        Entendemos que una propiedad no es solo tierra o ladrillos, es el origen de nuevos proyectos y sueños.
    </p>
    <p className="about-text">
        Con más de 10 años de experiencia en el sector, ofrecemos un portafolio curado de locales comerciales,
        lotes campestres y fincas de recreo.
    </p>

    <div className="contact-info-block">
        <h3>Información de Contacto</h3>
        <p>📍 Rionegro, Antioquia</p>
        <p>📞 +57 300 123 4567</p>
        <p>✉️ info@origo.com</p>
    </div>
</div>

{/* Contact Form */ }
<div className="form-card">
    <h2 className="form-title">Contáctanos</h2>

    {status === 'success' ? (
        <div className="success-state">
            <div className="success-icon">✅</div>
            <h3>¡Mensaje Enviado!</h3>
            <p>Gracias por escribirnos. Te contactaremos muy pronto.</p>
            <button
                onClick={() => setStatus('idle')}
                className="btn-reset"
            >
                Enviar otro mensaje
            </button>
        </div>
    ) : (
        <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
                <label>Nombre</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Tu nombre"
                    className="form-input"
                />
            </div>
            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="tucorreo@ejemplo.com"
                    className="form-input"
                />
            </div>
            <div className="form-group">
                <label>Mensaje</label>
                <textarea
                    rows="4"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="¿En qué podemos ayudarte?"
                    className="form-input"
                ></textarea>
            </div>

            {status === 'error' && (
                <p className="error-msg">Hubo un error al enviar el mensaje. Intenta de nuevo.</p>
            )}

            <button
                type="submit"
                className="btn-submit"
                disabled={status === 'loading'}
            >
                {status === 'loading' ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
        </form>
    )}
</div>
                    </div >
                </div >
            </main >

    <style jsx>{`
                .page {
                    min-height: 100vh;
                    background: #fff;
                    padding-top: 80px;
                }

                /* Header (Shared Style) */
                .header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    z-index: 100;
                    padding: 20px 0;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .logo {
                    font-size: 1.8rem;
                    font-weight: 800;
                    letter-spacing: -1px;
                    color: #111;
                    text-decoration: none;
                }
                .nav {
                    display: flex;
                    gap: 32px;
                    align-items: center;
                }
                .nav-link {
                    color: #666;
                    font-weight: 500;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .nav-link:hover, .nav-link.active {
                    color: #111;
                }
                .btn-login {
                    padding: 8px 20px;
                    background: #111;
                    color: white;
                    border-radius: 20px;
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: transform 0.2s;
                }
                .btn-login:hover {
                    transform: scale(1.05);
                }
                .desktop-only { display: none; }
                @media (min-width: 768px) { .desktop-only { display: flex; } }

                /* Content */
                .main-content {
                    padding: 60px 0;
                }
                .contact-grid {
                    display: grid; 
                    grid-template-columns: 1fr; 
                    gap: 60px;
                    align-items: start;
                }
                
                .section-title {
                    font-size: 3rem;
                    font-weight: 800;
                    color: #111;
                    margin-bottom: 24px;
                    letter-spacing: -1px;
                }
                .about-text {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: #555;
                    margin-bottom: 24px;
                }
                .contact-info-block {
                    margin-top: 40px;
                    padding: 24px;
                    background: #f9f9f9;
                    border-radius: 16px;
                }
                .contact-info-block h3 {
                    margin-bottom: 16px;
                    font-size: 1.2rem;
                }
                .contact-info-block p {
                    margin-bottom: 8px;
                    color: #444;
                }

                /* Form Card */
                .form-card {
                    background: white; 
                    padding: 40px; 
                    border-radius: 24px; 
                    box-shadow: 0 10px 40px rgba(0,0,0,0.08); 
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .form-title {
                    font-size: 1.8rem;
                    font-weight: 700;
                    margin-bottom: 32px;
                    color: #111;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #333;
                    font-size: 0.9rem;
                }
                .form-input {
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 12px;
                    border: 1px solid #e5e5e5;
                    background: #fcfcfc;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.2s;
                }
                .form-input:focus {
                    border-color: #111;
                    background: #fff;
                }
                .btn-submit {
                    width: 100%;
                    padding: 14px;
                    background: #111;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-submit:hover {
                    background: #333;
                }
                .btn-submit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .success-state {
                    text-align: center;
                    padding: 40px 0;
                }
                .success-icon {
                    font-size: 3rem;
                    margin-bottom: 16px;
                }
                .btn-reset {
                    margin-top: 16px;
                    background: none;
                    border: none;
                    text-decoration: underline;
                    cursor: pointer;
                    color: #666;
                }
                .error-msg {
                    color: #ef4444;
                    margin-bottom: 16px;
                    font-size: 0.9rem;
                }

                @media (min-width: 768px) {
                    .contact-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }
            `}</style>
        </div >
    );
}
