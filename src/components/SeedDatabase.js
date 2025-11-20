'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { properties } from '@/data/properties';

export default function SeedDatabase() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleSeed = async () => {
        setLoading(true);
        setStatus('Iniciando carga...');
        try {
            const collectionRef = collection(db, 'properties');

            for (const prop of properties) {
                // Remove ID to let Firestore generate it, add createdAt
                const { id, ...propData } = prop;
                await addDoc(collectionRef, {
                    ...propData,
                    createdAt: new Date().toISOString()
                });
            }
            setStatus('¡Base de datos poblada con éxito! Recarga la página.');
        } catch (error) {
            console.error("Error seeding database:", error);
            setStatus('Error al cargar datos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', margin: '20px 0', textAlign: 'center' }}>
            <h3>🔧 Configuración Inicial</h3>
            <p>Tu base de datos está vacía. Haz clic abajo para cargar las propiedades de ejemplo.</p>
            <button
                onClick={handleSeed}
                disabled={loading}
                className="btn btn-primary"
                style={{ marginTop: '10px' }}
            >
                {loading ? 'Cargando...' : 'Cargar Datos de Prueba a Firebase'}
            </button>
            {status && <p style={{ marginTop: '10px', fontWeight: 'bold', color: status.includes('Error') ? 'red' : 'green' }}>{status}</p>}
        </div>
    );
}
