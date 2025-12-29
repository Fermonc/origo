import HomeClient from '@/components/HomeClient';
import styles from './page.module.css';

export const metadata = {
  title: 'Origo Inmobiliaria | Lotes, Fincas y Locales en el Oriente Antioqueño',
  description: 'Descubre propiedades exclusivas en el Oriente Antioqueño. Venta de lotes, fincas y locales comerciales en Rionegro, Llanogrande y alrededores.',
  openGraph: {
    title: 'Origo Inmobiliaria | Inversión Raíz en Oriente Antioqueño',
    description: 'Conectamos personas con espacios únicos. Encuentra tu próximo proyecto con Origo.',
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'],
  },
};

export default function Home() {
  return (
    <div className={styles.page}>
      <HomeClient />
    </div>
  );
}
