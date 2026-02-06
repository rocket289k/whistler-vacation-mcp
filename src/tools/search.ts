import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { properties } from "../data/properties.js";
import type { Property } from "../types.js";

export function registerSearchTool(server: McpServer): void {
  server.registerTool(
    "search_properties",
    {
      title: "Search Properties",
      description:
        "Search for vacation rental properties in Whistler, BC. Filter by location, dates, bedrooms, price, amenities, and more.",
      inputSchema: {
        location: z
          .string()
          .optional()
          .describe(
            "Neighborhood or area (e.g. 'whistler-village', 'upper-village', 'creekside')"
          ),
        checkIn: z
          .string()
          .optional()
          .describe("Check-in date (ISO format YYYY-MM-DD)"),
        checkOut: z
          .string()
          .optional()
          .describe("Check-out date (ISO format YYYY-MM-DD)"),
        minBedrooms: z
          .number()
          .optional()
          .describe("Minimum number of bedrooms"),
        maxPrice: z
          .number()
          .optional()
          .describe("Maximum price per night in CAD"),
        skiInSkiOut: z
          .boolean()
          .optional()
          .describe("Filter for ski-in/ski-out properties only"),
        petFriendly: z
          .boolean()
          .optional()
          .describe("Filter for pet-friendly properties only"),
        amenities: z
          .array(z.string())
          .optional()
          .describe(
            "Required amenities (e.g. ['hot-tub', 'fireplace', 'pool'])"
          ),
        propertyType: z
          .string()
          .optional()
          .describe("Property type: condo, chalet, townhouse, or cabin"),
        sortBy: z
          .enum(["price_asc", "price_desc", "rating", "bedrooms"])
          .optional()
          .describe("Sort results by: price_asc, price_desc, rating, or bedrooms"),
      },
    },
    async ({
      location,
      checkIn,
      checkOut,
      minBedrooms,
      maxPrice,
      skiInSkiOut,
      petFriendly,
      amenities,
      propertyType,
      sortBy,
    }) => {
      let results = [...properties];

      // Filter by neighborhood
      if (location) {
        const loc = location.toLowerCase();
        results = results.filter(
          (p) =>
            p.neighborhood.toLowerCase().includes(loc) ||
            p.neighborhood.toLowerCase().replace(/-/g, " ").includes(loc)
        );
      }

      // Filter by date availability
      if (checkIn && checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        results = results.filter((p) => {
          return !p.blockedDates.some((d) => {
            const blocked = new Date(d);
            return blocked >= start && blocked < end;
          });
        });
      }

      // Filter by bedrooms
      if (minBedrooms !== undefined) {
        results = results.filter((p) => p.bedrooms >= minBedrooms);
      }

      // Filter by price
      if (maxPrice !== undefined) {
        results = results.filter((p) => p.pricePerNight <= maxPrice);
      }

      // Filter by ski-in/ski-out
      if (skiInSkiOut === true) {
        results = results.filter((p) => p.skiInSkiOut);
      }

      // Filter by pet-friendly
      if (petFriendly === true) {
        results = results.filter((p) => p.petFriendly);
      }

      // Filter by amenities
      if (amenities && amenities.length > 0) {
        results = results.filter((p) =>
          amenities.every((a) =>
            p.amenities.some(
              (pa) => pa.toLowerCase() === a.toLowerCase()
            )
          )
        );
      }

      // Filter by property type
      if (propertyType) {
        results = results.filter(
          (p) => p.type.toLowerCase() === propertyType.toLowerCase()
        );
      }

      // Sort
      if (sortBy) {
        results.sort((a, b) => {
          switch (sortBy) {
            case "price_asc":
              return a.pricePerNight - b.pricePerNight;
            case "price_desc":
              return b.pricePerNight - a.pricePerNight;
            case "rating":
              return b.rating - a.rating;
            case "bedrooms":
              return b.bedrooms - a.bedrooms;
            default:
              return 0;
          }
        });
      } else {
        // Default sort: by rating descending
        results.sort((a, b) => b.rating - a.rating);
      }

      // Calculate nights and total if dates provided
      let nights: number | undefined;
      if (checkIn && checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        nights = Math.round(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      // Format results
      const formatted = results.map((p) => formatPropertySummary(p, nights));

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No properties found matching your criteria. Try adjusting your filters (fewer amenities, higher price range, or different dates).",
            },
          ],
        };
      }

      const header = `Found ${results.length} propert${results.length === 1 ? "y" : "ies"} in Whistler${location ? ` (${location})` : ""}${nights ? ` for ${nights} night${nights === 1 ? "" : "s"}` : ""}:\n\n`;

      return {
        content: [
          {
            type: "text" as const,
            text: header + formatted.join("\n---\n"),
          },
        ],
      };
    }
  );
}

function formatPropertySummary(
  p: Property,
  nights?: number
): string {
  const total = nights
    ? `$${p.pricePerNight * nights + p.cleaningFee} CAD total (${nights} nights)`
    : "";
  const tags: string[] = [];
  if (p.skiInSkiOut) tags.push("Ski-In/Ski-Out");
  if (p.petFriendly) tags.push("Pet-Friendly");
  if (p.host.superhost) tags.push("Superhost");

  return `**${p.name}** (${p.id})
Resource: whistler://properties/${p.id}
Type: ${p.type} | ${p.bedrooms} BR / ${p.bathrooms} BA | Up to ${p.maxGuests} guests
Location: ${p.neighborhood.replace(/-/g, " ")}
Price: $${p.pricePerNight} CAD/night + $${p.cleaningFee} cleaning fee${total ? " | " + total : ""}
Rating: ${p.rating}/5 (${p.reviewCount} reviews)
${tags.length > 0 ? "Tags: " + tags.join(", ") + "\n" : ""}Top amenities: ${p.amenities.slice(0, 6).join(", ")}`;
}
