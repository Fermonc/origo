import React from 'react';
import PropertyForm from '@/components/properties/PropertyForm';

export default function CreatePropertyPage() {
    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Publicar Nueva Propiedad</h1>
                    <p className="text-gray-600 mt-2">Completa la información para listar tu inmueble en Origo.</p>
                </div>
                <PropertyForm />
            </div>
        </div>
    );
}
