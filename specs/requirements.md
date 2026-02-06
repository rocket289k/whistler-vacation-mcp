# Requirements Specification

## 1. Overview

The Whistler Vacation Rental MCP Server is a self-contained Model Context Protocol server that enables AI assistants to search, compare, and recommend vacation rental properties in Whistler, British Columbia.

### 1.1 Problem Statement

Users want to find vacation rentals in Whistler through natural language conversations with AI assistants. The primary scenario: **finding a 2-bedroom ski-in/ski-out condo in Whistler for March 15-20**.

### 1.2 Scope

- Self-contained server with realistic sample data (no external API dependencies)
- Stdio transport for use with Claude Desktop, Claude Code, and MCP Inspector
- Read-only operations (no booking, payment, or user account management)

## 2. Functional Requirements

### 2.1 Property Search (FR-001)

The server SHALL provide a `search_properties` tool that filters properties by:

| Filter | Type | Required | Description |
|--------|------|----------|-------------|
| location | string | No | Neighborhood ID or partial name |
| checkIn | string | No | Check-in date (YYYY-MM-DD) |
| checkOut | string | No | Check-out date (YYYY-MM-DD) |
| minBedrooms | number | No | Minimum bedroom count |
| maxPrice | number | No | Maximum nightly rate in CAD |
| skiInSkiOut | boolean | No | Filter for ski-in/ski-out only |
| petFriendly | boolean | No | Filter for pet-friendly only |
| amenities | string[] | No | Required amenities list |
| propertyType | string | No | condo, chalet, townhouse, or cabin |
| sortBy | enum | No | price_asc, price_desc, rating, bedrooms |

- When dates are provided, blocked dates SHALL exclude properties from results
- When dates are provided, total price SHALL be calculated and displayed
- Default sort order SHALL be by rating descending
- Results SHALL include the `whistler://properties/{id}` resource deep-link

### 2.2 Property Details (FR-002)

The server SHALL provide a `get_property_details` tool that returns full property information including description, amenities, pricing, ratings, host info, availability, neighborhood context, and resource deep-link.

- SHALL return an error with `isError: true` if the property ID is not found

### 2.3 Availability Check (FR-003)

The server SHALL provide a `check_availability` tool that:

- Checks if requested dates overlap with any blocked dates
- Applies seasonal pricing multipliers:
  - Peak winter (Dec-Feb): 1.2x base rate
  - Spring skiing (Mar-Apr): 1.0x base rate
  - Summer (Jun-Aug): 0.8x base rate
  - Shoulder season (May, Sep-Nov): 0.7x base rate
- Calculates total price: `(adjusted nightly rate x nights) + cleaning fee`
- Validates minimum stay requirements
- Returns a formatted availability report with pricing table

### 2.4 Property Comparison (FR-004)

The server SHALL provide a `compare_properties` tool that:

- Accepts 2-4 property IDs
- Generates a side-by-side markdown comparison table
- Includes: name, resource URI, type, neighborhood, bedrooms, bathrooms, max guests, price, cleaning fee, rating, ski-in/ski-out, pet-friendly, minimum stay, top amenities
- When dates are provided, includes total price and availability status

### 2.5 Property Resources (FR-005)

The server SHALL expose:

- `whistler://properties` — JSON summary of all properties
- `whistler://properties/{id}` — Full JSON detail for a single property, with list and autocomplete callbacks

### 2.6 Area Guide Resources (FR-006)

The server SHALL expose:

- `whistler://area-guide` — Comprehensive markdown guide covering overview, facts, transportation, neighborhoods, skiing, dining, summer activities, and visitor tips
- `whistler://neighborhoods/{id}` — Individual neighborhood detail with description, highlights, nearest lift, distance to village, and elevation

### 2.7 Platform Resources (FR-007)

The server SHALL expose:

- `whistler://platforms` — Markdown overview of real Whistler booking platforms with comparison table and booking tips
- `whistler://platforms/{id}` — JSON detail for each platform

### 2.8 Trip Planning Prompt (FR-008)

The server SHALL provide a `plan-whistler-trip` prompt that accepts group size, season, budget level, and interests, and generates a structured prompt instructing the AI to search properties, compare options, suggest an itinerary, and recommend a neighborhood.

### 2.9 Property Recommendation Prompt (FR-009)

The server SHALL provide a `recommend-property` prompt that accepts freeform requirements and optional dates, and generates a structured prompt instructing the AI to parse requirements, search, check availability, recommend a top pick, and offer alternatives.

## 3. Non-Functional Requirements

### 3.1 Performance (NFR-001)

- Server SHALL start and respond to the MCP `initialize` handshake within 2 seconds
- All tool calls SHALL complete within 100ms (in-memory data, no I/O)

### 3.2 Compatibility (NFR-002)

- SHALL support MCP protocol version `2024-11-05`
- SHALL work with Claude Desktop, Claude Code, and MCP Inspector
- SHALL use stdio transport (stdin/stdout for MCP, stderr for logging)

### 3.3 Data Integrity (NFR-003)

- SHALL include at least 15 sample properties across at least 5 neighborhoods
- SHALL include at least 4 ski-in/ski-out 2-bedroom condos to satisfy the primary search scenario
- Price range SHALL span $150-$1,500 CAD/night for realistic variety
- SHALL include at least 5 real Whistler booking platforms with accurate information

### 3.4 Error Handling (NFR-004)

- Invalid property IDs SHALL return `isError: true` with a helpful message
- Invalid dates SHALL return `isError: true` with format guidance
- Check-out before check-in SHALL return `isError: true`
- Minimum stay violations SHALL return `isError: true` with the required minimum
- Comparison with fewer than 2 or more than 4 properties SHALL return `isError: true`

### 3.5 Build & Development (NFR-005)

- TypeScript strict mode with zero compilation errors
- ES module format (`"type": "module"` in package.json)
- Node16 module resolution
- Source maps and declaration files generated
