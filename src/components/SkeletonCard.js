export default function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
                <div className="skeleton-text title"></div>
                <div className="skeleton-text price"></div>
                <div className="skeleton-text location"></div>
                <div className="skeleton-footer">
                    <div className="skeleton-text feature"></div>
                    <div className="skeleton-text feature"></div>
                </div>
            </div>

            <style jsx>{`
        .skeleton-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--color-border);
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .skeleton-image {
          width: 100%;
          height: 250px;
          background-color: #e0e0e0;
          animation: pulse 1.5s infinite;
        }

        .skeleton-content {
          padding: var(--space-md);
        }

        .skeleton-text {
          background-color: #e0e0e0;
          border-radius: 4px;
          margin-bottom: 0.5rem;
          animation: pulse 1.5s infinite;
        }

        .title { height: 24px; width: 80%; }
        .price { height: 20px; width: 50%; margin-bottom: 1rem; }
        .location { height: 16px; width: 60%; }
        
        .skeleton-footer {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .feature { height: 20px; width: 60px; border-radius: 12px; }

        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
        </div>
    );
}
