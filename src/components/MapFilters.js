'use client';

import { useState } from 'react';

/**
 * Filter component for the property map.
 * Options are synchronized with PropertyForm.js to ensure data consistency.
 */
export default function MapFilters({ onFilterChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [propertyType, setPropertyType] = useState('all');
    const [priceRange, setPriceRange] = useState('all');

    const handleFilterChange = (key, value) => {
        let newFilters = {
            searchTerm: key === 'search' ? value : searchTerm,
            propertyType: key === 'type' ? value : propertyType,
            priceRange: key === 'price' ? value : priceRange
        };

        if (key === 'search') setSearchTerm(value);
        if (key === 'type') setPropertyType(value);
        if (key === 'price') setPriceRange(value);

        onFilterChange(newFilters);
    };

    return (
        <div className="map-filters-container">
            {/* Search Input */}
            <div className="filter-group search-group">
                <div className="search-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Buscar por ubicación o título..."
                    value={searchTerm}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="filter-input with-icon"
                />
            </div>

            {/* Property Type Filter */}
            <div className="filter-group">
                <select
                    value={propertyType}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="filter-select"
                >
                    <option value="all">Tipo de Inmueble</option>
                    <option value="Lote">Lote</option>
                    <option value="Finca">Finca</option>
                    <option value="Casa Campestre">Casa Campestre</option>
                    <option value="Casa">Casa</option>
                    <option value="Apartamento">Apartamento</option>
                    <option value="Local">Local</option>
                    <option value="Bodega">Bodega</option>
                </select>
            </div>

            {/* Price Range Filter */}
            <div className="filter-group">
                <select
                    value={priceRange}
                    onChange={(e) => handleFilterChange('price', e.target.value)}
                    className="filter-select"
                >
                    <option value="all">Presupuesto</option>
                    <option value="0-200">Hasta $200M</option>
                    <option value="200-500">$200M - $500M</option>
                    <option value="500-1000">$500M - $1,000M</option>
                    <option value="1000-2000">$1,000M - $2,000M</option>
                    <option value="2000+">Más de $2,000M</option>
                </select>
            </div>

            <style jsx>{`
                .map-filters-container {
                    position: absolute;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 1000;
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(12px);
                    padding: 12px;
                    border-radius: 50px;
                    display: flex;
                    gap: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                    width: auto;
                    max-width: 90%;
                    white-space: nowrap;
                    border: 1px solid rgba(0,0,0,0.05);
                }

                .filter-group {
                    position: relative;
                }

                .search-group {
                    min-width: 280px;
                }

                .search-icon-wrapper {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #6B7280;
                    pointer-events: none;
                    display: flex;
                }

                .filter-input, .filter-select {
                    width: 100%;
                    padding: 10px 16px;
                    border: 1px solid #E5E7EB;
                    border-radius: 30px;
                    font-size: 0.95rem;
                    outline: none;
                    transition: all 0.2s;
                    background: #F9FAFB;
                    color: #1F2937;
                    height: 44px;
                }

                .filter-input.with-icon {
                    padding-left: 42px;
                }

                .filter-input:focus, .filter-select:focus {
                    background: white;
                    border-color: #111;
                    box-shadow: 0 0 0 2px rgba(0,0,0,0.05);
                }

                .filter-select {
                    padding-right: 32px;
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 0.5rem center;
                    background-repeat: no-repeat;
                    background-size: 1.5em 1.5em;
                }

                @media (max-width: 768px) {
                    .map-filters-container {
                        top: 10px;
                        flex-direction: column;
                        width: 90%;
                        border-radius: 16px;
                        gap: 8px;
                    }

                    .search-group {
                        min-width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
