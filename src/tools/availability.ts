import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getProperty } from "../data/properties.js";
import type { AvailabilityResult } from "../types.js";

export function registerAvailabilityTool(server: McpServer): void {
  server.registerTool(
    "check_availability",
    {
      title: "Check Availability",
      description:
        "Check if a specific property is available for given dates, and get a price estimate.",
      inputSchema: {
        propertyId: z
          .string()
          .describe("The property ID (e.g. 'wv-pan-pacific-205')"),
        checkIn: z.string().describe("Check-in date (ISO format YYYY-MM-DD)"),
        checkOut: z
          .string()
          .describe("Check-out date (ISO format YYYY-MM-DD)"),
      },
    },
    async ({ propertyId, checkIn, checkOut }) => {
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

      const start = new Date(checkIn);
      const end = new Date(checkOut);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Invalid date format. Please use YYYY-MM-DD format.",
            },
          ],
          isError: true,
        };
      }

      if (end <= start) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Check-out date must be after check-in date.",
            },
          ],
          isError: true,
        };
      }

      const nights = Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (nights < property.minimumStay) {
        return {
          content: [
            {
              type: "text" as const,
              text: `This property requires a minimum stay of ${property.minimumStay} nights. You requested ${nights} night${nights === 1 ? "" : "s"}.`,
            },
          ],
          isError: true,
        };
      }

      // Check for blocked dates
      const blockedInRange = property.blockedDates.filter((d) => {
        const blocked = new Date(d);
        return blocked >= start && blocked < end;
      });

      const available = blockedInRange.length === 0;

      // Apply seasonal pricing multiplier
      const seasonMultiplier = getSeasonMultiplier(start);
      const adjustedPrice = Math.round(
        property.pricePerNight * seasonMultiplier
      );

      const result: AvailabilityResult = {
        propertyId: property.id,
        propertyName: property.name,
        available,
        checkIn,
        checkOut,
        nights,
        pricePerNight: adjustedPrice,
        cleaningFee: property.cleaningFee,
        totalPrice: adjustedPrice * nights + property.cleaningFee,
        currency: "CAD",
      };

      if (available) {
        return {
          content: [
            {
              type: "text" as const,
              text: `## Availability: ${property.name}
**Resource:** whistler://properties/${property.id}

**Available!** This property is open for your requested dates.

| Detail | Value |
|--------|-------|
| Check-in | ${result.checkIn} |
| Check-out | ${result.checkOut} |
| Nights | ${result.nights} |
| Nightly Rate | $${result.pricePerNight} CAD${seasonMultiplier !== 1.0 ? ` (${getSeasonLabel(start)} rate)` : ""} |
| Cleaning Fee | $${result.cleaningFee} CAD |
| **Total** | **$${result.totalPrice} CAD** |

Minimum stay: ${property.minimumStay} nights`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text" as const,
              text: `## Availability: ${property.name}
**Resource:** whistler://properties/${property.id}

**Not Available.** This property has blocked dates that overlap with your request.

- Requested: ${checkIn} to ${checkOut} (${nights} nights)
- Conflicting dates: ${blockedInRange.join(", ")}

Consider adjusting your dates or searching for alternative properties.`,
            },
          ],
        };
      }
    }
  );
}

function getSeasonMultiplier(date: Date): number {
  const month = date.getMonth(); // 0-indexed
  // Peak winter (Dec-Feb): 1.2x
  if (month === 11 || month === 0 || month === 1) return 1.2;
  // Spring skiing (Mar-Apr): 1.0x
  if (month === 2 || month === 3) return 1.0;
  // Summer (Jun-Aug): 0.8x
  if (month >= 5 && month <= 7) return 0.8;
  // Shoulder (May, Sep-Nov): 0.7x
  return 0.7;
}

function getSeasonLabel(date: Date): string {
  const month = date.getMonth();
  if (month === 11 || month === 0 || month === 1) return "peak winter";
  if (month === 2 || month === 3) return "spring skiing";
  if (month >= 5 && month <= 7) return "summer";
  return "shoulder season";
}
