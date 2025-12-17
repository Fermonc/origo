import L from 'leaflet';

// SVG Icons for Markers
const svgs = {
    house: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M11.67 3.87L9.9 2.1 0 12h5v10h14V12h5l-9.9-9.9-1.77 1.77z"/></svg>`,
    building: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7zM11 7h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zM15 7h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2z"/></svg>`,
    tree: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M10 21v-2H3V5h2v2h2V5h2v2h2V5h2v2h2V5h2v14h-7v2h6v2H10z"/></svg>`,
    lot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z"/></svg>`
};

export const getIconForType = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('finca') || t.includes('lote')) return svgs.tree;
    if (t.includes('local') || t.includes('oficina')) return svgs.building;
    return svgs.house;
};

export const createCustomIcon = (type) => {
    const iconSvg = getIconForType(type);
    const colorClass = type?.toLowerCase().includes('lote') ? 'lote' :
        type?.toLowerCase().includes('finca') ? 'finca' : 'casa';

    return L.divIcon({
        className: 'custom-marker-icon',
        html: `<div class="marker-circle ${colorClass}">
             ${iconSvg}
           </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
};
