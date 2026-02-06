# Architecture

## 1. System Overview

The Whistler Vacation MCP Server is a single-process Node.js application that communicates with AI clients via the Model Context Protocol over stdio. It has no external dependencies at runtime — all data is embedded in the application.

```
┌─────────────────────┐       stdio        ┌──────────────────────────┐
│   MCP Client        │◄──────────────────►│   Whistler MCP Server    │
│  (Claude Desktop,   │   JSON-RPC 2.0     │                          │
│   Claude Code,      │                    │  ┌─────────────────────┐ │
│   MCP Inspector)    │                    │  │    McpServer         │ │
│                     │                    │  │  (SDK framework)     │ │
│                     │                    │  └──────┬──────────────┘ │
│                     │                    │         │ registers      │
│                     │                    │  ┌──────┴──────────────┐ │
│                     │                    │  │ Tools  Resources    │ │
│                     │                    │  │ Prompts             │ │
│                     │                    │  └──────┬──────────────┘ │
│                     │                    │         │ queries        │
│                     │                    │  ┌──────┴──────────────┐ │
│                     │                    │  │ In-Memory Data      │ │
│                     │                    │  │ (properties,        │ │
│                     │                    │  │  neighborhoods,     │ │
│                     │                    │  │  platforms)          │ │
│                     │                    │  └─────────────────────┘ │
└─────────────────────┘                    └──────────────────────────┘
```

## 2. Module Structure

```
src/
├── index.ts                 ← Entry point: creates server, registers all modules, connects transport
├── types.ts                 ← Shared TypeScript interfaces (no runtime code)
├── data/                    ← Static data layer
│   ├── properties.ts        ← Property[] array + getProperty() lookup
│   ├── neighborhoods.ts     ← Neighborhood[] array + getNeighborhood() lookup
│   └── platforms.ts         ← Platform[] array + getPlatform() lookup
├── tools/                   ← MCP tool handlers
│   ├── search.ts            ← registerSearchTool(server)
│   ├── details.ts           ← registerDetailsTool(server)
│   ├── availability.ts      ← registerAvailabilityTool(server)
│   └── compare.ts           ← registerCompareTool(server)
├── resources/               ← MCP resource handlers
│   ├── listings.ts          ← registerListingsResources(server)
│   ├── area-guide.ts        ← registerAreaGuideResources(server)
│   └── platforms.ts         ← registerPlatformsResources(server)
└── prompts/                 ← MCP prompt handlers
    ├── trip-planner.ts      ← registerTripPlannerPrompt(server)
    └── property-recommender.ts ← registerPropertyRecommenderPrompt(server)
```

## 3. Registration Pattern

Every module exports a single `register*` function that takes an `McpServer` instance and calls `server.registerTool()`, `server.registerResource()`, or `server.registerPrompt()`. This pattern:

- Keeps each MCP capability in its own file
- Avoids circular dependencies (data flows one way: data → tools/resources/prompts)
- Makes it easy to add or remove capabilities without touching other modules
- Keeps `index.ts` clean — just imports and registration calls

```typescript
// Pattern used by all modules:
export function registerSearchTool(server: McpServer): void {
  server.registerTool("search_properties", { ... }, async (args) => { ... });
}
```

## 4. Data Flow

### 4.1 Tool Call Flow

```
Client                     Server
  │                          │
  │  tools/call              │
  │  { name, arguments }     │
  │ ─────────────────────►   │
  │                          │  1. SDK deserializes JSON-RPC
  │                          │  2. SDK validates args against Zod schema
  │                          │  3. Handler function executes:
  │                          │     a. Queries in-memory data arrays
  │                          │     b. Applies filters/logic
  │                          │     c. Formats markdown/text response
  │                          │  4. Returns { content: [{ type: "text", text }] }
  │                          │
  │  ◄─────────────────────  │
  │  { content, isError? }   │
```

### 4.2 Resource Read Flow

```
Client                     Server
  │                          │
  │  resources/read          │
  │  { uri }                 │
  │ ─────────────────────►   │
  │                          │  1. SDK matches URI to registered resource/template
  │                          │  2. For templates: extracts variables from URI
  │                          │  3. Handler function executes:
  │                          │     a. Looks up data by ID (templates) or returns all (static)
  │                          │     b. Formats as JSON or markdown
  │                          │  4. Returns { contents: [{ uri, text, mimeType }] }
  │                          │
  │  ◄─────────────────────  │
  │  { contents }            │
```

### 4.3 Prompt Flow

```
Client                     Server
  │                          │
  │  prompts/get             │
  │  { name, arguments }     │
  │ ─────────────────────►   │
  │                          │  1. SDK validates args against Zod schema
  │                          │  2. Handler builds structured prompt text
  │                          │  3. Returns { messages: [{ role, content }] }
  │                          │
  │  ◄─────────────────────  │
  │  { messages }            │  Client uses messages as conversation starter
```

## 5. Data Layer

All data is stored as in-memory TypeScript arrays. No database, filesystem, or network I/O.

| Data Set | File | Records | Lookup Helper |
|----------|------|---------|---------------|
| Properties | `data/properties.ts` | 18 | `getProperty(id)` |
| Neighborhoods | `data/neighborhoods.ts` | 7 | `getNeighborhood(id)` |
| Platforms | `data/platforms.ts` | 5 | `getPlatform(id)` |

Lookup helpers return `T | undefined` (not found = undefined).

## 6. Transport Layer

The server uses `StdioServerTransport` from the MCP SDK:

- **stdin**: Receives JSON-RPC 2.0 requests from the client
- **stdout**: Sends JSON-RPC 2.0 responses to the client
- **stderr**: Application logging (`console.error`)

This is the standard transport for local MCP servers used by Claude Desktop and Claude Code.

## 7. Schema Validation

Tool and prompt parameters are defined using Zod v4 schemas. The MCP SDK automatically:

1. Converts Zod schemas to JSON Schema for the `tools/list` response
2. Validates incoming arguments against the Zod schema before calling the handler
3. Provides autocomplete support for resource template variables

```typescript
// Example: Zod schema → JSON Schema conversion is handled by the SDK
inputSchema: {
  location: z.string().optional().describe("Neighborhood or area"),
  minBedrooms: z.number().optional().describe("Minimum bedrooms"),
}
// Becomes JSON Schema with type, description, and required fields
```

## 8. Error Handling Strategy

- **Invalid IDs**: Return `{ content: [...], isError: true }` with a helpful message pointing to the search tool
- **Invalid dates**: Return `isError: true` with format guidance
- **Business rule violations** (min stay, date ordering): Return `isError: true` with explanation
- **Missing resources**: Return content with error information (not a protocol-level error)
- **Startup failures**: Caught by top-level `.catch()`, logged to stderr, `process.exit(1)`

## 9. Seasonal Pricing

The availability tool applies a multiplier to the base nightly rate:

| Season | Months | Multiplier |
|--------|--------|-----------|
| Peak Winter | Dec, Jan, Feb | 1.2x |
| Spring Skiing | Mar, Apr | 1.0x (base rate) |
| Summer | Jun, Jul, Aug | 0.8x |
| Shoulder | May, Sep, Oct, Nov | 0.7x |

Total calculation: `(base rate x multiplier x nights) + cleaning fee`

## 10. Deep-Link Pattern

All tool results include the MCP resource URI `whistler://properties/{id}`. This allows MCP clients to:

1. See the URI in tool output
2. Resolve it via `resources/read` to get full property JSON
3. Follow resource template autocomplete for discovery
