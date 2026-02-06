# API Reference

All communication uses the Model Context Protocol (MCP) over JSON-RPC 2.0 via stdio.

## 1. Tools

### 1.1 search_properties

Search for vacation rental properties with optional filters.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| location | string | No | Neighborhood ID or partial name (e.g. "whistler-village", "creekside") |
| checkIn | string | No | Check-in date in YYYY-MM-DD format |
| checkOut | string | No | Check-out date in YYYY-MM-DD format |
| minBedrooms | number | No | Minimum number of bedrooms (0 = studio) |
| maxPrice | number | No | Maximum nightly rate in CAD |
| skiInSkiOut | boolean | No | If true, only return ski-in/ski-out properties |
| petFriendly | boolean | No | If true, only return pet-friendly properties |
| amenities | string[] | No | List of required amenities (all must match) |
| propertyType | string | No | Filter by type: "condo", "chalet", "townhouse", "cabin" |
| sortBy | enum | No | "price_asc", "price_desc", "rating" (default), "bedrooms" |

**Returns:** Formatted markdown with property summaries. Each result includes name, ID, resource URI, type, bedrooms/bathrooms, location, price, rating, tags, and top amenities. When dates are provided, includes total price calculation.

**Example call:**
```json
{
  "name": "search_properties",
  "arguments": {
    "checkIn": "2026-03-15",
    "checkOut": "2026-03-20",
    "minBedrooms": 2,
    "skiInSkiOut": true,
    "propertyType": "condo",
    "sortBy": "price_asc"
  }
}
```

**Example output:**
```
Found 4 properties in Whistler for 5 nights:

**Hilton Whistler Ski-In 2BR Suite** (wv-hilton-ski-suite)
Resource: whistler://properties/wv-hilton-ski-suite
Type: condo | 2 BR / 2 BA | Up to 6 guests
Location: whistler village
Price: $475 CAD/night + $175 cleaning fee | $2550 CAD total (5 nights)
Rating: 4.7/5 (267 reviews)
Tags: Ski-In/Ski-Out, Superhost
Top amenities: wifi, kitchen, fireplace, hot-tub, pool, spa
---
...
```

**No results:** Returns a message suggesting filter adjustments.

---

### 1.2 get_property_details

Get full details for a specific property.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| propertyId | string | Yes | Property ID (e.g. "wv-pan-pacific-205") |

**Returns:** Full markdown property profile including:
- Name, ID, resource URI, type, location
- Description
- Bedrooms, bathrooms, max guests, minimum stay
- Nightly rate and cleaning fee
- Full amenities list
- Rating and review count
- Host name and superhost status
- Tags (ski-in/ski-out, pet-friendly, superhost)
- Available seasons and blocked dates
- Coordinates
- Neighborhood description and distance to village

**Error:** Returns `isError: true` if property ID not found.

---

### 1.3 check_availability

Check if a property is available for specific dates and get a price estimate.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| propertyId | string | Yes | Property ID |
| checkIn | string | Yes | Check-in date (YYYY-MM-DD) |
| checkOut | string | Yes | Check-out date (YYYY-MM-DD) |

**Returns (available):** Markdown report with pricing table:
```
## Availability: Pan Pacific Village Retreat
**Resource:** whistler://properties/wv-pan-pacific-205

**Available!** This property is open for your requested dates.

| Detail | Value |
|--------|-------|
| Check-in | 2026-03-15 |
| Check-out | 2026-03-20 |
| Nights | 5 |
| Nightly Rate | $550 CAD (spring skiing rate) |
| Cleaning Fee | $200 CAD |
| **Total** | **$2950 CAD** |
```

**Returns (unavailable):** Lists conflicting blocked dates and suggests alternatives.

**Errors:**
- Property not found → `isError: true`
- Invalid date format → `isError: true`
- Check-out before check-in → `isError: true`
- Below minimum stay → `isError: true` with required minimum

**Seasonal pricing multipliers:**

| Season | Months | Multiplier |
|--------|--------|-----------|
| Peak Winter | Dec, Jan, Feb | 1.2x |
| Spring Skiing | Mar, Apr | 1.0x |
| Summer | Jun, Jul, Aug | 0.8x |
| Shoulder | May, Sep-Nov | 0.7x |

---

### 1.4 compare_properties

Compare 2-4 properties side by side.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| propertyIds | string[] | Yes | Array of 2-4 property IDs |
| checkIn | string | No | Check-in date for price calculation |
| checkOut | string | No | Check-out date for price calculation |

**Returns:** Markdown comparison table with columns for each property and rows for:
- Name, Resource URI, Type, Neighborhood
- Bedrooms, Bathrooms, Max Guests
- Price/Night, Cleaning Fee
- Total (if dates provided), Available (if dates provided)
- Rating, Ski-In/Ski-Out, Pet-Friendly, Min Stay
- Top Amenities

**Errors:**
- Fewer than 2 IDs → `isError: true`
- More than 4 IDs → `isError: true`
- Any ID not found → `isError: true` listing missing IDs

---

## 2. Resources

### 2.1 whistler://properties (static)

**Name:** all-properties
**MIME type:** application/json

Returns a JSON array of property summaries (id, name, type, neighborhood, bedrooms, bathrooms, maxGuests, pricePerNight, rating, skiInSkiOut, petFriendly).

### 2.2 whistler://properties/{id} (template)

**Name:** property-detail
**MIME type:** application/json

Returns the full Property object as JSON. Supports list callback (returns all properties) and autocomplete for the `{id}` variable.

### 2.3 whistler://area-guide (static)

**Name:** area-guide
**MIME type:** text/markdown

Returns a comprehensive Whistler area guide covering: overview, quick facts, transportation, all neighborhoods, skiing/snowboarding, dining highlights, summer activities, and visitor tips.

### 2.4 whistler://neighborhoods/{id} (template)

**Name:** neighborhood-detail
**MIME type:** text/markdown

Returns neighborhood detail: description, highlights, nearest lift, distance to village, elevation. Supports list and autocomplete callbacks.

**Valid IDs:** whistler-village, upper-village, creekside, village-north, kadenwood, nordic, blueberry-hill

### 2.5 whistler://platforms (static)

**Name:** platforms
**MIME type:** text/markdown

Returns a markdown guide to real Whistler booking platforms with comparison table, individual platform details, and booking tips.

### 2.6 whistler://platforms/{id} (template)

**Name:** platform-detail
**MIME type:** application/json

Returns the full Platform object as JSON. Supports list and autocomplete callbacks.

**Valid IDs:** alluradirect, whistler-platinum, whistler-com, blackcomb-peaks, whistler-blackcomb

---

## 3. Prompts

### 3.1 plan-whistler-trip

Generates a structured prompt for trip planning.

**Parameters:**

| Name | Type | Required | Values |
|------|------|----------|--------|
| groupSize | string | Yes | e.g. "2", "4", "family of 5" |
| season | enum | Yes | "winter", "spring", "summer", "fall" |
| budget | enum | Yes | "budget" ($150-300), "moderate" ($300-600), "luxury" ($600-1500) |
| interests | string | Yes | e.g. "skiing, dining, spa" |

**Returns:** A user message instructing the AI to search properties, compare options, suggest an itinerary, and recommend a neighborhood.

### 3.2 recommend-property

Generates a structured prompt for property recommendations.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| requirements | string | Yes | Natural language description of needs |
| checkIn | string | No | Check-in date (YYYY-MM-DD) |
| checkOut | string | No | Check-out date (YYYY-MM-DD) |

**Returns:** A user message instructing the AI to parse requirements, search with appropriate filters, check availability, recommend a top pick with details, and offer alternatives.

---

## 4. Protocol Details

### 4.1 Server Capabilities

```json
{
  "logging": {},
  "tools": { "listChanged": true },
  "resources": { "listChanged": true },
  "completions": {},
  "prompts": { "listChanged": true }
}
```

### 4.2 Server Info

```json
{
  "name": "whistler-vacation-mcp",
  "version": "1.0.0"
}
```

### 4.3 Protocol Version

`2024-11-05`
