'use client';

import { useState, useEffect } from 'react';
import PropertyCard from '@/components/PropertyCard';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import SkeletonCard from '@/components/SkeletonCard';

import Header from '@/components/Header';

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
      <Header />

      <main className="main-content">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Propiedades Disponibles</h1>
            <p className="page-subtitle">Encuentra tu espacio ideal en nuestra colección exclusiva.</p>
          </div>

          {/* Filters */}
          <div className="filters-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar por ubicación o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-box">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
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
              <div className="empty-state">
                <p>No encontramos propiedades que coincidan con tu búsqueda.</p>
                <button onClick={() => { setSearchTerm(''); setFilterType('Todos'); }} className="btn-reset">
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #fff;
          padding-top: 80px; /* Space for fixed header */
        }



        /* Page Content */
        .main-content {
          padding: 40px 0 80px;
        }
        .page-header {
          text-align: center;
          margin-bottom: 32px;
          padding-top: 20px;
        }
        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: #111;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .page-subtitle {
          color: #666;
          font-size: 1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Filters */
        .filters-container {
          display: flex;
          gap: 16px;
          margin-bottom: 40px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }
        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }
        .search-input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          border-radius: 50px;
          border: 1px solid #e5e5e5;
          background: #f9f9f9;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
        }
        .search-input:focus {
          background: white;
          border-color: #111;
          box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
          outline: none;
        }
        .filter-select {
          padding: 12px 24px;
          border-radius: 50px;
          border: 1px solid #e5e5e5;
          background: #f9f9f9;
          font-size: 1rem;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-select:focus {
          background: white;
          border-color: #111;
          box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
        }

        /* Grid */
        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 32px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 0;
          color: #666;
        }
        .btn-reset {
          margin-top: 16px;
          background: none;
          border: none;
          color: #111;
          text-decoration: underline;
          cursor: pointer;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
