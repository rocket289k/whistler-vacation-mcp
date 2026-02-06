import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerTripPlannerPrompt(server: McpServer): void {
  server.registerPrompt(
    "plan-whistler-trip",
    {
      title: "Plan a Whistler Trip",
      description:
        "Get a personalized Whistler vacation plan based on your group size, season, budget, and interests.",
      argsSchema: {
        groupSize: z
          .string()
          .describe("Number of people in your group (e.g. '2', '4', 'family of 5')"),
        season: z
          .enum(["winter", "spring", "summer", "fall"])
          .describe("What season are you visiting?"),
        budget: z
          .enum(["budget", "moderate", "luxury"])
          .describe("Your accommodation budget level"),
        interests: z
          .string()
          .describe(
            "What activities interest you? (e.g. 'skiing, dining, spa' or 'mountain biking, hiking')"
          ),
      },
    },
    async ({ groupSize, season, budget, interests }) => {
      const budgetRange =
        budget === "budget"
          ? "$150-$300 CAD/night"
          : budget === "moderate"
            ? "$300-$600 CAD/night"
            : "$600-$1500 CAD/night";

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `I'm planning a trip to Whistler, BC and need your help finding the perfect vacation rental and building an itinerary.

## My Trip Details
- **Group Size:** ${groupSize}
- **Season:** ${season}
- **Budget:** ${budget} (${budgetRange})
- **Interests:** ${interests}

## What I Need
1. **Property Recommendations:** Use the search_properties tool to find 3-5 properties that match my group size, budget, and preferences. Consider whether I need ski-in/ski-out access, pet-friendly options, or specific amenities based on my interests.

2. **Comparison:** Use compare_properties to create a side-by-side comparison of your top picks.

3. **Itinerary Suggestions:** Based on the season and my interests, suggest a day-by-day itinerary including:
   - Activities and excursions
   - Restaurant recommendations
   - Tips specific to the season

4. **Neighborhood Guide:** Which Whistler neighborhood would be best for my group? Use the area guide resources to explain why.

Please be specific with property recommendations and use the available tools to search and compare actual listings.`,
            },
          },
        ],
      };
    }
  );
}
