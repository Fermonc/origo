'use client';

import { useState } from 'react';
import PropertyCard from '@/components/PropertyCard';
import { properties as initialProperties } from '@/data/properties';

export default function PropertiesPage() {
  const [filterType, setFilterType] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProperties = initialProperties.filter(prop => {
    const matchesType = filterType === 'Todos' || prop.type === filterType;
    const matchesSearch = prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="page">
      <header style={{ padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--color-border)', background: 'white' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Origo</a>
          <nav>
            <a href="/propiedades" style={{ marginRight: 'var(--space-sm)', fontWeight: 'bold', color: 'var(--color-secondary)' }}>Propiedades</a>
            <a href="/contacto" className="btn btn-primary">Contacto</a>
          </nav>
        </div>
      </header>

      <main style={{ padding: 'var(--space-lg) 0', background: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ marginBottom: 'var(--space-md)', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: 'var(--space-sm)' }}>Catálogo de Inmuebles</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Explora nuestra selección exclusiva de propiedades</p>
          </div>

          {/* Filters */}
          <div className="filters-container">
            <input
              type="text"
              placeholder="Buscar por ubicación o nombre..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="type-filters">
              {['Todos', 'Finca', 'Lote', 'Local'].map(type => (
                <button
                  key={type}
                  className={`filter-btn ${filterType === type ? 'active' : ''}`}
                  onClick={() => setFilterType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="properties-grid">
            {filteredProperties.length > 0 ? (
              filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 'var(--space-xl)' }}>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>No se encontraron propiedades con esos filtros.</p>
                <button
                  className="btn-text"
                  onClick={() => { setFilterType('Todos'); setSearchTerm(''); }}
                  style={{ marginTop: 'var(--space-sm)', textDecoration: 'underline' }}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .filters-container {
          background: white;
          padding: var(--space-md);
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          margin-bottom: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        
        @media (min-width: 768px) {
          .filters-container {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .search-input {
          padding: 0.75rem 1rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-size: 1rem;
          min-width: 300px;
          outline: none;
          transition: border-color 0.2s;
        }
        .search-input:focus {
          border-color: var(--color-secondary);
        }

        .type-filters {
          display: flex;
          gap: var(--space-xs);
          overflow-x: auto;
          padding-bottom: 4px; /* For scrollbar if needed */
        }

        .filter-btn {
          padding: 0.5rem 1.25rem;
          border: 1px solid var(--color-border);
          background: white;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 500;
          color: var(--color-text-muted);
          transition: all 0.2s;
          white-space: nowrap;
        }

        .filter-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .filter-btn.active {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-md);
        }
      `}</style>
    </div>
  );
}
