'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export default function ImageGallery({ images, title }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [lightboxOpen]);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, nextImage, prevImage]);

  return (
    <div className="gallery-wrapper">
      {/* Mobile Carousel */}
      <div className="mobile-gallery">
        <div className="gallery-scroll">
          {images.map((img, index) => (
            <div key={index} className="gallery-item" onClick={() => openLightbox(index)}>
              <Image
                src={img}
                alt={`${title} - ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
        <div className="gallery-counter">
          1 / {images.length}
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="desktop-gallery container">
        <div className="gallery-grid">
          <div className="grid-main" onClick={() => openLightbox(0)}>
            <Image
              src={images[0]}
              alt={title}
              fill
              style={{ objectFit: 'cover' }}
              priority
              className="hover-zoom"
            />
          </div>
          <div className="grid-sub">
            {images.slice(1, 5).map((img, idx) => (
              <div key={idx} className="grid-item" onClick={() => openLightbox(idx + 1)}>
                <Image
                  src={img}
                  alt={`${title} - ${idx + 2}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="hover-zoom"
                />
                {idx === 3 && images.length > 5 && (
                  <div className="more-overlay">
                    +{images.length - 5} fotos
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="close-btn" onClick={closeLightbox}>×</button>

          <button className="nav-btn prev" onClick={prevImage}>‹</button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="image-wrapper">
              <Image
                src={images[currentIndex]}
                alt={`Fullscreen ${currentIndex + 1}`}
                fill
                style={{ objectFit: 'contain' }}
                sizes="100vw"
                priority
              />
            </div>
            <div className="lightbox-caption">
              {currentIndex + 1} / {images.length} • {title}
            </div>
          </div>

          <button className="nav-btn next" onClick={nextImage}>›</button>
        </div>
      )}

      <style jsx>{`
        .gallery-wrapper {
          position: relative;
        }
        /* Mobile */
        .mobile-gallery {
          display: block;
          position: relative;
          height: 300px;
        }
        .gallery-scroll {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          height: 100%;
          scrollbar-width: none;
        }
        .gallery-scroll::-webkit-scrollbar { display: none; }
        .gallery-item {
          flex: 0 0 100%;
          scroll-snap-align: start;
          height: 100%;
          position: relative;
        }
        .gallery-counter {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        /* Desktop */
        .desktop-gallery {
          display: none;
          padding-top: 24px;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 8px;
          height: 400px;
          border-radius: 16px;
          overflow: hidden;
        }
        .grid-main {
          position: relative;
          height: 100%;
          cursor: pointer;
        }
        .grid-sub {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 8px;
          height: 100%;
        }
        .grid-item {
          position: relative;
          height: 100%;
          cursor: pointer;
        }
        .more-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
        }
        :global(.hover-zoom) {
            transition: transform 0.5s ease;
        }
        .grid-main:hover :global(.hover-zoom),
        .grid-item:hover :global(.hover-zoom) {
            transform: scale(1.05);
        }

        /* Lightbox */
        .lightbox-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.95);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease-out;
        }
        .lightbox-content {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .image-wrapper {
            position: relative;
            width: 90%;
            height: 80%;
        }
        .close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            color: white;
            font-size: 3rem;
            cursor: pointer;
            z-index: 10000;
            line-height: 0.5;
        }
        .nav-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            font-size: 3rem;
            padding: 10px;
            cursor: pointer;
            z-index: 10000;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.2); }
        .prev { left: 20px; }
        .next { right: 20px; }
        .lightbox-caption {
            color: #ccc;
            margin-top: 16px;
            font-size: 0.9rem;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @media (min-width: 768px) {
          .mobile-gallery { display: none; }
          .desktop-gallery { display: block; }
        }
        .container {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 20px;
        }
      `}</style>
    </div>
  );
}
