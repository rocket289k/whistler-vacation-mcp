# 2026-02-06 - Add Deep-Link Resource URIs to Tool Results

## What
Added `whistler://properties/{id}` deep-link resource URIs to all 4 tool outputs so MCP clients can resolve full property details from any tool result.

## Why
Tool results previously only showed the property ID. By including the MCP resource URI, clients can directly fetch the full property resource without needing to construct the URI themselves.

## Changes
- `src/tools/search.ts` — Added `Resource: whistler://properties/{id}` line to each search result summary
- `src/tools/details.ts` — Added `**Resource:** whistler://properties/{id}` to the property detail header
- `src/tools/availability.ts` — Added `**Resource:** whistler://properties/{id}` to both available and unavailable responses
- `src/tools/compare.ts` — Added a `Resource` row to the comparison table with URIs for each property

## Problems Encountered
- MCP Inspector port was still held by previous process; resolved by killing ports 6274/6277 before relaunching.

## How
Edited the text output in each tool's handler to include the resource URI. Built with `npx tsc` (zero errors). Verified search results show the URI for every property.
