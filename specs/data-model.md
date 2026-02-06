# Data Model

## 1. TypeScript Interfaces

All interfaces are defined in `src/types.ts`.

### 1.1 Property

The core entity representing a vacation rental listing.

```typescript
interface Property {
  id: string;                    // Unique ID (e.g. "wv-pan-pacific-205")
  name: string;                  // Display name
  type: "condo" | "chalet" | "townhouse" | "cabin";
  neighborhood: string;          // References Neighborhood.id
  description: string;           // Full text description
  bedrooms: number;              // 0 = studio
  bathrooms: number;             // Supports half-baths (e.g. 2.5)
  maxGuests: number;
  amenities: string[];           // e.g. ["wifi", "hot-tub", "ski-storage"]
  skiInSkiOut: boolean;
  petFriendly: boolean;
  pricePerNight: number;         // Base rate in CAD
  cleaningFee: number;           // One-time fee in CAD
  images: string[];              // Filename placeholders
  rating: number;                // 1.0 - 5.0
  reviewCount: number;
  host: {
    name: string;                // Host/management company name
    superhost: boolean;
  };
  coordinates: {
    lat: number;                 // Latitude
    lng: number;                 // Longitude
  };
  availableSeasons: ("winter" | "spring" | "summer" | "fall")[];
  minimumStay: number;           // Minimum nights
  blockedDates: string[];        // ISO date strings (YYYY-MM-DD)
}
```

### 1.2 Neighborhood

Describes a Whistler area/neighborhood.

```typescript
interface Neighborhood {
  id: string;                    // URL-friendly ID (e.g. "whistler-village")
  name: string;                  // Display name (e.g. "Whistler Village")
  description: string;           // Multi-sentence description
  highlights: string[];          // 3-4 key highlights
  nearestLift: string;           // Nearest ski lift with walk time
  distanceToVillage: string;     // Distance/time to Whistler Village
  elevation: string;             // Elevation in meters
}
```

### 1.3 Platform

Represents a real vacation rental booking platform.

```typescript
interface Platform {
  id: string;                    // URL-friendly ID (e.g. "blackcomb-peaks")
  name: string;                  // Display name
  url: string;                   // Website URL
  description: string;           // Multi-sentence description
  keyStrengths: string[];        // 3-4 key advantages
  feeNotes: string;              // Fee structure summary
  whistlerFocus: string;         // What they specialize in for Whistler
  propertyCount: string;         // Approximate count (e.g. "200+")
  bestFor: string;               // Target audience summary
}
```

### 1.4 SearchFilters

Represents the input parameters for property search.

```typescript
interface SearchFilters {
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
```

### 1.5 AvailabilityResult

Returned by the availability check tool.

```typescript
interface AvailabilityResult {
  propertyId: string;
  propertyName: string;
  available: boolean;
  checkIn: string;
  checkOut: string;
  nights: number;
  pricePerNight: number;         // After seasonal adjustment
  cleaningFee: number;
  totalPrice: number;            // (pricePerNight * nights) + cleaningFee
  currency: string;              // Always "CAD"
}
```

### 1.6 ComparisonResult

Structure for property comparison output.

```typescript
interface ComparisonResult {
  properties: {
    property: Property;
    availability?: AvailabilityResult;
  }[];
}
```

## 2. Property ID Convention

Property IDs follow the pattern: `{neighborhood-prefix}-{building/name}-{unit}`.

| Prefix | Neighborhood |
|--------|-------------|
| `wv-` | Whistler Village |
| `uv-` | Upper Village |
| `cs-` | Creekside |
| `vn-` | Village North |
| `kw-` | Kadenwood |
| `nd-` | Nordic |
| `bb-` | Blueberry Hill |

## 3. Property Inventory

### 3.1 Summary (18 properties)

| ID | Name | Type | Neighborhood | BR | Price | Ski-In/Out | Pet |
|----|------|------|-------------|-----|-------|-----------|-----|
| wv-summit-101 | Summit Lodge Village Suite | condo | Whistler Village | 1 | $250 | No | No |
| wv-pan-pacific-205 | Pan Pacific Village Retreat | condo | Whistler Village | 2 | $550 | Yes | No |
| wv-crystal-308 | Crystal Lodge Penthouse | condo | Whistler Village | 3 | $750 | No | No |
| wv-hilton-ski-suite | Hilton Whistler Ski-In 2BR Suite | condo | Whistler Village | 2 | $475 | Yes | No |
| uv-aspens-412 | The Aspens Ski-In Suite | condo | Upper Village | 2 | $495 | Yes | No |
| uv-glaciers-reach-115 | Glacier's Reach Blackcomb View | condo | Upper Village | 1 | $225 | No | No |
| uv-montebello-220 | Montebello Luxury Ski-In Condo | condo | Upper Village | 2 | $580 | Yes | No |
| cs-legends-504 | Legends Creekside Family Condo | condo | Creekside | 2 | $295 | No | Yes |
| cs-lake-placid-102 | Lake Placid Lodge Ski-In Studio | condo | Creekside | 0 | $175 | Yes | No |
| cs-evolution-310 | Evolution Creekside Townhouse | townhouse | Creekside | 3 | $450 | No | Yes |
| vn-marketplace-205 | Marketplace Lodge Studio Plus | condo | Village North | 0 | $150 | No | No |
| vn-northstar-118 | Northstar at Stoney Creek 2BR | condo | Village North | 2 | $275 | No | Yes |
| kw-cedar-chalet | Kadenwood Cedar Luxury Chalet | chalet | Kadenwood | 5 | $1500 | Yes | No |
| kw-slope-house | Kadenwood Slope Side Retreat | chalet | Kadenwood | 4 | $1100 | Yes | No |
| nd-trails-edge-8 | Trail's Edge Nordic Cabin | cabin | Nordic | 2 | $275 | No | Yes |
| nd-lost-lake-cottage | Lost Lake View Cottage | cabin | Nordic | 1 | $195 | No | Yes |
| bb-ridge-view-townhome | Blueberry Ridge View Townhome | townhouse | Blueberry Hill | 3 | $425 | No | No |
| bb-alpine-view-condo | Alpine View 2BR Condo | condo | Blueberry Hill | 2 | $310 | No | No |

### 3.2 Distribution

**By type:** 12 condos, 2 chalets, 2 townhouses, 2 cabins

**By ski-in/ski-out:** 7 yes, 11 no

**By pet-friendly:** 5 yes, 13 no

**By bedroom count:** 2 studios, 3 x 1BR, 7 x 2BR, 3 x 3BR, 1 x 4BR, 1 x 5BR

## 4. Neighborhood Inventory (7 neighborhoods)

| ID | Name | Elevation | Nearest Lift |
|----|------|-----------|-------------|
| whistler-village | Whistler Village | 675m | Whistler Village Gondola (0 min) |
| upper-village | Upper Village | 700m | Blackcomb Excalibur Gondola (2 min) |
| creekside | Creekside | 650m | Creekside Gondola (0-5 min) |
| village-north | Village North (Marketplace) | 660m | Whistler Village Gondola (8 min) |
| kadenwood | Kadenwood | 900m | Kadenwood Private Gondola (at doorstep) |
| nordic | Nordic Estates | 655m | Whistler Village Gondola (15 min walk) |
| blueberry-hill | Blueberry Hill | 720m | Whistler Village Gondola (10 min) |

## 5. Platform Inventory (5 platforms)

| ID | Name | Properties | Best For |
|----|------|-----------|----------|
| alluradirect | AlluraDirect | 200+ | Budget travelers, low fees |
| whistler-platinum | Whistler Platinum | 120+ | Luxury, local concierge |
| whistler-com | Whistler.com | 300+ | First-time visitors, official |
| blackcomb-peaks | Blackcomb Peaks | 90+ | Ski-in/ski-out |
| whistler-blackcomb | Whistler Blackcomb (Vail Resorts) | 50+ | Lift ticket bundles |

## 6. Blocked Dates

Properties with blocked dates (for testing availability logic):

| Property | Blocked Dates |
|----------|--------------|
| wv-summit-101 | 2026-03-22, 2026-03-23, 2026-03-24 |
| wv-crystal-308 | 2026-03-15, 2026-03-16 |
| uv-glaciers-reach-115 | 2026-03-18, 2026-03-19, 2026-03-20 |
| kw-cedar-chalet | 2026-03-14 through 2026-03-20 (full week) |

All other properties have no blocked dates.
