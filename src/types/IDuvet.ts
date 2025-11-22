export interface IDuvetVariant {
    id: string;
    sku: string;
    length: number;
    width: number;
    price: number;
    currency: string;
    type: "Sommerdyne" | "Vinterdyne" | "Helårsdyne";
    insulation: "Sval" | "Varm" | "Ekstra varm";
}

export interface IDuvet {
    id: string;
    sku: string;
    slug: string;
    brand: string;
    name: string;
    images: string[];
    allergyFriendly: boolean;
    certifications: string[];
    fillings: string;
    properties: string[];
    quality: "GOLD";
    rating: number;
    variants: IDuvetVariant[];
    years_warranty: number;
}