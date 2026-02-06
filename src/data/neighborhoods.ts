import type { Neighborhood } from "../types.js";

export const neighborhoods: Neighborhood[] = [
  {
    id: "whistler-village",
    name: "Whistler Village",
    description:
      "The heart of Whistler, a pedestrian-only village buzzing with restaurants, shops, and après-ski nightlife. Direct access to both Whistler and Blackcomb gondolas. Perfect for first-time visitors who want everything at their doorstep.",
    highlights: [
      "Pedestrian village with 200+ shops and restaurants",
      "Direct gondola access to Whistler and Blackcomb mountains",
      "Vibrant après-ski scene",
      "Village Stroll connects everything on foot",
    ],
    nearestLift: "Whistler Village Gondola (0 min walk)",
    distanceToVillage: "You're in it!",
    elevation: "675m",
  },
  {
    id: "upper-village",
    name: "Upper Village",
    description:
      "A quieter, upscale area at the base of Blackcomb Mountain. Home to luxury hotels like the Fairmont and Four Seasons. Ski-in/ski-out access to Blackcomb with a more refined atmosphere than the main village.",
    highlights: [
      "Ski-in/ski-out access to Blackcomb Mountain",
      "Luxury accommodations and fine dining",
      "Quieter than Whistler Village",
      "Close to Blackcomb Excalibur Gondola",
    ],
    nearestLift: "Blackcomb Excalibur Gondola (2 min walk)",
    distanceToVillage: "5-minute walk to Whistler Village",
    elevation: "700m",
  },
  {
    id: "creekside",
    name: "Creekside",
    description:
      "Whistler's original village, located 2 km south of the main village. A laid-back, family-friendly neighborhood with its own gondola, grocery store, and local restaurants. Great value compared to the main village.",
    highlights: [
      "Own gondola access (Creekside Gondola)",
      "More affordable than Whistler Village",
      "Family-friendly atmosphere",
      "Local restaurants and Creekside Market",
    ],
    nearestLift: "Creekside Gondola (0-5 min walk)",
    distanceToVillage: "2 km south (free shuttle available)",
    elevation: "650m",
  },
  {
    id: "village-north",
    name: "Village North (Marketplace)",
    description:
      "Just north of the main village, Village North offers a good balance of convenience and value. Connected to the village by a short walk along the Valley Trail. Home to the Marketplace shopping area.",
    highlights: [
      "Short walk to Whistler Village",
      "Marketplace shops and dining",
      "Good value for proximity to lifts",
      "Access to Valley Trail for biking and walking",
    ],
    nearestLift: "Whistler Village Gondola (8 min walk)",
    distanceToVillage: "5-8 minute walk",
    elevation: "660m",
  },
  {
    id: "kadenwood",
    name: "Kadenwood",
    description:
      "An exclusive mountainside community above Creekside accessed by a private gondola. Ultra-luxury chalets with stunning views, privacy, and true ski-in/ski-out access. Whistler's most prestigious address.",
    highlights: [
      "Private gondola access",
      "Ultra-luxury chalets with panoramic views",
      "True ski-in/ski-out",
      "Maximum privacy and exclusivity",
    ],
    nearestLift: "Kadenwood Private Gondola (at doorstep)",
    distanceToVillage: "10 min drive or gondola + shuttle",
    elevation: "900m",
  },
  {
    id: "nordic",
    name: "Nordic Estates",
    description:
      "A peaceful residential neighborhood between the village and Creekside. Popular with families and long-term visitors who prefer a quieter setting. Good access to the Valley Trail and Lost Lake trails.",
    highlights: [
      "Quiet residential setting",
      "Close to Lost Lake trails and cross-country skiing",
      "Valley Trail access for biking",
      "Mid-range pricing",
    ],
    nearestLift: "Whistler Village Gondola (15 min walk or 5 min drive)",
    distanceToVillage: "1.5 km (15-minute walk or free shuttle)",
    elevation: "655m",
  },
  {
    id: "blueberry-hill",
    name: "Blueberry Hill",
    description:
      "A hillside neighborhood just above Whistler Village offering excellent views and a slightly elevated, peaceful setting. Walking distance to the village but feels removed from the hustle.",
    highlights: [
      "Elevated views of the valley and mountains",
      "Walking distance to Whistler Village",
      "Quieter than the village core",
      "Mix of condos and chalets",
    ],
    nearestLift: "Whistler Village Gondola (10 min walk)",
    distanceToVillage: "10-minute walk downhill",
    elevation: "720m",
  },
];

export function getNeighborhood(id: string): Neighborhood | undefined {
  return neighborhoods.find((n) => n.id === id);
}
