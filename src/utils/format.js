export const formatPrice = (price) => {
    if (!price) return '';

    // If it's already formatted (contains $ or ,), return as is
    if (typeof price === 'string' && (price.includes('$') || price.includes(','))) {
        return price;
    }

    // Convert to number
    const numberPrice = Number(price);
    if (isNaN(numberPrice)) return price;

    // Format as COP by default
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numberPrice);
};
