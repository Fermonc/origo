// Hierarchical Locations Configuration
// Used in MapSidebar and InteractiveMap
export const LOCATIONS = [
    {
        name: 'Rionegro',
        coords: [6.1551, -75.3737],
        zones: [
            { name: 'Centro', coords: [6.1530, -75.3740] },
            { name: 'San Antonio', coords: [6.1333, -75.3833] },
            { name: 'El Porvenir', coords: [6.1450, -75.3600] },
            { name: 'Llanogrande', coords: [6.1167, -75.4167] },
            { name: 'Gualanday', coords: [6.1100, -75.4200] }
        ]
    },
    {
        name: 'La Ceja',
        coords: [6.0333, -75.4333],
        zones: [
            { name: 'Centro', coords: [6.0333, -75.4333] },
            { name: 'Pontezuela', coords: [6.0500, -75.4200] }
        ]
    },
    {
        name: 'El Retiro',
        coords: [6.0583, -75.5000],
        zones: [
            { name: 'Puro Cuero', coords: [6.0600, -75.5000] },
            { name: 'Fizebad', coords: [6.0800, -75.4800] }
        ]
    },
    {
        name: 'Marinilla',
        coords: [6.1750, -75.3333],
        zones: [
            { name: 'Centro', coords: [6.1750, -75.3333] }
        ]
    },
    {
        name: 'Cali',
        coords: [3.4516, -76.5320],
        zones: [
            { name: 'Pance', coords: [3.3333, -76.5333] },
            { name: 'Ciudad Jardín', coords: [3.3667, -76.5333] },
            { name: 'Granada', coords: [3.4550, -76.5350] },
            { name: 'El Peñón', coords: [3.4500, -76.5400] }
        ]
    }
];

export const INITIAL_MAP_CENTER = [6.1551, -75.3737]; // Rionegro
