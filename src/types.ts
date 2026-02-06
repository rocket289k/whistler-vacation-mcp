export interface Property {
  id: string;
  name: string;
  type: "condo" | "chalet" | "townhouse" | "cabin";
  neighborhood: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  skiInSkiOut: boolean;
  petFriendly: boolean;
  pricePerNight: number; // CAD
  cleaningFee: number; // CAD
  images: string[];
  rating: number; // 1-5
  reviewCount: number;
  host: {
    name: string;
    superhost: boolean;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  availableSeasons: ("winter" | "spring" | "summer" | "fall")[];
  minimumStay: number; // nights
  blockedDates: string[]; // ISO date strings for unavailable dates
}

export interface Neighborhood {
  id: string;
  name: string;
  description: string;
  highlights: string[];
  nearestLift: string;
  distanceToVillage: string;
  elevation: string;
}

export interface SearchFilters {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  minBedrooms?: number;
  maxPrice?: number;
  skiInSkiOut?: boolean;
  petFriendly?: boolean;
  amenities?: string[];
  propertyType?: string;
  sortBy?: "price_asc" | "price_desc" | "rating" | "bedrooms";
}

export interface AvailabilityResult {
  propertyId: string;
  propertyName: string;
  available: boolean;
  checkIn: string;
  checkOut: string;
  nights: number;
  pricePerNight: number;
  cleaningFee: number;
  totalPrice: number;
  currency: string;
}

export interface ComparisonResult {
  properties: {
    property: Property;
    availability?: AvailabilityResult;
  }[];
}

export interface Platform {
  id: string;
  name: string;
  url: string;
  description: string;
  keyStrengths: string[];
  feeNotes: string;
  whistlerFocus: string;
  propertyCount: string;
  bestFor: string;
}
