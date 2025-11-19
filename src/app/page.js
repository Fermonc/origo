import PropertyCard from '@/components/PropertyCard';
import { properties } from '@/data/properties';

export default function Home() {
  const featuredProperties = properties.slice(0, 3);

  return (
    <div className="page">
      <header style={{ padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Origo</h1>
          <nav>
            <a href="/propiedades" style={{ marginRight: 'var(--space-sm)' }}>Propiedades</a>
            <a href="/contacto" className="btn btn-primary">Contacto</a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section style={{
          padding: 'var(--space-xl) 0',
          textAlign: 'center',
          background: 'linear-gradient(to bottom, var(--color-bg), #fff)'
        }}>
          <div className="container">
            <h2 style={{ fontSize: '3.5rem', marginBottom: 'var(--space-sm)', color: 'var(--color-primary)', letterSpacing: '-1px' }}>
              Encuentra tu espacio ideal
            </h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)', maxWidth: '600px', margin: '0 auto var(--space-md)' }}>
              Locales, Lotes y Fincas exclusivas. Conectamos con la naturaleza y el comercio.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center' }}>
              <button className="btn btn-primary">Ver Inmuebles</button>
              <button className="btn" style={{ border: '1px solid var(--color-border)', background: 'white' }}>Saber más</button>
            </div>
          </div>
        </section>

        {/* Featured Properties */}
        <section style={{ padding: 'var(--space-lg) 0' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 'var(--space-md)' }}>
              <div>
                <h3 style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>Propiedades Destacadas</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>Oportunidades únicas seleccionadas para ti</p>
              </div>
              <a href="#" style={{ color: 'var(--color-secondary)', fontWeight: '600' }}>Ver todas →</a>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 'var(--space-md)'
            }}>
              {featuredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
