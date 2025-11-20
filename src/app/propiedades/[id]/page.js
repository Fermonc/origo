import PropertyDetailClient from './PropertyDetailClient';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function generateMetadata({ params }) {
  // Next.js 15+ treats params as a Promise
  const { id } = await params;

  try {
    const docRef = doc(db, 'properties', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const property = docSnap.data();
      const description = property.description || '';
      const title = property.title || 'Detalle de Propiedad';

      // Safe image access
      const images = property.images && property.images.length > 0
        ? property.images
        : property.image
          ? [property.image]
          : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'];

      return {
        title: `${title} | Origo Inmobiliaria`,
        description: `Venta de ${property.type || 'Inmueble'} en ${property.location || 'Rionegro'}. ${property.price || ''}. ${description.substring(0, 150)}...`,
        openGraph: {
          title: title,
          description: description.substring(0, 100),
          images: images,
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: 'Propiedad no encontrada | Origo',
    description: 'No pudimos encontrar la propiedad que buscas.',
  };
}

export default async function PropertyDetail({ params }) {
  // Await params in the page component too
  const { id } = await params;
  return <PropertyDetailClient id={id} />;
}
