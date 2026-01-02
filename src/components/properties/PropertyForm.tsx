"use client";

import React, { useState } from 'react';
import { PropertyData, PropertyType, Location } from '@/types/property';
import LocationSelector from './LocationSelector';
import FileUpload from './FileUpload';
import { createProperty } from '@/lib/services/propertyService';

const INITIAL_LOCATION: Location = {
    department: '',
    city: '',
    addressType: 'Calle',
    addressMainNum: '',
    addressSecNum: '',
    neighborhood: ''
};

export default function PropertyForm() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<PropertyData>>({
        type: 'Casa',
        location: INITIAL_LOCATION,
        images: [],
        legal: { documentNames: [] }
    });

    // Local state for files to upload
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [docFiles, setDocFiles] = useState<File[]>([]);

    const handleChange = (field: keyof PropertyData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLocationChange = (location: Location) => {
        setFormData(prev => ({ ...prev, location }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createProperty(formData, imageFiles, docFiles);
            alert('Propiedad publicada exitosamente!');
            // Reset or redirect
        } catch (error) {
            alert('Error al publicar la propiedad');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const isLote = formData.type === 'Lote';

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-8">

            {/* 1. Categorización */}
            <section className="space-y-4 border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800">Información Básica</h2>

                {/* Tipo de Inmueble */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Inmueble</label>
                    <div className="flex gap-4">
                        {['Casa', 'Apartamento', 'Local', 'Lote'].map((type) => (
                            <label key={type} className={`cursor-pointer border p-4 rounded-lg flex-1 text-center transition-all ${formData.type === type ? 'bg-blue-50 border-blue-500 font-bold text-blue-700' : 'hover:bg-gray-50'}`}>
                                <input
                                    type="radio"
                                    name="propertyType"
                                    value={type}
                                    checked={formData.type === type}
                                    onChange={(e) => handleChange('type', e.target.value as PropertyType)}
                                    className="hidden"
                                />
                                {type}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Campos Comunes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                        <input type="text" required className="w-full p-2 border rounded"
                            onChange={(e) => handleChange('title', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio (COP)</label>
                        <input type="number" required className="w-full p-2 border rounded"
                            onChange={(e) => handleChange('price', Number(e.target.value))} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea required className="w-full p-2 border rounded h-32"
                        onChange={(e) => handleChange('description', e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Área Total (m²)</label>
                        <input type="number" required className="w-full p-2 border rounded"
                            onChange={(e) => handleChange('totalArea', Number(e.target.value))} />
                    </div>
                </div>
            </section>

            {/* 2. Campos Dinámicos */}
            <section className="space-y-4 border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800">Detalles Específicos</h2>

                {isLote ? (
                    // Campos para Lote
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Topografía</label>
                            <select className="w-full p-2 border rounded" onChange={(e) => handleChange('topography', e.target.value)}>
                                <option value="">Seleccione...</option>
                                <option value="Plano">Plano</option>
                                <option value="Inclinado">Inclinado</option>
                                <option value="Ondulado">Ondulado</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Uso de Suelo</label>
                            <input type="text" className="w-full p-2 border rounded" placeholder="Ej: Residencial, Comercial"
                                onChange={(e) => handleChange('landUse', e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="utilities" className="h-4 w-4"
                                onChange={(e) => handleChange('hasUtilities', e.target.checked)} />
                            <label htmlFor="utilities" className="text-sm font-medium text-gray-700">Acceso a Servicios Públicos</label>
                        </div>
                    </div>
                ) : (
                    // Campos para Casa/Apto/Local
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
                            <input type="number" className="w-full p-2 border rounded"
                                onChange={(e) => handleChange('rooms', Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
                            <input type="number" className="w-full p-2 border rounded"
                                onChange={(e) => handleChange('bathrooms', Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estrato</label>
                            <input type="number" min="1" max="6" className="w-full p-2 border rounded"
                                onChange={(e) => handleChange('stratum', Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Antigüedad (Años)</label>
                            <input type="number" className="w-full p-2 border rounded"
                                onChange={(e) => handleChange('antiquity', Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Parqueaderos</label>
                            <input type="number" className="w-full p-2 border rounded"
                                onChange={(e) => handleChange('parking', Number(e.target.value))} />
                        </div>
                    </div>
                )}
            </section>

            {/* 3. Ubicación */}
            <LocationSelector value={formData.location as Location} onChange={handleLocationChange} />

            {/* 4. Multimedia y Legal */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Multimedia y Legal</h2>

                <FileUpload
                    label="Galería de Imágenes"
                    accept="image/*"
                    multiple={true}
                    onFilesSelected={(files) => setImageFiles(prev => [...prev, ...files])}
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video (URL YouTube/Vimeo)</label>
                    <input type="url" className="w-full p-2 border rounded" placeholder="https://..."
                        onChange={(e) => handleChange('videoUrl', e.target.value)} />
                </div>

                <div className="border-t pt-4 mt-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Documentación Legal (Privado)</h3>
                    <FileUpload
                        label="Certificado de Tradición / Escritura"
                        accept=".pdf,image/*"
                        helperText="Sube el Certificado de Tradición y Libertad o Escritura para validar tu propiedad"
                        onFilesSelected={(files) => setDocFiles(prev => [...prev, ...files])}
                    />
                </div>
            </section>

            {/* Submit */}
            <div className="pt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md text-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Publicando...' : 'Publicar Propiedad'}
                </button>
            </div>

        </form>
    );
}
