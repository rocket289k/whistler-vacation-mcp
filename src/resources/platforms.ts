import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { platforms, getPlatform } from "../data/platforms.js";

export function registerPlatformsResources(server: McpServer): void {
  // Static resource: all platforms overview
  server.registerResource(
    "platforms",
    "whistler://platforms",
    {
      title: "Whistler Booking Platforms",
      description:
        "Guide to real Whistler vacation rental booking platforms — alternatives to Airbnb/VRBO",
      mimeType: "text/markdown",
    },
    async (uri) => {
      const guide = `# Whistler Vacation Rental Booking Platforms

Real platforms where you can book Whistler vacation rentals, beyond the usual Airbnb and VRBO.

| Platform | Properties | Best For | Key Strength |
|----------|-----------|----------|--------------|
${platforms.map((p) => `| [${p.name}](${p.url}) | ${p.propertyCount} | ${p.bestFor} | ${p.keyStrengths[0]} |`).join("\n")}

---

${platforms
  .map(
    (p) => `## ${p.name}
${p.description}

- **Website:** ${p.url}
- **Whistler Properties:** ${p.propertyCount}
- **Fees/Notes:** ${p.feeNotes}
- **Whistler Focus:** ${p.whistlerFocus}
- **Best For:** ${p.bestFor}

**Key Strengths:**
${p.keyStrengths.map((s) => `- ${s}`).join("\n")}
`
  )
  .join("\n---\n\n")}

---

## Tips for Choosing a Platform
1. **Direct booking** with local managers (Whistler Platinum, Blackcomb Peaks) often saves 10-15% vs Airbnb/VRBO
2. **AlluraDirect** is the best budget option with the lowest fees
3. **Whistler.com** is the safest bet for first-time visitors — verified and official
4. **Blackcomb Peaks** is the go-to for ski-in/ski-out — 90+ options
5. **Whistler Blackcomb** is ideal if you want lift tickets bundled with lodging
6. Always compare the same property across platforms — some list on multiple sites at different prices
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

  // Resource template: individual platform details
  const platformTemplate = new ResourceTemplate(
    "whistler://platforms/{id}",
    {
      list: async () => ({
        resources: platforms.map((p) => ({
          uri: `whistler://platforms/${p.id}`,
          name: p.name,
          description: `${p.propertyCount} properties — ${p.bestFor}`,
          mimeType: "application/json",
        })),
      }),
      complete: {
        id: async (value) =>
          platforms
            .filter((p) =>
              p.id.toLowerCase().startsWith(value.toLowerCase())
            )
            .map((p) => p.id),
      },
    }
  );

  server.registerResource(
    "platform-detail",
    platformTemplate,
    {
      title: "Platform Detail",
      description: "Detailed info about a specific Whistler booking platform",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const id = Array.isArray(variables.id)
        ? variables.id[0]
        : variables.id;
      const platform = getPlatform(id);

      if (!platform) {
        return {
          contents: [
            {
              uri: uri.toString(),
              text: JSON.stringify({
                error: `Platform not found: ${id}`,
                available: platforms.map((p) => p.id),
              }),
              mimeType: "application/json",
            },
          ],
        };
      }

      return {
        contents: [
          {
            uri: uri.toString(),
            text: JSON.stringify(platform, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    }
  );
}
