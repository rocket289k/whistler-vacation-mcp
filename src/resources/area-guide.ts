import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { neighborhoods, getNeighborhood } from "../data/neighborhoods.js";

export function registerAreaGuideResources(server: McpServer): void {
  // Static resource: Whistler area guide
  server.registerResource(
    "area-guide",
    "whistler://area-guide",
    {
      title: "Whistler Area Guide",
      description:
        "A comprehensive guide to Whistler, BC — neighborhoods, skiing, dining, and tips",
      mimeType: "text/markdown",
    },
    async (uri) => {
      const guide = `# Whistler, BC — Vacation Rental Area Guide

## Overview
Whistler is a world-renowned resort town located 125 km north of Vancouver, British Columbia. Home to North America's largest ski resort (Whistler Blackcomb), it attracts over 3 million visitors annually for skiing, snowboarding, mountain biking, hiking, and more.

## Quick Facts
- **Location:** Sea-to-Sky corridor, 125 km north of Vancouver
- **Elevation:** Village at 675m, peak at 2,284m (Whistler Mountain)
- **Ski Season:** Late November to late May (conditions permitting)
- **Summer Season:** June to September
- **Ski Area:** 8,171 acres across Whistler and Blackcomb mountains
- **Annual Snowfall:** Average 11.7 meters (38.4 feet)

## Getting There
- **Drive:** ~1.5 hours from Vancouver via the Sea-to-Sky Highway (Hwy 99)
- **Bus:** Epic Rides, Whistler Shuttles, and BC Transit operate routes from Vancouver
- **Fly:** Nearest airport is Vancouver International (YVR)

## Neighborhoods
${neighborhoods
  .map(
    (n) => `### ${n.name}
${n.description}
- **Nearest Lift:** ${n.nearestLift}
- **Distance to Village:** ${n.distanceToVillage}
`
  )
  .join("\n")}

## Skiing & Snowboarding
- **Whistler Mountain:** 100+ marked runs, 3 glaciers, expert terrain at the top, beginner/intermediate lower down
- **Blackcomb Mountain:** 100+ marked runs, the famous Blackcomb Glacier, steep couloirs, and family-friendly green runs
- **Peak 2 Peak Gondola:** Connects the two mountains — 4.4 km span, 436m above the valley
- **Lift Ticket (2025/26):** ~$90-$230 CAD/day depending on date and advance purchase

## Dining Highlights
- **Fine Dining:** Araxi, Bearfoot Bistro, Il Caminetto, Rim Rock Cafe
- **Casual:** Splitz Grill (burgers), Peaked Pies (Aussie pies), Purebread (bakery)
- **Après-Ski:** GLC, Merlin's, Longhorn Saloon, Garibaldi Lift Co.

## Summer Activities
- Mountain biking (Whistler Bike Park), hiking, zip-lining, golf, canoeing on Alta Lake, bungee jumping, ATV tours, bear viewing

## Tips for Visitors
1. Book accommodation 3-6 months in advance for peak winter dates
2. The free village shuttle connects all major neighborhoods
3. Grocery stores: Whistler Marketplace IGA, Creekside Market, Fresh St. Market
4. Rent ski gear in advance online for discounts (20-30% off walk-in rates)
5. Consider shoulder season (early Dec, late Apr) for fewer crowds and lower prices
`;

      return {
        contents: [
          {
            uri: uri.toString(),
            text: guide,
            mimeType: "text/markdown",
          },
        ],
      };
    }
  );

  // Resource template: individual neighborhood details
  const neighborhoodTemplate = new ResourceTemplate(
    "whistler://neighborhoods/{id}",
    {
      list: async () => ({
        resources: neighborhoods.map((n) => ({
          uri: `whistler://neighborhoods/${n.id}`,
          name: n.name,
          description: n.description.slice(0, 100) + "...",
          mimeType: "text/markdown",
        })),
      }),
      complete: {
        id: async (value) =>
          neighborhoods
            .filter((n) =>
              n.id.toLowerCase().startsWith(value.toLowerCase())
            )
            .map((n) => n.id),
      },
    }
  );

  server.registerResource(
    "neighborhood-detail",
    neighborhoodTemplate,
    {
      title: "Neighborhood Detail",
      description: "Detailed info about a specific Whistler neighborhood",
      mimeType: "text/markdown",
    },
    async (uri, variables) => {
      const id = Array.isArray(variables.id)
        ? variables.id[0]
        : variables.id;
      const neighborhood = getNeighborhood(id);

      if (!neighborhood) {
        return {
          contents: [
            {
              uri: uri.toString(),
              text: `Neighborhood not found: ${id}. Available: ${neighborhoods.map((n) => n.id).join(", ")}`,
              mimeType: "text/plain",
            },
          ],
        };
      }

      const detail = `# ${neighborhood.name}

${neighborhood.description}

## Highlights
${neighborhood.highlights.map((h) => `- ${h}`).join("\n")}

## Access
- **Nearest Lift:** ${neighborhood.nearestLift}
- **Distance to Village:** ${neighborhood.distanceToVillage}
- **Elevation:** ${neighborhood.elevation}
`;

      return {
        contents: [
          {
            uri: uri.toString(),
            text: detail,
            mimeType: "text/markdown",
          },
        ],
      };
    }
  );
}
