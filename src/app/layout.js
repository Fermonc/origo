import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2C3E50',
};

export const metadata = {
  title: 'Origo Inmobiliaria | Lotes, Fincas y Locales en el Oriente Antioqueño',
  description: 'Encuentra tu propiedad ideal en el Oriente Antioqueño. Venta de lotes, fincas y locales comerciales con Origo Inmobiliaria.',
  keywords: ['inmobiliaria', 'oriente antioqueño', 'lotes', 'fincas', 'locales', 'venta de propiedades', 'rionegro', 'llanogrande'],
  authors: [{ name: 'Origo Inmobiliaria' }],
  creator: 'Origo Inmobiliaria',
  publisher: 'Origo Inmobiliaria',
  robots: 'index, follow',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://origo-1629f.web.app/',
    title: 'Origo Inmobiliaria | Propiedades Exclusivas',
    description: 'Conectamos personas con espacios únicos. Descubre las mejores oportunidades de inversión en el Oriente Antioqueño.',
    siteName: 'Origo Inmobiliaria',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Origo Inmobiliaria - Oriente Antioqueño',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Origo Inmobiliaria | Propiedades Exclusivas',
    description: 'Encuentra tu propiedad ideal en el Oriente Antioqueño.',
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Origo',
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Origo Inmobiliaria',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
    description: 'Agencia inmobiliaria especializada en venta de lotes, fincas y locales en el Oriente Antioqueño.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Centro Empresarial',
      addressLocality: 'Rionegro',
      addressRegion: 'Antioquia',
      postalCode: '054040',
      addressCountry: 'CO'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 6.1551,
      longitude: -75.3737
    },
    url: 'https://origo-1629f.web.app/',
    telephone: '+573001234567',
    priceRange: '$$$'
  };

  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <BottomNav />
        <Footer />
      </body>
    </html >
  );
}
