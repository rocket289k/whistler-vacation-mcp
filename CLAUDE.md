# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Whistler Vacation Rental MCP Server — a Model Context Protocol server that enables AI assistants to search, compare, and recommend vacation rental properties in Whistler, BC. Built with TypeScript, `@modelcontextprotocol/sdk`, and `zod`.

## Build & Run

```bash
npm run build       # Compile TypeScript (npx tsc)
npm start           # Run the server (node build/index.js)
npm run dev         # Watch mode (tsc --watch)
```

## Test

```bash
# MCP Inspector (interactive browser UI)
npx @modelcontextprotocol/inspector node build/index.js

# Quick protocol test
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node build/index.js
```

## Project Structure

```
src/
  index.ts                    -- Entry point: server setup, registration, stdio transport
  types.ts                    -- TypeScript interfaces (Property, Neighborhood, Platform, etc.)
  data/
    properties.ts             -- 18 sample Whistler properties + getProperty() helper
    neighborhoods.ts          -- 7 neighborhoods + getNeighborhood() helper
    platforms.ts              -- 5 real booking platforms + getPlatform() helper
  tools/
    search.ts                 -- search_properties (10 filter params, sorting)
    details.ts                -- get_property_details (by ID)
    availability.ts           -- check_availability (dates, seasonal pricing)
    compare.ts                -- compare_properties (side-by-side table)
  resources/
    listings.ts               -- whistler://properties + whistler://properties/{id}
    area-guide.ts             -- whistler://area-guide + whistler://neighborhoods/{id}
    platforms.ts              -- whistler://platforms + whistler://platforms/{id}
  prompts/
    trip-planner.ts           -- plan-whistler-trip prompt
    property-recommender.ts   -- recommend-property prompt
specs/                        -- Requirements, architecture, data model, API reference
project/
  history/                    -- Change logs (yyyy-mm-dd - Description.md)
```

## Key Patterns

- **Modular registration:** Each module exports a `register*` function that takes `McpServer`
- **Zod schemas:** Tool/prompt parameters defined as `{ field: z.string().describe("...") }`
- **Stdio transport:** stdout is MCP protocol — use `console.error` for logging
- **Resource deep-links:** All tool results include `whistler://properties/{id}` URIs

## Dependencies

- Runtime: `@modelcontextprotocol/sdk` (v1.26.0), `zod` (v4.3.6)
- Dev: `typescript` (v5.9.3), `@types/node`

## Development Environment

- Platform: Windows (PowerShell / Git Bash)
- Always adhere to best practices — no shortcuts, even when a quick fix seems easier
- Fix CI failures immediately before moving on to other work

## Change History

After every significant change (specs change, bug fix, build, etc.), create a log file in the `/project/history` folder documenting what, why, problems encountered, and how it was resolved. Use the format: `yyyy-mm-dd - Task Description.md`
