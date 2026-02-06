#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Tools
import { registerSearchTool } from "./tools/search.js";
import { registerDetailsTool } from "./tools/details.js";
import { registerAvailabilityTool } from "./tools/availability.js";
import { registerCompareTool } from "./tools/compare.js";

// Resources
import { registerListingsResources } from "./resources/listings.js";
import { registerAreaGuideResources } from "./resources/area-guide.js";
import { registerPlatformsResources } from "./resources/platforms.js";

// Prompts
import { registerTripPlannerPrompt } from "./prompts/trip-planner.js";
import { registerPropertyRecommenderPrompt } from "./prompts/property-recommender.js";

const server = new McpServer(
  {
    name: "whistler-vacation-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      logging: {},
    },
    instructions:
      "Whistler Vacation Rental search server. Use the tools to search properties, check availability, get details, and compare options. Resources provide property listings and area guides. Prompts help plan trips and get recommendations.",
  }
);

// Register all tools
registerSearchTool(server);
registerDetailsTool(server);
registerAvailabilityTool(server);
registerCompareTool(server);

// Register all resources
registerListingsResources(server);
registerAreaGuideResources(server);
registerPlatformsResources(server);

// Register all prompts
registerTripPlannerPrompt(server);
registerPropertyRecommenderPrompt(server);

// Connect via stdio transport
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Whistler Vacation MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
