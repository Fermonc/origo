import PropertyDetailClient from './PropertyDetailClient';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function generateMetadata({ params }) {
  const id = params.id;
  const docRef = doc(db, 'properties', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const property = docSnap.data();
    return {
      title: `${property.title} | Origo Inmobiliaria`,
      description: `Venta de ${property.type} en ${property.location}. ${property.price}. ${property.description.substring(0, 150)}...`,
      openGraph: {
        title: property.title,
        description: property.description.substring(0, 100),
        images: property.images && property.images.length > 0 ? [property.images[0]] : [property.image],
      },
    };
  }

  return {
    title: 'Propiedad no encontrada | Origo',
  };
}

export default function PropertyDetail({ params }) {
  return <PropertyDetailClient id={params.id} />;
}
