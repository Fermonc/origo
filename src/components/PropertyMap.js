'use client';

import dynamic from 'next/dynamic';
import SkeletonCard from './SkeletonCard';

const PropertyMapClient = dynamic(() => import('./PropertyMapClient'), {
    ssr: false,
    loading: () => <div style={{ height: '400px', background: '#e0e0e0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando mapa...</div>
});

export default function PropertyMap(props) {
    return <PropertyMapClient {...props} />;
}
