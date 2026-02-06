import type { Platform } from "../types.js";

export const platforms: Platform[] = [
  {
    id: "alluradirect",
    name: "AlluraDirect",
    url: "https://www.alluradirect.com",
    description:
      "BC-based vacation rental platform with low service fees and a strong Whistler inventory. Popular with budget-conscious travelers looking to avoid the higher commissions of Airbnb and VRBO.",
    keyStrengths: [
      "Low service fees compared to Airbnb/VRBO",
      "Local BC-based company with regional expertise",
      "Strong condo search and filter tools",
      "Direct owner communication",
    ],
    feeNotes: "Lower service fees than major platforms; savings passed to guests",
    whistlerFocus: "200+ Whistler properties across all neighborhoods",
    propertyCount: "200+",
    bestFor: "Budget-conscious travelers seeking condos with lower booking fees",
  },
  {
    id: "whistler-platinum",
    name: "Whistler Platinum",
    url: "https://www.whistlerplatinum.com",
    description:
      "Premium local property management company specializing in luxury Whistler chalets and condos. Offers concierge services, local support, and hand-picked properties with high standards.",
    keyStrengths: [
      "Luxury chalets and premium condos",
      "Local on-the-ground support and concierge",
      "Hand-picked, quality-inspected properties",
      "Direct booking savings vs third-party platforms",
    ],
    feeNotes: "Direct booking saves guest fees; competitive management rates",
    whistlerFocus: "120+ managed rentals across Whistler's top neighborhoods",
    propertyCount: "120+",
    bestFor: "Luxury travelers wanting premium properties with local concierge support",
  },
  {
    id: "whistler-com",
    name: "Whistler.com",
    url: "https://www.whistler.com",
    description:
      "The official Whistler tourism portal offering a wide range of vacation rentals from private homes to hotel-style condos. Backed by Tourism Whistler with secure booking and verified listings.",
    keyStrengths: [
      "Official Whistler tourism platform",
      "Wide range from budget to luxury",
      "Secure, verified bookings",
      "Integrated trip planning with activities and dining",
    ],
    feeNotes: "Secure official bookings; pricing varies by property manager",
    whistlerFocus: "All Whistler neighborhoods covered; broadest selection",
    propertyCount: "300+",
    bestFor: "First-time Whistler visitors wanting a trusted, all-in-one booking platform",
  },
  {
    id: "blackcomb-peaks",
    name: "Blackcomb Peaks",
    url: "https://www.blackcombpeaks.com",
    description:
      "Local Whistler property management company with a strong portfolio of ski-in/ski-out properties. Known for well-maintained units in top locations like The Aspens, Montebello, and Whistler Village.",
    keyStrengths: [
      "90+ ski-in/ski-out options",
      "Well-maintained properties with quality amenities",
      "Best rates when booking direct",
      "Strong presence in Upper Village and Village locations",
    ],
    feeNotes: "Best rates available through direct booking on their site",
    whistlerFocus:
      "Aspens, Montebello, village condos, and townhomes — heavy ski-in/ski-out focus",
    propertyCount: "90+",
    bestFor: "Skiers and snowboarders wanting guaranteed ski-in/ski-out access",
  },
  {
    id: "whistler-blackcomb",
    name: "Whistler Blackcomb (Vail Resorts)",
    url: "https://www.whistlerblackcomb.com",
    description:
      "The resort's own accommodation portal, operated by Vail Resorts. Offers verified ski-access properties integrated with lift tickets and ski school packages. Focus on resort-adjacent townhomes and condos.",
    keyStrengths: [
      "Resort-integrated bookings (lift tickets + lodging)",
      "Verified ski-access properties",
      "Bundle deals with ski school and rentals",
      "Trusted Vail Resorts brand",
    ],
    feeNotes: "Resort-integrated pricing; bundle discounts available",
    whistlerFocus:
      "Resort-adjacent properties like Stoney Creek, Legends, and village condos",
    propertyCount: "50+",
    bestFor: "Families wanting easy lift-ticket-and-lodging bundles through the resort",
  },
];

export function getPlatform(id: string): Platform | undefined {
  return platforms.find((p) => p.id === id);
}
