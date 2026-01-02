"use client";

import React, { useEffect, useState } from 'react';
import { COLOMBIA_LOCATIONS, ADDRESS_TYPES } from '@/lib/colombia';
import { Location } from '@/types/property';

interface LocationSelectorProps {
    value: Location;
    onChange: (location: Location) => void;
}

export default function LocationSelector({ value, onChange }: LocationSelectorProps) {
    const [cities, setCities] = useState<string[]>([]);

    useEffect(() => {
        if (value.department) {
            setCities(COLOMBIA_LOCATIONS[value.department] || []);
            // Reset city if not in new department list
            if (value.city && !COLOMBIA_LOCATIONS[value.department]?.includes(value.city)) {
                handleChange('city', '');
            }
        } else {
            setCities([]);
        }
    }, [value.department]);

    const handleChange = (field: keyof Location, fieldValue: string) => {
        onChange({
            ...value,
            [field]: fieldValue
        });
    };

    return (
        <div className="space-y-4 p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700">Ubicación</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Departamento */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={value.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                    >
                        <option value="">Seleccione...</option>
                        {Object.keys(COLOMBIA_LOCATIONS).map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>

                {/* Ciudad */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={value.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        disabled={!value.department}
                    >
                        <option value="">Seleccione...</option>
                        {cities.map((city) => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Dirección Estructurada */}
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {/* Tipo Vía */}
                    <select
                        className="p-2 border border-gray-300 rounded-md"
                        value={value.addressType}
                        onChange={(e) => handleChange('addressType', e.target.value as any)}
                    >
                        {ADDRESS_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>

                    {/* Número Principal */}
                    <input
                        type="text"
                        placeholder="# Principal"
                        className="p-2 border border-gray-300 rounded-md"
                        value={value.addressMainNum}
                        onChange={(e) => handleChange('addressMainNum', e.target.value)}
                    />

                    {/* Número Secundario */}
                    <input
                        type="text"
                        placeholder="# Secundario / Placa"
                        className="p-2 border border-gray-300 rounded-md"
                        value={value.addressSecNum}
                        onChange={(e) => handleChange('addressSecNum', e.target.value)}
                    />
                </div>
            </div>

            {/* Barrio */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barrio</label>
                <input
                    type="text"
                    placeholder="Nombre del barrio"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={value.neighborhood}
                    onChange={(e) => handleChange('neighborhood', e.target.value)}
                />
            </div>
        </div>
    );
}
