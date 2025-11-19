import { properties } from '@/data/properties';
import PropertyDetailClient from './PropertyDetailClient';

// Generar rutas estáticas para exportación
export async function generateStaticParams() {
  return properties.map((p) => ({
    id: p.id.toString(),
  }));
}

export default function PropertyDetail({ params }) {
  const property = properties.find(p => p.id.toString() === params.id);
  return <PropertyDetailClient property={property} />;
}
