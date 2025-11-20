export default function SkeletonDetail() {
    return (
        <div className="skeleton-page">
            {/* Hero Skeleton */}
            <div className="skeleton-hero"></div>

            <div className="container" style={{ marginTop: 'var(--space-lg)' }}>
                <div className="content-grid">
                    {/* Main Info Skeleton */}
                    <div className="details">
                        <div className="skeleton-text title"></div>
                        <div className="skeleton-text location"></div>

                        <div className="skeleton-section">
                            <div className="skeleton-text subtitle"></div>
                            <div className="skeleton-text paragraph"></div>
                            <div className="skeleton-text paragraph"></div>
                        </div>

                        <div className="skeleton-section">
                            <div className="skeleton-text subtitle"></div>
                            <div className="skeleton-features">
                                <div className="skeleton-feature"></div>
                                <div className="skeleton-feature"></div>
                                <div className="skeleton-feature"></div>
                                <div className="skeleton-feature"></div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <aside className="sidebar">
                        <div className="skeleton-card">
                            <div className="skeleton-text price-label"></div>
                            <div className="skeleton-text price"></div>
                            <div className="skeleton-button"></div>
                        </div>
                    </aside>
                </div>
            </div>

            <style jsx>{`
        .skeleton-hero {
          height: 60vh;
          background-color: #e0e0e0;
          animation: pulse 1.5s infinite;
          width: 100%;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-lg);
        }

        @media (min-width: 768px) {
          .content-grid {
            grid-template-columns: 2fr 1fr;
          }
        }

        .skeleton-text {
          background-color: #e0e0e0;
          border-radius: 4px;
          margin-bottom: 1rem;
          animation: pulse 1.5s infinite;
        }

        .title { height: 40px; width: 70%; }
        .location { height: 24px; width: 40%; margin-bottom: 2rem; }
        .subtitle { height: 28px; width: 30%; margin-bottom: 1rem; }
        .paragraph { height: 16px; width: 100%; margin-bottom: 0.5rem; }
        
        .skeleton-features {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }
        .skeleton-feature {
          height: 24px;
          background-color: #e0e0e0;
          border-radius: 4px;
          animation: pulse 1.5s infinite;
        }

        .skeleton-card {
          background: white;
          padding: var(--space-md);
          border-radius: 12px;
          border: 1px solid var(--color-border);
          height: 250px;
        }

        .price-label { height: 16px; width: 50%; }
        .price { height: 40px; width: 80%; margin-bottom: 2rem; }
        .skeleton-button { height: 50px; width: 100%; background-color: #e0e0e0; border-radius: 8px; animation: pulse 1.5s infinite; }

        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
        </div>
    );
}
