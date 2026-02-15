# Whistler Vacation MCP Server - Project Memory

## Project State
- MCP server fully implemented and building cleanly (`npx tsc` zero errors)
- 18 sample properties, 7 neighborhoods, 4 tools, 4 resources, 2 prompts
- Runtime deps: `@modelcontextprotocol/sdk` v1.26.0, `zod` v4.3.6
- Entry point: `src/index.ts` → `build/index.js`

## MCP SDK Patterns (v1.26.0)
- Import from `@modelcontextprotocol/sdk/server/mcp.js` (McpServer, ResourceTemplate)
- Import from `@modelcontextprotocol/sdk/server/stdio.js` (StdioServerTransport)
- `server.registerTool(name, { title, description, inputSchema: { field: z.string() } }, handler)`
- `server.registerResource(name, uri, metadata, handler)` for static resources
- `server.registerResource(name, new ResourceTemplate(pattern, { list, complete }), metadata, handler)` for templates
- `server.registerPrompt(name, { title, description, argsSchema }, handler)`
- Tool handler return: `{ content: [{ type: "text", text: "..." }] }`
- Resource handler return: `{ contents: [{ uri, text, mimeType }] }`
- Prompt handler return: `{ messages: [{ role: "user", content: { type: "text", text: "..." } }] }`
- Use `console.error` for logging (stdout is MCP protocol)

## Zod v4 Notes
- Import as `import { z } from "zod"` (not `zod/v4` — the package IS v4)
- Schema objects passed directly: `{ field: z.string().describe("...") }`

## Key Files
- `src/data/properties.ts` — sample data, add/modify properties here
- `src/data/neighborhoods.ts` — neighborhood info
- `src/tools/` — each tool in its own file with `register*Tool` export
- History logs go in `project/history/` per CLAUDE.md instructions
