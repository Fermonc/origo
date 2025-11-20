'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function PropertyCard({ property }) {
  return (
    <Link href={`/propiedades/${property.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div className="property-card">
        <div className="image-container">
          <Image
            src={property.image}
            alt={property.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <span className="badge">{property.type}</span>
        </div>
        <div className="content">
          <h3>{property.title}</h3>
          <p className="location">📍 {property.location}</p>
          <p className="price">{property.price}</p>
          <div className="features">
            <span>{property.area}</span>
            {property.beds && <span> • {property.beds} Hab</span>}
          </div>
          <span className="btn-text">Ver Detalles →</span>
        </div>

        <style jsx>{`
          .property-card {
            background: var(--color-surface);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid var(--color-border);
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          .property-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.1);
          }
          .image-container {
            height: 250px;
            position: relative;
            background-color: #eee;
          }
          .badge {
            position: absolute;
            top: 12px;
            left: 12px;
            background: rgba(255,255,255,0.9);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--color-primary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            z-index: 1;
          }
          .content {
            padding: 1.5rem;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
          }
          h3 {
            margin-bottom: 0.5rem;
            font-size: 1.25rem;
            color: var(--color-primary);
          }
          .location {
            color: var(--color-text-muted);
            font-size: 0.9rem;
            margin-bottom: 1rem;
          }
          .price {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--color-secondary);
            margin-bottom: 0.5rem;
          }
          .features {
            display: flex;
            gap: 0.5rem;
            color: var(--color-text-muted);
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
          }
          .btn-text {
            background: none;
            border: none;
            color: var(--color-primary);
            font-weight: 600;
            cursor: pointer;
            padding: 0;
            font-size: 1rem;
            margin-top: auto;
          }
        `}</style>
      </div>
    </Link>
  );
}
