import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export function usePropertyFilters(properties) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname(); // Get current path (mapa or propiedades)

    // Initial state from URL
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '', // Added search/query
        type: searchParams.get('type') || 'all',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        city: searchParams.get('city') || '',
        bedrooms: parseInt(searchParams.get('bedrooms')) || 0,
        bathrooms: parseInt(searchParams.get('bathrooms')) || 0,
        // Add other filters as needed
    });

    // Update URL when filters change
    const updateFilters = useCallback((newFilters) => {
        // Merge provided filter updates (if newFilters is partial) or replace if full object.
        // For safety, let's assume newFilters is the complete new state relative to our struct
        // Or we can support partial updates. Let's support partial merging.

        setFilters(prev => {
            const next = { ...prev, ...newFilters };

            // Update URL params
            const params = new URLSearchParams(searchParams.toString());

            if (next.search) params.set('search', next.search); else params.delete('search');
            if (next.type && next.type !== 'all') params.set('type', next.type); else params.delete('type');
            if (next.minPrice) params.set('minPrice', next.minPrice); else params.delete('minPrice');
            if (next.maxPrice) params.set('maxPrice', next.maxPrice); else params.delete('maxPrice');
            if (next.city) params.set('city', next.city); else params.delete('city');
            if (next.bedrooms > 0) params.set('bedrooms', next.bedrooms); else params.delete('bedrooms');
            // ... match other fields

            // Push to router
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            return next;
        });
    }, [pathname, router, searchParams]);

    // Client-side filtering logic
    // Note: ideally moved to server or memoized heavily
    const filteredProperties = properties.filter(p => {
        // Search Term
        if (filters.search) {
            const s = filters.search.toLowerCase();
            const matchesSearch = p.title?.toLowerCase().includes(s) ||
                p.location?.toLowerCase().includes(s);
            if (!matchesSearch) return false;
        }

        // Type
        if (filters.type !== 'all' && p.type !== filters.type) return false;

        // Price
        const price = parseInt(p.price?.replace(/\D/g, '') || '0');
        // ... logic same as before ...
        if (filters.minPrice) {
            let min = parseInt(filters.minPrice.replace(/\D/g, ''));
            if (min < 100000) min = min * 1000000;
            if (price < min) return false;
        }
        if (filters.maxPrice) {
            let max = parseInt(filters.maxPrice.replace(/\D/g, ''));
            if (max < 100000) max = max * 1000000;
            if (price > max) return false;
        }

        // City / Location
        if (filters.city && !p.location?.includes(filters.city)) return false;

        // Bed/Bath
        if (filters.bedrooms > 0 && (parseInt(p.bedrooms) || 0) < filters.bedrooms) return false;

        return true;
    });

    return { filters, updateFilters, filteredProperties };
}
