import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getProperty } from "../data/properties.js";

export function registerCompareTool(server: McpServer): void {
  server.registerTool(
    "compare_properties",
    {
      title: "Compare Properties",
      description:
        "Compare multiple properties side by side. Optionally include date-based pricing.",
      inputSchema: {
        propertyIds: z
          .array(z.string())
          .describe("Array of property IDs to compare (2-4 properties)"),
        checkIn: z
          .string()
          .optional()
          .describe("Optional check-in date for price calculation (YYYY-MM-DD)"),
        checkOut: z
          .string()
          .optional()
          .describe("Optional check-out date for price calculation (YYYY-MM-DD)"),
      },
    },
    async ({ propertyIds, checkIn, checkOut }) => {
      if (propertyIds.length < 2) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Please provide at least 2 property IDs to compare.",
            },
          ],
          isError: true,
        };
      }

      if (propertyIds.length > 4) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Please compare no more than 4 properties at a time.",
            },
          ],
          isError: true,
        };
      }

      const foundProperties = propertyIds.map((id) => ({
        id,
        property: getProperty(id),
      }));

      const missing = foundProperties.filter((f) => !f.property);
      if (missing.length > 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Property IDs not found: ${missing.map((m) => m.id).join(", ")}. Use search_properties to find valid IDs.`,
            },
          ],
          isError: true,
        };
      }

      const props = foundProperties.map((f) => f.property!);

      // Calculate nights if dates provided
      let nights: number | undefined;
      if (checkIn && checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        nights = Math.round(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      // Build comparison table
      const rows: { label: string; values: string[] }[] = [
        { label: "Name", values: props.map((p) => p.name) },
        {
          label: "Resource",
          values: props.map((p) => `whistler://properties/${p.id}`),
        },
        {
          label: "Type",
          values: props.map((p) => p.type),
        },
        {
          label: "Neighborhood",
          values: props.map((p) => p.neighborhood.replace(/-/g, " ")),
        },
        {
          label: "Bedrooms",
          values: props.map((p) => String(p.bedrooms)),
        },
        {
          label: "Bathrooms",
          values: props.map((p) => String(p.bathrooms)),
        },
        {
          label: "Max Guests",
          values: props.map((p) => String(p.maxGuests)),
        },
        {
          label: "Price/Night",
          values: props.map((p) => `$${p.pricePerNight} CAD`),
        },
        {
          label: "Cleaning Fee",
          values: props.map((p) => `$${p.cleaningFee} CAD`),
        },
      ];

      if (nights) {
        rows.push({
          label: `Total (${nights} nights)`,
          values: props.map(
            (p) =>
              `$${p.pricePerNight * nights! + p.cleaningFee} CAD`
          ),
        });

        // Check availability for each
        const start = new Date(checkIn!);
        const end = new Date(checkOut!);
        rows.push({
          label: "Available",
          values: props.map((p) => {
            const blocked = p.blockedDates.some((d) => {
              const bdate = new Date(d);
              return bdate >= start && bdate < end;
            });
            return blocked ? "No" : "Yes";
          }),
        });
      }

      rows.push(
        {
          label: "Rating",
          values: props.map(
            (p) => `${p.rating}/5 (${p.reviewCount} reviews)`
          ),
        },
        {
          label: "Ski-In/Ski-Out",
          values: props.map((p) => (p.skiInSkiOut ? "Yes" : "No")),
        },
        {
          label: "Pet-Friendly",
          values: props.map((p) => (p.petFriendly ? "Yes" : "No")),
        },
        {
          label: "Min Stay",
          values: props.map((p) => `${p.minimumStay} nights`),
        },
        {
          label: "Top Amenities",
          values: props.map((p) => p.amenities.slice(0, 5).join(", ")),
        }
      );

      // Format as markdown table
      const header =
        `| Feature | ${props.map((p) => p.id).join(" | ")} |`;
      const separator =
        `|---------|${props.map(() => "--------").join("|")}|`;
      const body = rows
        .map((r) => `| ${r.label} | ${r.values.join(" | ")} |`)
        .join("\n");

      const title = `## Property Comparison${nights ? ` (${checkIn} to ${checkOut}, ${nights} nights)` : ""}\n\n`;

      return {
        content: [
          {
            type: "text" as const,
            text: title + header + "\n" + separator + "\n" + body,
          },
        ],
      };
    }
  );
}
