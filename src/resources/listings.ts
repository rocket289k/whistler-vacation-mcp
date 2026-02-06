import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { properties, getProperty } from "../data/properties.js";

export function registerListingsResources(server: McpServer): void {
  // Static resource: all properties summary
  server.registerResource(
    "all-properties",
    "whistler://properties",
    {
      title: "All Whistler Properties",
      description: "Summary listing of all available vacation rental properties in Whistler",
      mimeType: "application/json",
    },
    async (uri) => {
      const summary = properties.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        neighborhood: p.neighborhood,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        maxGuests: p.maxGuests,
        pricePerNight: p.pricePerNight,
        rating: p.rating,
        skiInSkiOut: p.skiInSkiOut,
        petFriendly: p.petFriendly,
      }));

      return {
        contents: [
          {
            uri: uri.toString(),
            text: JSON.stringify(summary, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    }
  );

  // Resource template: individual property details
  const propertyTemplate = new ResourceTemplate(
    "whistler://properties/{id}",
    {
      list: async () => ({
        resources: properties.map((p) => ({
          uri: `whistler://properties/${p.id}`,
          name: p.name,
          description: `${p.type} in ${p.neighborhood.replace(/-/g, " ")} — ${p.bedrooms} BR, $${p.pricePerNight}/night`,
          mimeType: "application/json",
        })),
      }),
      complete: {
        id: async (value) =>
          properties
            .filter((p) =>
              p.id.toLowerCase().startsWith(value.toLowerCase())
            )
            .map((p) => p.id),
      },
    }
  );

  server.registerResource(
    "property-detail",
    propertyTemplate,
    {
      title: "Property Detail",
      description: "Full details for a specific Whistler vacation rental property",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
      const property = getProperty(id);

      if (!property) {
        return {
          contents: [
            {
              uri: uri.toString(),
              text: JSON.stringify({ error: `Property not found: ${id}` }),
              mimeType: "application/json",
            },
          ],
        };
      }

      return {
        contents: [
          {
            uri: uri.toString(),
            text: JSON.stringify(property, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    }
  );
}
