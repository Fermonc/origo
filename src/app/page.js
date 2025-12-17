
import Header from '@/components/Header';
import HomeClient from '@/components/HomeClient';
import { getFeaturedProperties } from '@/lib/db/properties';

export const metadata = {
  title: 'Origo Inmobiliaria | Lotes, Fincas y Locales en el Oriente Antioqueño',
  description: 'Descubre propiedades exclusivas en el Oriente Antioqueño. Venta de lotes, fincas y locales comerciales en Rionegro, Llanogrande y alrededores.',
  openGraph: {
    title: 'Origo Inmobiliaria | Inversión Raíz en Oriente Antioqueño',
    description: 'Conectamos personas con espacios únicos. Encuentra tu próximo proyecto con Origo.',
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'],
  },
};

// Server Component (Default in App Router)
export default async function Home() {
  // Fetch initial data on the server (SEO friendly)
  const initialProperties = await getFeaturedProperties(12);

  return (
    <div className="page">
      <Header />
      <HomeClient initialProperties={initialProperties} />

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #fff;
          color: #111;
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
