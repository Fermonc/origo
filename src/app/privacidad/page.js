'use client';



export default function PrivacyPage() {
  return (
    <div className="page page-offset-top">
      <main className="main-content">
        <div className="container">
          <h1 className="page-title">Política de Privacidad</h1>
          <p className="last-updated">Última actualización: Diciembre 2025</p>

          <div className="legal-content">
            <section>
              <h2>1. Recolección de Información</h2>
              <p>Recopilamos información que usted nos proporciona directamente cuando se registra, completa un formulario o se comunica con nosotros. Esto puede incluir su nombre, dirección de correo electrónico, número de teléfono y otra información de contacto.</p>
            </section>

            <section>
              <h2>2. Uso de la Información</h2>
              <p>Utilizamos la información recopilada para proporcionar, mantener y mejorar nuestros servicios, procesar transacciones, enviarle notificaciones técnicas y responder a sus comentarios y preguntas.</p>
            </section>

            <section>
              <h2>3. Compartir Información</h2>
              <p>No compartimos su información personal con terceros, excepto cuando es necesario para proporcionar nuestros servicios (por ejemplo, con proveedores de servicios de confianza) o cuando la ley lo requiere.</p>
            </section>

            <section>
              <h2>4. Seguridad de Datos</h2>
              <p>Tomamos medidas razonables para proteger su información personal contra pérdida, robo, uso indebido y acceso no autorizado, divulgación, alteración y destrucción.</p>
            </section>

            <section>
              <h2>5. Contacto</h2>
              <p>Si tiene alguna pregunta sobre esta política de privacidad, por favor contáctenos a través de nuestro formulario de contacto o enviando un correo a info@origo.com.</p>
            </section>
          </div>
        </div>
      </main>


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
