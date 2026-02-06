import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getProperty } from "../data/properties.js";
import { getNeighborhood } from "../data/neighborhoods.js";

export function registerDetailsTool(server: McpServer): void {
  server.registerTool(
    "get_property_details",
    {
      title: "Get Property Details",
      description:
        "Get full details for a specific vacation rental property by its ID.",
      inputSchema: {
        propertyId: z
          .string()
          .describe("The property ID (e.g. 'wv-pan-pacific-205')"),
      },
    },
    async ({ propertyId }) => {
      const property = getProperty(propertyId);

      if (!property) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Property not found: "${propertyId}". Use the search_properties tool to find valid property IDs.`,
            },
          ],
          isError: true,
        };
      }

      const neighborhood = getNeighborhood(property.neighborhood);

      const tags: string[] = [];
      if (property.skiInSkiOut) tags.push("Ski-In/Ski-Out");
      if (property.petFriendly) tags.push("Pet-Friendly");
      if (property.host.superhost) tags.push("Superhost");

      const details = `# ${property.name}
**ID:** ${property.id}
**Resource:** whistler://properties/${property.id}
**Type:** ${property.type}
**Location:** ${property.neighborhood.replace(/-/g, " ")}${neighborhood ? ` — ${neighborhood.nearestLift}` : ""}

## Description
${property.description}

## Property Details
- **Bedrooms:** ${property.bedrooms}
- **Bathrooms:** ${property.bathrooms}
- **Max Guests:** ${property.maxGuests}
- **Minimum Stay:** ${property.minimumStay} nights

## Pricing
- **Nightly Rate:** $${property.pricePerNight} CAD
- **Cleaning Fee:** $${property.cleaningFee} CAD

## Amenities
${property.amenities.map((a) => `- ${a}`).join("\n")}

## Ratings & Reviews
- **Rating:** ${property.rating}/5 (${property.reviewCount} reviews)

## Host
- **Name:** ${property.host.name}
- **Superhost:** ${property.host.superhost ? "Yes" : "No"}

## Tags
${tags.length > 0 ? tags.join(", ") : "None"}

## Availability
- **Seasons:** ${property.availableSeasons.join(", ")}
- **Blocked Dates:** ${property.blockedDates.length > 0 ? property.blockedDates.join(", ") : "None — fully available"}

## Location
- **Coordinates:** ${property.coordinates.lat}, ${property.coordinates.lng}
${neighborhood ? `\n## Neighborhood: ${neighborhood.name}\n${neighborhood.description}\n- Distance to village: ${neighborhood.distanceToVillage}` : ""}`;

      return {
        content: [{ type: "text" as const, text: details }],
      };
    }
  );
}
