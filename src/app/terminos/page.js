'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
    return (
        <div className="page page-offset-top">
            <Header />
            <main className="main-content">
                <div className="container">
                    <h1 className="page-title">Términos y Condiciones</h1>
                    <p className="last-updated">Última actualización: Diciembre 2025</p>

                    <div className="legal-content">
                        <section>
                            <h2>1. Introducción</h2>
                            <p>Bienvenido a Origo. Al acceder a nuestro sitio web y utilizar nuestros servicios, usted acepta cumplir con los siguientes términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, por favor no utilice nuestros servicios.</p>
                        </section>

                        <section>
                            <h2>2. Uso del Sitio</h2>
                            <p>Este sitio web está destinado a personas interesadas en comprar, vender o arrendar propiedades en el Oriente Antioqueño. Usted se compromete a utilizar el sitio solo para fines legales y de una manera que no infrinja los derechos de, restrinja o inhiba el uso y disfrute del sitio por parte de cualquier otra persona.</p>
                        </section>

                        <section>
                            <h2>3. Propiedad Intelectual</h2>
                            <p>Todo el contenido incluido en este sitio, como texto, gráficos, logotipos, imágenes y software, es propiedad de Origo o de sus proveedores de contenido y está protegido por las leyes de derechos de autor internacionales y de Colombia.</p>
                        </section>

                        <section>
                            <h2>4. Limitación de Responsabilidad</h2>
                            <p>Origo no se hace responsable de daños directos, indirectos, incidentales, consecuentes o punitivos que surjan del uso o la imposibilidad de uso de este sitio o de cualquier error u omisión en el contenido.</p>
                        </section>

                        <section>
                            <h2>5. Modificaciones</h2>
                            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />

            <style jsx>{`
        .page {
          min-height: 100vh;
          background: #fff;
          display: flex;
          flex-direction: column;
        }
        .main-content {
          padding: 60px 0;
          flex: 1;
        }
        .page-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #111;
          margin-bottom: 0.5rem;
        }
        .last-updated {
          color: #666;
          margin-bottom: 3rem;
          font-size: 0.9rem;
        }
        .legal-content section {
          margin-bottom: 2.5rem;
        }
        h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111;
          margin-bottom: 1rem;
        }
        p {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #444;
        }
      `}</style>
        </div>
    );
}
