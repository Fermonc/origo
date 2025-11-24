'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toggleFavorite, checkIsFavorite } from '@/lib/db/favorites';

export default function PropertyCard({ property }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  useEffect(() => {
    if (user && property?.id) {
      checkIsFavorite(user.uid, property.id).then(setIsFavorite);
    }
  }, [user, property]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Inicia sesión para guardar favoritos');
      return;
    }

    setLoadingFav(true);
    try {
      await toggleFavorite(user.uid, property.id, isFavorite);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <Link href={`/propiedades/${property.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div className="property-card">
        <div className="image-container">
          <Image
            src={property.images?.[0] || property.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'}
            alt={property.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <span className="badge">{property.type}</span>
          <button
            className={`btn-favorite ${isFavorite ? 'active' : ''}`}
            onClick={handleToggleFavorite}
            disabled={loadingFav}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isFavorite ? "#ef4444" : "none"}
              stroke={isFavorite ? "#ef4444" : "currentColor"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        <div className="content">
          <h3>{property.title}</h3>
          <p className="location">📍 {property.location}</p>
          <p className="price">
            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(property.price)}
          </p>
          <div className="features">
            <span>{property.area}</span>
            {property.beds && <span> • {property.beds} Hab</span>}
          </div>
          <span className="btn-text">Ver Detalles →</span>
        </div>

        <style jsx>{`
          .property-card {
            background: #fff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.03);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid rgba(0,0,0,0.05);
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
          }
          .property-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.08);
          }
          .image-container {
            height: 240px;
            position: relative;
            background-color: #f0f0f0;
          }
          .badge {
            position: absolute;
            top: 12px;
            left: 12px;
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(4px);
            padding: 6px 12px;
            border-radius: 30px;
            font-size: 0.75rem;
            font-weight: 700;
            color: #111;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            z-index: 1;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .btn-favorite {
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(255,255,255,0.9);
            backdrop-filter: blur(4px);
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 2;
            transition: all 0.2s;
            color: #666;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .btn-favorite:hover {
            transform: scale(1.1);
            background: white;
          }
          .btn-favorite.active {
            color: #ef4444;
            background: white;
          }
          .content {
            padding: 20px;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
          }
          h3 {
            margin-bottom: 8px;
            font-size: 1.1rem;
            font-weight: 700;
            color: #111;
            line-height: 1.4;
          }
          .location {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .price {
            font-size: 1.25rem;
            font-weight: 800;
            color: #111;
            margin-bottom: 12px;
          }
          .features {
            display: flex;
            gap: 12px;
            color: #666;
            font-size: 0.85rem;
            margin-bottom: 20px;
            padding-top: 12px;
            border-top: 1px solid #f0f0f0;
          }
          .btn-text {
            background: #111;
            border: none;
            color: white;
            font-weight: 600;
            cursor: pointer;
            padding: 10px 0;
            font-size: 0.9rem;
            margin-top: auto;
            border-radius: 8px;
            text-align: center;
            width: 100%;
            transition: background 0.2s;
          }
          .btn-text:hover {
            background: #333;
          }
        `}</style>
      </div>
    </Link>
  );
}
