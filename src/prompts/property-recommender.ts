import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPropertyRecommenderPrompt(server: McpServer): void {
  server.registerPrompt(
    "recommend-property",
    {
      title: "Recommend a Property",
      description:
        "Get a personalized property recommendation based on your specific requirements.",
      argsSchema: {
        requirements: z
          .string()
          .describe(
            "Describe what you're looking for in natural language (e.g. 'A cozy ski-in/ski-out condo for 4 people with a hot tub')"
          ),
        checkIn: z
          .string()
          .optional()
          .describe("Optional check-in date (YYYY-MM-DD)"),
        checkOut: z
          .string()
          .optional()
          .describe("Optional check-out date (YYYY-MM-DD)"),
      },
    },
    async ({ requirements, checkIn, checkOut }) => {
      const dateContext =
        checkIn && checkOut
          ? `\n- **Dates:** ${checkIn} to ${checkOut}`
          : "\n- **Dates:** Flexible (no specific dates provided)";

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `I need help finding the perfect Whistler vacation rental. Here's what I'm looking for:

## Requirements
- **Description:** ${requirements}${dateContext}

## What to Do
1. **Parse my requirements** to identify key filters: number of bedrooms, budget constraints, must-have amenities (ski-in/ski-out, pet-friendly, hot tub, etc.), preferred neighborhood, and property type.

2. **Search** using the search_properties tool with appropriate filters. If the first search is too narrow, try broadening the criteria.

3. **Check availability** for the top results if dates were provided, using the check_availability tool.

4. **Recommend your top pick** with a clear explanation of why it's the best match. Include:
   - Full property details (use get_property_details)
   - Price breakdown for the stay
   - What makes it a great fit for my requirements
   - Any trade-offs or things to be aware of

5. **Offer alternatives** — show 1-2 backup options in case the top pick doesn't work out, and compare them using compare_properties.

Please use the available tools to search, check, and compare actual listings.`,
            },
          },
        ],
      };
    }
  );
}
