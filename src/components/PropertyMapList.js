'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function PropertyMapList({ properties, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="map-list-container">
      <div className="list-header">
        <h3>Inmuebles en esta zona ({properties.length})</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="list-content">
        {properties.length === 0 ? (
          <div className="no-results">
            <p>No hay propiedades visibles en esta área.</p>
            <small>Intenta mover el mapa o cambiar los filtros.</small>
          </div>
        ) : (
          properties.map(property => (
            <Link key={property.id} href={`/propiedades/${property.id}`} className="list-item">
              <div className="item-image">
                <Image
                  src={property.images?.[0] || property.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80'}
                  alt={property.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="100px"
                />
              </div>
              <div className="item-details">
                <h4>{property.title}</h4>
                <p className="price">{property.price}</p>
                <div className="features">
                  <span>{property.type}</span>
                  {property.area && <span> • {property.area}</span>}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <style jsx>{`
        .map-list-container {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 320px;
          max-height: calc(100vh - 140px);
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 25px rgba(0,0,0,0.15);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .list-header {
          padding: 16px;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
        }

        .list-header h3 {
          font-size: 1rem;
          margin: 0;
          color: var(--color-primary);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--color-text-muted);
          padding: 0 4px;
        }

        .list-content {
          overflow-y: auto;
          flex: 1;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .list-item {
          display: flex;
          gap: 12px;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s;
          text-decoration: none;
          border: 1px solid transparent;
        }

        .list-item:hover {
          background: var(--color-bg);
          border-color: var(--color-border);
        }

        .item-image {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .item-details h4 {
          font-size: 0.9rem;
          margin: 0 0 4px 0;
          color: var(--color-text-main);
          line-height: 1.2;
        }

        .price {
          font-weight: 700;
          color: var(--color-secondary);
          font-size: 0.95rem;
          margin: 0 0 4px 0;
        }

        .features {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .no-results {
          padding: 24px;
          text-align: center;
          color: var(--color-text-muted);
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .map-list-container {
            top: auto;
            bottom: 80px; /* Above bottom nav */
            right: 0;
            left: 0;
            width: 100%;
            border-radius: 20px 20px 0 0;
            max-height: 50vh;
            animation: slideUp 0.3s ease;
          }

          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          
          /* Ensure it doesn't block interactions when closed */
          :global(.map-list-container:not(.open)) {
            pointer-events: none;
            visibility: hidden;
          }
        }
      `}</style>
    </div>
  );
}
