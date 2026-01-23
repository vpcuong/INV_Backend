# Add Line to Sales Order - Complete Guide

## Overview

This document provides detailed instructions for adding lines to an existing Sales Order. This is one of the most common operations when managing orders, allowing you to add additional items to an order after it has been created.

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [API Endpoint Details](#api-endpoint-details)
3. [Request Structure](#request-structure)
4. [Response Structure](#response-structure)
5. [Business Rules](#business-rules)
6. [Examples](#examples)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)
9. [Frontend Integration Guide](#frontend-integration-guide)

---

## Quick Start

### Basic Request
```http
POST /api/so/{publicId}/lines
Content-Type: application/json

{
  "itemCode": "WIDGET-001",
  "orderQty": 10,
  "unitPrice": 25.50
}
```

### With Full Details
```http
POST /api/so/01ARZ3NDEKTSV4RRFFQ69G5FAV/lines
Content-Type: application/json

{
  "itemCode": "WIDGET-001",
  "description": "Premium Widget",
  "orderQty": 10,
  "uomCode": "PCS",
  "unitPrice": 25.50,
  "pricing": {
    "discountPercent": 10,
    "taxPercent": 8.25
  },
  "warehouseCode": "WH-MAIN",
  "lineNote": "Rush delivery"
}
```

---

## API Endpoint Details

### Endpoint Information
- **URL**: `/api/so/:publicId/lines`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: Required (Bearer token)

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `publicId` | string (ULID) | Yes | The public ID of the Sales Order. Must be a valid 26-character ULID. |

### ULID Format
- Length: 26 characters
- Characters: `0-9`, `A-Z` (uppercase, excluding I, L, O, U)
- Example: `01ARZ3NDEKTSV4RRFFQ69G5FAV`
- Validation regex: `^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$`

---

## Request Structure

### Complete Request Body Schema

```typescript
{
  // Optional - Auto-generated if not provided
  "lineNum"?: number,

  // Item identification (at least itemCode is required)
  "itemId"?: number,
  "itemSkuId"?: number,
  "itemCode": string,              // REQUIRED
  "description"?: string,

  // Quantity and pricing (required)
  "orderQty": number,               // REQUIRED, must be > 0
  "uomCode"?: string,
  "unitPrice": number,              // REQUIRED, must be > 0

  // Optional pricing details (grouped object)
  "pricing"?: {
    "discountPercent"?: number,     // 0-100
    "discountAmount"?: number,      // >= 0
    "taxPercent"?: number,          // 0-100
    "taxAmount"?: number            // >= 0
  },

  // Optional additional information
  "needByDate"?: string,            // ISO 8601 format
  "warehouseCode"?: string,
  "lineNote"?: string
}
```

### Field Descriptions

#### Required Fields

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| `itemCode` | string | Non-empty | Unique identifier for the item |
| `orderQty` | number | > 0 | Quantity to order |
| `unitPrice` | number | > 0 | Price per unit |

#### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `lineNum` | number | Auto-generated | Line number (will be max + 1) |
| `itemId` | number | null | Internal item ID |
| `itemSkuId` | number | null | Item SKU ID |
| `description` | string | null | Item description |
| `uomCode` | string | null | Unit of measure (e.g., "PCS", "BOX", "EA") |
| `needByDate` | string | null | Required delivery date (ISO 8601) |
| `warehouseCode` | string | null | Warehouse code for fulfillment |
| `lineNote` | string | null | Additional notes for this line |

#### Pricing Object (Optional)

The `pricing` object groups all pricing-related fields:

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| `discountPercent` | number | 0-100 | Discount percentage |
| `discountAmount` | number | >= 0 | Fixed discount amount |
| `taxPercent` | number | 0-100 | Tax percentage |
| `taxAmount` | number | >= 0 | Fixed tax amount |

**Important Notes:**
- You can provide either `discountPercent` OR `discountAmount` (or both)
- Same applies for `taxPercent` and `taxAmount`
- If both percent and amount are provided, amount takes precedence

---

## Response Structure

### Success Response (201 Created)

The response returns the **complete Sales Order** with all lines, including the newly added line.

```typescript
{
  // Sales Order Header
  "id": number,
  "publicId": string,                    // ULID
  "soNum": string,                       // e.g., "SO-2024-00001"
  "customerId": number,
  "orderDate": string,
  "orderStatus": string,

  // Pricing totals (recalculated)
  "totalLineAmount": number,
  "discountAmount": number,
  "totalDiscount": number,
  "totalTax": number,
  "totalCharges": number,
  "orderTotal": number,

  // Customer and addresses
  "customer": {
    "id": number,
    "name": string,
    "email": string
  },
  "billingAddressId": number,
  "shippingAddressId": number,

  // All lines (including the new one)
  "lines": [
    {
      "id": number,
      "publicId": string,              // ULID for the line
      "lineNum": number,
      "itemCode": string,
      "description": string,
      "orderQty": number,
      "uomCode": string,
      "unitPrice": number,

      // Calculated pricing
      "lineDiscountPercent": number,
      "lineDiscountAmount": number,
      "lineTaxPercent": number,
      "lineTaxAmount": number,
      "lineTotal": number,

      // Status and fulfillment
      "lineStatus": string,            // "OPEN" for new lines
      "openQty": number,               // Same as orderQty initially
      "shippedQty": number,            // 0 for new lines

      // Additional info
      "warehouseCode": string,
      "needByDate": string,
      "lineNote": string,

      // Timestamps
      "createdAt": string,
      "updatedAt": string
    }
  ],

  // Metadata
  "channel": string,
  "fobCode": string,
  "shipViaCode": string,
  "paymentTermCode": string,
  "currencyCode": string,
  "exchangeRate": number,

  // Timestamps
  "createdAt": string,
  "updatedAt": string
}
```

### Key Response Features

1. **Complete SO Data**: You receive the entire Sales Order, not just the new line
2. **Auto-Generated Values**:
   - `lineNum` is automatically set to the next available number
   - `publicId` is generated for the new line
   - `lineStatus` is set to "OPEN"
   - `openQty` equals `orderQty`
   - `shippedQty` is set to 0
3. **Recalculated Totals**: All order totals are recalculated to include the new line

---

## Business Rules

### 1. Line Number Generation
- If `lineNum` is not provided, it will be auto-generated
- Auto-generated value = `max(existing line numbers) + 1`
- For first line: `lineNum = 1`
- Custom `lineNum` can be provided, but must be unique

### 2. Pricing Calculations

The system automatically calculates the following:

```typescript
// Step 1: Calculate subtotal
subtotal = orderQty × unitPrice

// Step 2: Apply discount
discount = pricing.discountAmount || 0

// Step 3: Apply tax
tax = pricing.taxAmount || 0

// Step 4: Calculate line total
lineTotal = subtotal - discount + tax
```

**Example:**
```
orderQty: 10
unitPrice: 25.50
discount: 25.50 (10%)
tax: 18.70 (8.25%)

Calculation:
subtotal = 10 × 25.50 = 255.00
lineTotal = 255.00 - 25.50 + 18.70 = 248.20
```

### 3. Initial Status Values

Every new line is created with these default values:
- `lineStatus` = "OPEN"
- `openQty` = `orderQty` (all quantity is open)
- `shippedQty` = 0 (nothing shipped yet)

### 4. Order Status Constraints

You can add lines only if the Sales Order is in certain statuses:
- ✅ **OPEN** - Can add lines
- ❌ **CLOSED** - Cannot add lines
- ❌ **CANCELLED** - Cannot add lines
- ⚠️ **ON_HOLD** - May be restricted (depends on business rules)

### 5. Item Validation

While `itemCode` is required:
- `itemId` and `itemSkuId` are optional
- System may validate that `itemCode` exists in inventory
- If validation fails, you'll receive a 400 Bad Request error

---

## Examples

### Example 1: Minimal Request (Required Fields Only)

**Request:**
```http
POST /api/so/01ARZ3NDEKTSV4RRFFQ69G5FAV/lines
Content-Type: application/json

{
  "itemCode": "WIDGET-001",
  "orderQty": 10,
  "unitPrice": 25.50
}
```

**Response:**
```json
{
  "id": 12345,
  "publicId": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "soNum": "SO-2024-00001",
  "orderTotal": 255.00,
  "lines": [
    {
      "id": 10,
      "publicId": "01ARZ3NDEKTSV4RRFFQ69G5FAX",
      "lineNum": 1,
      "itemCode": "WIDGET-001",
      "orderQty": 10,
      "unitPrice": 25.50,
      "lineTotal": 255.00,
      "lineStatus": "OPEN",
      "openQty": 10,
      "shippedQty": 0
    }
  ]
}
```

---

### Example 2: With Discount Percentage

**Request:**
```json
{
  "itemCode": "GADGET-002",
  "description": "Super Gadget",
  "orderQty": 5,
  "uomCode": "BOX",
  "unitPrice": 150.00,
  "pricing": {
    "discountPercent": 10
  }
}
```

**Calculation:**
- Subtotal: 5 × 150.00 = 750.00
- Discount: 750.00 × 10% = 75.00
- Line Total: 750.00 - 75.00 = 675.00

**Response (line only):**
```json
{
  "id": 11,
  "publicId": "01ARZ3NDEKTSV4RRFFQ69G5FAY",
  "lineNum": 2,
  "itemCode": "GADGET-002",
  "description": "Super Gadget",
  "orderQty": 5,
  "uomCode": "BOX",
  "unitPrice": 150.00,
  "lineDiscountPercent": 10,
  "lineDiscountAmount": 75.00,
  "lineTotal": 675.00,
  "lineStatus": "OPEN"
}
```

---

### Example 3: With Fixed Discount and Tax Amounts

**Request:**
```json
{
  "itemCode": "TOOL-003",
  "description": "Professional Tool Kit",
  "orderQty": 3,
  "uomCode": "KIT",
  "unitPrice": 200.00,
  "pricing": {
    "discountAmount": 50.00,
    "taxAmount": 45.38
  },
  "warehouseCode": "WH-02",
  "lineNote": "Gift wrap required"
}
```

**Calculation:**
- Subtotal: 3 × 200.00 = 600.00
- Discount: 50.00 (fixed)
- Tax: 45.38 (fixed)
- Line Total: 600.00 - 50.00 + 45.38 = 595.38

**Response (line only):**
```json
{
  "id": 12,
  "publicId": "01ARZ3NDEKTSV4RRFFQ69G5FAZ",
  "lineNum": 3,
  "itemCode": "TOOL-003",
  "description": "Professional Tool Kit",
  "orderQty": 3,
  "uomCode": "KIT",
  "unitPrice": 200.00,
  "lineDiscountAmount": 50.00,
  "lineTaxAmount": 45.38,
  "lineTotal": 595.38,
  "warehouseCode": "WH-02",
  "lineNote": "Gift wrap required",
  "lineStatus": "OPEN"
}
```

---

### Example 4: With Need By Date

**Request:**
```json
{
  "itemCode": "URGENT-ITEM-004",
  "description": "Rush Order Item",
  "orderQty": 100,
  "uomCode": "PCS",
  "unitPrice": 5.00,
  "needByDate": "2024-02-15T00:00:00Z",
  "pricing": {
    "taxPercent": 8.25
  },
  "warehouseCode": "WH-EXPRESS",
  "lineNote": "URGENT: Required for trade show"
}
```

**Response (line only):**
```json
{
  "id": 13,
  "publicId": "01ARZ3NDEKTSV4RRFFQ69G5FB0",
  "lineNum": 4,
  "itemCode": "URGENT-ITEM-004",
  "orderQty": 100,
  "unitPrice": 5.00,
  "lineTaxPercent": 8.25,
  "lineTaxAmount": 41.25,
  "lineTotal": 541.25,
  "needByDate": "2024-02-15T00:00:00Z",
  "warehouseCode": "WH-EXPRESS",
  "lineNote": "URGENT: Required for trade show"
}
```

---

### Example 5: Custom Line Number

**Request:**
```json
{
  "lineNum": 10,
  "itemCode": "SPECIAL-005",
  "orderQty": 1,
  "unitPrice": 999.99
}
```

**Response (line only):**
```json
{
  "id": 14,
  "publicId": "01ARZ3NDEKTSV4RRFFQ69G5FB1",
  "lineNum": 10,
  "itemCode": "SPECIAL-005",
  "orderQty": 1,
  "unitPrice": 999.99,
  "lineTotal": 999.99
}
```

---

## Error Handling

### Common Errors

#### 1. Invalid ULID Format (400 Bad Request)

**Request:**
```http
POST /api/so/invalid-ulid/lines
```

**Response:**
```json
{
  "statusCode": 400,
  "message": "Invalid ULID format",
  "error": "Bad Request",
  "timestamp": "2024-01-19T10:30:00Z",
  "path": "/api/so/invalid-ulid/lines"
}
```

---

#### 2. Sales Order Not Found (404 Not Found)

**Request:**
```http
POST /api/so/01ARZ3NDEKTSV4RRFFQ69G9999/lines
```

**Response:**
```json
{
  "statusCode": 404,
  "message": "Sales Order with public ID 01ARZ3NDEKTSV4RRFFQ69G9999 not found",
  "error": "Not Found",
  "timestamp": "2024-01-19T10:30:00Z",
  "path": "/api/so/01ARZ3NDEKTSV4RRFFQ69G9999/lines"
}
```

---

#### 3. Missing Required Fields (400 Bad Request)

**Request:**
```json
{
  "itemCode": "WIDGET-001"
  // Missing orderQty and unitPrice
}
```

**Response:**
```json
{
  "statusCode": 400,
  "message": [
    "orderQty must be a positive number",
    "unitPrice must be a positive number"
  ],
  "error": "Bad Request",
  "timestamp": "2024-01-19T10:30:00Z"
}
```

---

#### 4. Invalid Quantity (400 Bad Request)

**Request:**
```json
{
  "itemCode": "WIDGET-001",
  "orderQty": -5,
  "unitPrice": 25.50
}
```

**Response:**
```json
{
  "statusCode": 400,
  "message": "orderQty must be a positive number",
  "error": "Bad Request",
  "timestamp": "2024-01-19T10:30:00Z"
}
```

---

#### 5. Invalid Pricing Values (400 Bad Request)

**Request:**
```json
{
  "itemCode": "WIDGET-001",
  "orderQty": 10,
  "unitPrice": 25.50,
  "pricing": {
    "discountPercent": 150
  }
}
```

**Response:**
```json
{
  "statusCode": 400,
  "message": "pricing.discountPercent must not be greater than 100",
  "error": "Bad Request",
  "timestamp": "2024-01-19T10:30:00Z"
}
```

---

#### 6. Order Status Constraint (400 Bad Request)

**Request:**
```http
POST /api/so/01ARZ3NDEKTSV4RRFFQ69G5FAV/lines
```

**Response (if SO is CLOSED):**
```json
{
  "statusCode": 400,
  "message": "Cannot add lines to a closed order",
  "error": "Bad Request",
  "timestamp": "2024-01-19T10:30:00Z"
}
```

---

#### 7. Unauthorized (401)

**Request (without token):**
```http
POST /api/so/01ARZ3NDEKTSV4RRFFQ69G5FAV/lines
```

**Response:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## Summary

### Key Takeaways

1. **Endpoint**: `POST /api/so/:publicId/lines`
2. **Required Fields**: `itemCode`, `orderQty`, `unitPrice`
3. **Auto-Generated**: `lineNum`, `publicId`, `lineStatus`, `openQty`, `shippedQty`
4. **Grouped Properties**: Use `pricing` object for discount/tax fields
5. **Response**: Returns complete SO with all lines (including new one)
6. **Status Constraints**: Can only add to OPEN orders
7. **ULID Required**: Must use 26-character ULID for `publicId`

