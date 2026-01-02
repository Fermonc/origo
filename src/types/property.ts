export type PropertyType = 'Casa' | 'Apartamento' | 'Local' | 'Lote';

export interface Location {
    department: string;
    city: string;
    addressType: 'Calle' | 'Carrera' | 'Avenida' | 'Transversal' | 'Diagonal';
    addressMainNum: string;
    addressSecNum: string; // Placa/Complemento
    neighborhood: string;
}

export interface LegalDocs {
    traditionCertificateUrl?: string; // Certificado de Tradición y Libertad
    deedUrl?: string; // Escritura
    documentNames: string[]; // For display purposes
}

export interface PropertyData {
    id?: string;
    userId: string;
    createdAt: number; // Timestamp
    updatedAt: number;

    // Categorization
    type: PropertyType;
    title: string;
    description: string;
    price: number;
    totalArea: number; // m2

    // Conditional Fields (Casa/Apto/Local)
    rooms?: number;
    bathrooms?: number;
    stratum?: number; // Estrato 1-6
    antiquity?: number; // Years
    parking?: number;

    // Conditional Fields (Lote)
    topography?: 'Plano' | 'Inclinado' | 'Ondulado';
    landUse?: string; // Uso de Suelo
    hasUtilities?: boolean; // Acceso a servicios públicos

    // Location
    location: Location;

    // Legal
    legal: LegalDocs;

    // Multimedia
    images: string[]; // URLs
    videoUrl?: string;
}
