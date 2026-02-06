# Whistler Vacation Rental MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that lets AI assistants search, compare, and recommend vacation rental properties in Whistler, BC.

Inspired by the [MountVacation MCP server](https://medium.com/@talirezun/how-i-built-an-ai-powered-vacation-mcp-search-tool-in-14-days-and-why-you-should-care-128e09bf6bd0) by Dr. Tali Rezun.

## What It Does

Ask your AI assistant things like:

- "Find me a 2-bedroom ski-in/ski-out condo in Whistler for March 15-20"
- "Compare the top 3 ski-in/ski-out properties in Upper Village"
- "Plan a luxury winter trip for 4 people with a $600/night budget"
- "Where should I book a Whistler rental — what platforms are available?"

The server provides **4 tools**, **6 resources**, and **2 prompts** backed by 18 sample Whistler properties across 7 neighborhoods, plus info on 5 real booking platforms.

## Setup

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- npm

### Install & Build

```bash
cd vacation
npm install
npm run build
```

### Configure Claude Desktop

Add to your Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json` on Windows, `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "whistler-vacation": {
      "command": "node",
      "args": ["C:/BigBrain/vacation/build/index.js"]
    }
  }
}
```

Restart Claude Desktop. You should see the hammer icon with 4 tools available.

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

Opens a browser UI where you can interactively test all tools, resources, and prompts.

## Tools

| Tool | Description |
|------|-------------|
| `search_properties` | Search with filters: location, dates, bedrooms, price, ski-in/ski-out, pet-friendly, amenities, property type, sort order |
| `get_property_details` | Full details for a property by ID |
| `check_availability` | Check date availability + price estimate with seasonal pricing |
| `compare_properties` | Side-by-side comparison table for 2-4 properties |

## Resources

| URI | Description |
|-----|-------------|
| `whistler://properties` | JSON summary of all 18 properties |
| `whistler://properties/{id}` | Full detail for one property |
| `whistler://area-guide` | Comprehensive Whistler area guide |
| `whistler://neighborhoods/{id}` | Detail for a specific neighborhood |
| `whistler://platforms` | Guide to real Whistler booking platforms |
| `whistler://platforms/{id}` | Detail for a specific booking platform |

## Prompts

| Prompt | Parameters | Description |
|--------|------------|-------------|
| `plan-whistler-trip` | groupSize, season, budget, interests | Generates a full trip planning prompt |
| `recommend-property` | requirements, checkIn?, checkOut? | Generates a property recommendation prompt |

## Sample Data

**18 properties** across 7 neighborhoods:

| Neighborhood | Properties | Highlights |
|-------------|-----------|------------|
| Whistler Village | 4 | Village core, gondola access, ski-in/ski-out options |
| Upper Village | 3 | Blackcomb base, luxury ski-in/ski-out |
| Creekside | 3 | Family-friendly, value-oriented |
| Village North | 2 | Budget-friendly, shuttle access |
| Kadenwood | 2 | Ultra-luxury chalets, private gondola |
| Nordic | 2 | Cabins, cross-country skiing, pet-friendly |
| Blueberry Hill | 2 | Mountain views, walking distance to village |

**Price range:** $150-$1,500 CAD/night

**5 real booking platforms:** AlluraDirect, Whistler Platinum, Whistler.com, Blackcomb Peaks, Whistler Blackcomb (Vail Resorts)

## Project Structure

```
src/
  index.ts              Entry point
  types.ts              TypeScript interfaces
  data/
    properties.ts       18 sample properties
    neighborhoods.ts    7 neighborhoods
    platforms.ts        5 booking platforms
  tools/
    search.ts           search_properties
    details.ts          get_property_details
    availability.ts     check_availability
    compare.ts          compare_properties
  resources/
    listings.ts         Property resources
    area-guide.ts       Area guide + neighborhood resources
    platforms.ts        Platform resources
  prompts/
    trip-planner.ts     plan-whistler-trip
    property-recommender.ts  recommend-property
specs/                  Requirements, architecture, data model, API reference
project/history/        Change logs
```

## Development

```bash
npm run build    # Compile TypeScript
npm start        # Run server
npm run dev      # Watch mode
```

## Tech Stack

- **TypeScript** with ES modules
- **@modelcontextprotocol/sdk** v1.26.0 — MCP server framework
- **zod** v4.3.6 — Schema validation for tool/prompt parameters
- **Stdio transport** — Compatible with Claude Desktop, Claude Code, and MCP Inspector
