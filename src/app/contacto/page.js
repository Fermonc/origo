import Link from 'next/link';

export default function ContactPage() {
    return (
        <div className="page">
            <header style={{ padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--color-border)', background: 'white' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Origo</Link>
                    <nav>
                        <Link href="/propiedades" style={{ marginRight: 'var(--space-sm)' }}>Propiedades</Link>
                        <Link href="/contacto" className="btn btn-primary">Contacto</Link>
                    </nav>
                </div>
            </header>

            <main style={{ padding: 'var(--space-xl) 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>

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
                        <div style={{ background: 'white', padding: 'var(--space-lg)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--color-border)' }}>
                            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>Contáctanos</h2>
                            <form>
                                <div style={{ marginBottom: 'var(--space-sm)' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nombre</label>
                                    <input type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }} placeholder="Tu nombre" />
                                </div>
                                <div style={{ marginBottom: 'var(--space-sm)' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email</label>
                                    <input type="email" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }} placeholder="tucorreo@ejemplo.com" />
                                </div>
                                <div style={{ marginBottom: 'var(--space-sm)' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Mensaje</label>
                                    <textarea rows="4" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }} placeholder="¿En qué podemos ayudarte?"></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Enviar Mensaje</button>
                            </form>

                            <div style={{ marginTop: 'var(--space-md)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <p>O escríbenos directamente:</p>
                                <p style={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>+57 300 000 0000</p>
                                <p>info@origo.com</p>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
