'use client';

import { useState, useEffect } from 'react';
import PropertyCard from '@/components/PropertyCard';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import SkeletonCard from '@/components/SkeletonCard';

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const props = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProperties(props);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(prop => {
    const matchesType = filterType === 'Todos' || prop.type === filterType;
    const matchesSearch = prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

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

      <main className="container" style={{ padding: 'var(--space-lg) 0' }}>
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>Propiedades Disponibles</h1>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Buscar ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', minWidth: '200px' }}
            />

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
            >
              <option value="Todos">Todos los tipos</option>
              <option value="Finca">Finca</option>
              <option value="Lote">Lote</option>
              <option value="Local">Local</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="properties-grid">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredProperties.length > 0 ? (
            filteredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))
          ) : (
            <p>No se encontraron propiedades.</p>
          )}
        </div>
      </main>

      <style jsx>{`
        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-md);
        }
      `}</style>
    </div>
  );
}
