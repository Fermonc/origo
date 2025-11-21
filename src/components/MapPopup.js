'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function MapPopup({ property }) {
    return (
        <div className="map-popup-card">
            <div className="popup-image">
                <Image
                    src={property.images?.[0] || property.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'}
                    alt={property.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="200px"
                />
                <span className="popup-badge">{property.type}</span>
            </div>
            <div className="popup-content">
                <h4 className="popup-title">{property.title}</h4>
                <p className="popup-price">{property.price}</p>
                <div className="popup-features">
                    <span>{property.area}</span>
                    {property.beds && <span> • {property.beds} Hab</span>}
                </div>
                <Link href={`/propiedades/${property.id}`} className="popup-btn">
                    Ver Detalles
                </Link>
            </div>

            <style jsx>{`
        .map-popup-card {
          width: 220px;
          overflow: hidden;
          font-family: var(--font-sans);
        }
        .popup-image {
          position: relative;
          height: 120px;
          width: 100%;
          border-radius: 8px 8px 0 0;
          overflow: hidden;
        }
        .popup-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(255,255,255,0.95);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--color-primary);
          text-transform: uppercase;
          z-index: 1;
        }
        .popup-content {
          padding: 8px 4px;
        }
        .popup-title {
          margin: 0 0 4px 0;
          font-size: 0.95rem;
          color: var(--color-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .popup-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-secondary);
          margin: 0 0 4px 0;
        }
        .popup-features {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-bottom: 8px;
        }
        .popup-btn {
          display: block;
          width: 100%;
          text-align: center;
          background: var(--color-primary);
          color: white;
          padding: 6px 0;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s;
        }
        .popup-btn:hover {
          background: var(--color-secondary);
        }
      `}</style>
        </div>
    );
}
