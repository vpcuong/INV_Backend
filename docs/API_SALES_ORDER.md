# Sales Order API Documentation

## Base URL
```
/api/so
```

## Authentication
All endpoints require authentication (token-based).

---

## Table of Contents
1. [Create Sales Order](#1-create-sales-order)
2. [Get Sales Order by Public ID](#2-get-sales-order-by-public-id)
3. [Get Sales Order by SO Number](#3-get-sales-order-by-so-number)
4. [List Sales Orders](#4-list-sales-orders)
5. [Search Sales Orders](#5-search-sales-orders)
6. [Update Sales Order](#6-update-sales-order)
7. [Update Sales Order with Lines](#7-update-sales-order-with-lines)
8. [Add Line to Sales Order](#8-add-line-to-sales-order)
9. [Delete Line from Sales Order](#9-delete-line-from-sales-order)
10. [Sales Order Status Management](#10-sales-order-status-management)
11. [Delete Sales Order](#11-delete-sales-order)
12. [Filter and Query Endpoints](#12-filter-and-query-endpoints)

---

## Important Notes

### ULID vs Sequential ID
- **All endpoints use ULID (Universally Unique Lexicographically Sortable Identifier)** for `:publicId` parameter
- ULID format: 26 characters, alphanumeric (e.g., `01ARZ3NDEKTSV4RRFFQ69G5FAV`)
- **Sequential integer IDs are NOT supported** in the current API version
- Only exception: internal operations and `soNum` lookups

### Data Structure Convention
Some properties are grouped into nested objects for better organization:

```typescript
// Pricing information is grouped
{
  "pricing": {
    "discountPercent": 10,
    "discountAmount": 25.50,
    "taxPercent": 8.25,
    "taxAmount": 18.70
  }
}

// Address information is grouped
{
  "addresses": {
    "billingAddressId": 123,
    "shippingAddressId": 456
  }
}

// Metadata is grouped
{
  "metadata": {
    "shipViaCode": "UPS",
    "fobCode": "FOB-001",
    "headerNote": "Rush order",
    "internalNote": "VIP customer"
  }
}
```

---

## 1. Create Sales Order

### Endpoint
```http
POST /api/so
```

### Description
Create a new sales order with optional lines.

### Request Body
```typescript
{
  "customerId": number,                    // Required
  "orderDate": string (ISO 8601),          // Optional, defaults to now
  "requestDate": string (ISO 8601),        // Optional
  "needByDate": string (ISO 8601),         // Optional
  "discountPercent": number,         // Optional (0-100)
  "billingAddressId": number,              // Optional
  "shippingAddressId": number,             // Optional
  "channel": string,                       // Optional (e.g., "ONLINE", "RETAIL")
  "fobCode": string,                       // Optional
  "shipViaCode": string,                   // Optional
  "paymentTermCode": string,               // Optional
  "currencyCode": string,                  // Optional, defaults to "USD"
  "customerPoNum": string,                 // Optional
  "headerNote": string,                    // Optional
  "internalNote": string,                  // Optional
  "createdBy": string,                     // Optional
  "lines": [                               // Optional array of lines
    {
      "lineNum": number,                   // Optional, auto-generated
      "itemId": number,                    // Optional
      "itemSkuId": number,                 // Optional
      "itemCode": string,                  // Required
      "description": string,               // Optional
      "orderQty": number,                  // Required, must be positive
      "uomCode": string,                   // Optional (e.g., "PCS", "BOX")
      "unitPrice": number,                 // Required, must be positive
      "pricing": {                         // Optional pricing details
        "discountPercent": number,         // 0-100
        "discountAmount": number,          // >= 0
        "taxPercent": number,              // 0-100
        "taxAmount": number                // >= 0
      },
      "needByDate": string (ISO 8601),     // Optional
      "warehouseCode": string,             // Optional
      "lineNote": string                   // Optional
    }
  ]
}
```

### Example Request
```json
{
  "customerId": 1001,
  "orderDate": "2024-01-15T10:00:00Z",
  "needByDate": "2024-01-30T00:00:00Z",
  "channel": "ONLINE",
  "shipViaCode": "UPS",
  "paymentTermCode": "NET30",
  "currencyCode": "USD",
  "customerPoNum": "PO-2024-001",
  "headerNote": "Rush delivery requested",
  "lines": [
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
      "warehouseCode": "WH-MAIN"
    },
    {
      "itemCode": "GADGET-002",
      "description": "Super Gadget",
      "orderQty": 5,
      "uomCode": "BOX",
      "unitPrice": 150.00,
      "pricing": {
        "discountAmount": 50.00,
        "taxPercent": 8.25
      }
    }
  ]
}
```

### Response (201 Created)
```json
{
  "id": 12345,
  "publicId": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "soNum": "SO-2024-00001",
  "customerId": 1001,
  "orderDate": "2024-01-15T10:00:00Z",
  "needByDate": "2024-01-30T00:00:00Z",
  "orderStatus": "OPEN",
  "totalLineAmount": 1004.50,
  "discountAmount": 0,
  "totalDiscount": 75.50,
  "totalTax": 76.59,
  "totalCharges": 0,
  "orderTotal": 1005.59,
  "currencyCode": "USD",
  "exchangeRate": 1.0,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "lines": [
    {
      "id": 1,
      "publicId": "01ARZ3NDEKTSV4RRFFQ69G5FAW",
      "lineNum": 1,
      "itemCode": "WIDGET-001",
      "description": "Premium Widget",
      "orderQty": 10,
      "unitPrice": 25.50,
      "lineDiscountPercent": 10,
      "lineDiscountAmount": 25.50,
      "lineTaxPercent": 8.25,
      "lineTaxAmount": 18.70,
      "lineTotal": 248.20,
      "lineStatus": "OPEN",
      "openQty": 10,
      "shippedQty": 0
    }
  ]
}
```

### Error Responses
- `400 Bad Request` - Invalid data or business rule violation
- `401 Unauthorized` - Missing or invalid authentication
- `500 Internal Server Error` - Server error

---

## 2. Get Sales Order by Public ID

### Endpoint
```http
GET /api/so/:publicId
```

### Description
Retrieve a single sales order by its public ID (ULID).

### URL Parameters
- `publicId` (string, required) - ULID of the sales order

### Example Request
```http
GET /api/so/01ARZ3NDEKTSV4RRFFQ69G5FAV
```

### Response (200 OK)
```json
{
  "id": 12345,
  "publicId": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "soNum": "SO-2024-00001",
  "customerId": 1001,
  "customer": {
    "id": 1001,
    "name": "Acme Corporation",
    "email": "contact@acme.com"
  },
  "orderDate": "2024-01-15T10:00:00Z",
  "orderStatus": "OPEN",
  "totalLineAmount": 1004.50,
  "orderTotal": 1005.59,
  "lines": [...]
}
```

### Error Responses
- `400 Bad Request` - Invalid ULID format
- `404 Not Found` - Sales order not found
- `401 Unauthorized` - Missing or invalid authentication

---

## 3. Get Sales Order by SO Number

### Endpoint
```http
GET /api/so/sonum/:soNum
```

### Description
Retrieve a sales order by its SO number (e.g., "SO-2024-00001").

### URL Parameters
- `soNum` (string, required) - SO number

### Example Request
```http
GET /api/so/sonum/SO-2024-00001
```

### Response (200 OK)
Same as "Get Sales Order by Public ID"

### Error Responses
- `404 Not Found` - Sales order not found
- `401 Unauthorized` - Missing or invalid authentication

---

## 4. List Sales Orders

### Endpoint
```http
GET /api/so
```

### Description
Get all sales orders with optional filters.

### Query Parameters
All parameters from `SOFilterDto`:
- `status` (string) - Filter by status (e.g., "OPEN", "CLOSED")
- `customerId` (number) - Filter by customer ID
- `orderDateFrom` (string, ISO 8601) - Start date
- `orderDateTo` (string, ISO 8601) - End date
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20)

### Example Request
```http
GET /api/so?status=OPEN&customerId=1001&page=1&limit=20
```

### Response (200 OK)
```json
{
  "data": [
    {
      "id": 12345,
      "publicId": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "soNum": "SO-2024-00001",
      "customerId": 1001,
      "orderStatus": "OPEN",
      "orderTotal": 1005.59,
      ...
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 5. Search Sales Orders

### Endpoint
```http
GET /api/so/search
```

### Description
Search sales orders by text query.

### Query Parameters
- `q` (string, required) - Search query
- `customerId` (number, optional) - Filter by customer ID

### Example Request
```http
GET /api/so/search?q=widget&customerId=1001
```

### Response (200 OK)
Array of matching sales orders.

---

## 6. Update Sales Order

### Endpoint
```http
PATCH /api/so/:publicId
```

### Description
Update sales order header fields (does not modify lines).

### URL Parameters
- `publicId` (string, required) - ULID of the sales order

### Request Body
```typescript
{
  "discountAmount": number,          // Optional
  "addresses": {                           // Optional
    "billingAddressId": number,
    "shippingAddressId": number
  },
  "metadata": {                            // Optional
    "shipViaCode": string,
    "fobCode": string,
    "headerNote": string,
    "internalNote": string
  }
}
```

### Example Request
```http
PATCH /api/so/01ARZ3NDEKTSV4RRFFQ69G5FAV
```
```json
{
  "discountAmount": 50.00,
  "addresses": {
    "shippingAddressId": 789
  },
  "metadata": {
    "shipViaCode": "FEDEX",
    "headerNote": "Updated: Express delivery"
  }
}
```

### Response (200 OK)
Returns the updated sales order with all relations.

### Error Responses
- `400 Bad Request` - Invalid ULID format or data
- `404 Not Found` - Sales order not found
- `401 Unauthorized` - Missing or invalid authentication

---

## 7. Update Sales Order with Lines

### Endpoint
```http
PATCH /api/so/:publicId/with-lines
```

### Description
Update sales order header and lines in a single transaction. Supports:
- Updating header fields (optional)
- Adding new lines (omit `id`)
- Updating existing lines (include `id`)
- Deleting lines (provide `linesToDelete` array)

### URL Parameters
- `publicId` (string, required) - ULID of the sales order

### Request Body
```typescript
{
  "header": {                              // Optional header updates
    "discountAmount": number,
    "addresses": {
      "billingAddressId": number,
      "shippingAddressId": number
    },
    "metadata": {
      "shipViaCode": string,
      "fobCode": string,
      "headerNote": string,
      "internalNote": string
    }
  },
  "lines": [                               // Optional lines to add/update
    {
      "id": number,                        // Include for update, omit for new
      "lineNum": number,
      "itemCode": string,
      "description": string,
      "orderQty": number,
      "unitPrice": number,
      "pricing": {
        "discountPercent": number,
        "discountAmount": number,
        "taxPercent": number,
        "taxAmount": number
      },
      "warehouseCode": string,
      "lineNote": string
    }
  ],
  "linesToDelete": [123, 456]             // Optional array of line IDs to delete
}
```

### Example Request
```http
PATCH /api/so/01ARZ3NDEKTSV4RRFFQ69G5FAV/with-lines
```
```json
{
  "header": {
    "discountAmount": 100.00
  },
  "lines": [
    {
      "id": 1,
      "orderQty": 15,
      "unitPrice": 24.00
    },
    {
      "itemCode": "NEW-ITEM-003",
      "description": "New Item",
      "orderQty": 20,
      "unitPrice": 10.00,
      "pricing": {
        "taxPercent": 8.25
      }
    }
  ],
  "linesToDelete": [2]
}
```

### Response (200 OK)
Returns the updated sales order with all lines.

---

## 8. Add Line to Sales Order

### Endpoint
```http
POST /api/so/:publicId/lines
```

### Description
Add a single line to an existing sales order. Line number will be auto-generated if not provided.

### URL Parameters
- `publicId` (string, required) - ULID of the sales order

### Request Body
```typescript
{
  "lineNum": number,                       // Optional, auto-generated
  "itemId": number,                        // Optional
  "itemSkuId": number,                     // Optional
  "itemCode": string,                      // Required
  "description": string,                   // Optional
  "orderQty": number,                      // Required, must be positive
  "uomCode": string,                       // Optional
  "unitPrice": number,                     // Required, must be positive
  "pricing": {                             // Optional
    "discountPercent": number,             // 0-100
    "discountAmount": number,              // >= 0
    "taxPercent": number,                  // 0-100
    "taxAmount": number                    // >= 0
  },
  "needByDate": string (ISO 8601),         // Optional
  "warehouseCode": string,                 // Optional
  "lineNote": string                       // Optional
}
```

### Example Request
```http
POST /api/so/01ARZ3NDEKTSV4RRFFQ69G5FAV/lines
```
```json
{
  "itemCode": "WIDGET-005",
  "description": "Special Widget",
  "orderQty": 25,
  "uomCode": "PCS",
  "unitPrice": 30.00,
  "pricing": {
    "discountPercent": 5,
    "taxPercent": 8.25
  },
  "warehouseCode": "WH-02",
  "lineNote": "Expedite this item"
}
```

### Response (201 Created)
Returns the updated sales order with the new line included.

```json
{
  "id": 12345,
  "publicId": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "soNum": "SO-2024-00001",
  "lines": [
    {
      "id": 10,
      "publicId": "01ARZ3NDEKTSV4RRFFQ69G5FAX",
      "lineNum": 3,
      "itemCode": "WIDGET-005",
      "description": "Special Widget",
      "orderQty": 25,
      "unitPrice": 30.00,
      "lineStatus": "OPEN",
      "openQty": 25,
      "shippedQty": 0,
      ...
    }
  ]
}
```

### Error Responses
- `400 Bad Request` - Invalid ULID format or data
- `404 Not Found` - Sales order not found
- `401 Unauthorized` - Missing or invalid authentication

---

## 9. Delete Line from Sales Order

### Endpoint
```http
DELETE /api/so/:publicId/lines/:linePublicId
```

### Description
Delete a specific line from a sales order using both SO and line public IDs (ULIDs).

### URL Parameters
- `publicId` (string, required) - ULID of the sales order
- `linePublicId` (string, required) - ULID of the line to delete

### Example Request
```http
DELETE /api/so/01ARZ3NDEKTSV4RRFFQ69G5FAV/lines/01ARZ3NDEKTSV4RRFFQ69G5FAW
```

### Response (200 OK)
Returns the updated sales order without the deleted line.

### Error Responses
- `400 Bad Request` - Invalid ULID format
- `404 Not Found` - Sales order or line not found
- `401 Unauthorized` - Missing or invalid authentication

---

## 10. Sales Order Status Management

### 10.1 Cancel Sales Order

#### Endpoint
```http
PATCH /api/so/:publicId/cancel
```

#### Description
Cancel a sales order. Order must be in a valid status to be cancelled.

#### Response (200 OK)
```json
{
  "id": 12345,
  "publicId": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "orderStatus": "CANCELLED",
  ...
}
```

### 10.2 Complete Sales Order

#### Endpoint
```http
PATCH /api/so/:publicId/complete
```

#### Description
Complete a sales order. All lines must be closed/shipped.

#### Response (200 OK)
```json
{
  "orderStatus": "CLOSED",
  ...
}
```

### 10.3 Hold Sales Order

#### Endpoint
```http
PATCH /api/so/:publicId/hold
```

#### Description
Put a sales order on hold.

#### Response (200 OK)
```json
{
  "orderStatus": "ON_HOLD",
  ...
}
```

### 10.4 Release Sales Order

#### Endpoint
```http
PATCH /api/so/:publicId/release
```

#### Description
Release a sales order from hold status.

#### Response (200 OK)
```json
{
  "orderStatus": "OPEN",
  ...
}
```

### Error Responses (All Status Endpoints)
- `400 Bad Request` - Cannot change status in current state
- `404 Not Found` - Sales order not found
- `401 Unauthorized` - Missing or invalid authentication

---

## 11. Delete Sales Order

### Endpoint
```http
DELETE /api/so/:publicId
```

### Description
Delete a sales order. Order must be in a valid status to be deleted.

### URL Parameters
- `publicId` (string, required) - ULID of the sales order

### Example Request
```http
DELETE /api/so/01ARZ3NDEKTSV4RRFFQ69G5FAV
```

### Response (200 OK)
```json
{
  "message": "Sales order deleted successfully",
  "soNum": "SO-2024-00001"
}
```

### Error Responses
- `400 Bad Request` - Cannot delete order in current status
- `404 Not Found` - Sales order not found
- `401 Unauthorized` - Missing or invalid authentication

---

## 12. Filter and Query Endpoints

### 12.1 Get Orders by Customer

#### Endpoint
```http
GET /api/so/customer/:customerId
```

### 12.2 Get Orders by Status

#### Endpoint
```http
GET /api/so/status/:status
```

#### Status Values
- `OPEN` - Order is open for fulfillment
- `ON_HOLD` - Order is on hold
- `CLOSED` - Order is completed
- `CANCELLED` - Order is cancelled

### 12.3 Get Open Orders

#### Endpoint
```http
GET /api/so/open
```

### 12.4 Get Orders on Hold

#### Endpoint
```http
GET /api/so/on-hold
```

### 12.5 Get Summary Statistics

#### Endpoint
```http
GET /api/so/summary?customerId=1001
```

#### Query Parameters
- `customerId` (number, optional) - Filter by customer

#### Response (200 OK)
```json
{
  "totalOrders": 150,
  "totalAmount": 150000.00,
  "openOrders": 45,
  "onHoldOrders": 5,
  "closedOrders": 95,
  "cancelledOrders": 5,
  "averageOrderValue": 1000.00
}
```

---

## Common Error Response Format

All error responses follow this structure:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:00:00Z",
  "path": "/api/so/invalid-ulid"
}
```

---

## Data Type Reference

### Sales Order Status
- `OPEN` - Initial status for new orders
- `ON_HOLD` - Order temporarily paused
- `CLOSED` - Order completed
- `CANCELLED` - Order cancelled

### Line Status
- `OPEN` - Line is open for fulfillment
- `PARTIAL` - Line is partially shipped
- `CLOSED` - Line is fully shipped

### Common Field Types
- **ULID**: 26-character alphanumeric string (e.g., `01ARZ3NDEKTSV4RRFFQ69G5FAV`)
- **ISO 8601 Date**: `YYYY-MM-DDTHH:mm:ss.sssZ` (e.g., `2024-01-15T10:30:00.000Z`)
- **Currency**: Number with 2 decimal places
- **Percentage**: Number between 0 and 100

---

## Best Practices for Frontend Integration

### 1. Always Use ULID for Identifiers
```javascript
// ✅ Correct
const response = await fetch(`/api/so/${publicId}`);

// ❌ Wrong - sequential IDs are not supported
const response = await fetch(`/api/so/${id}`);
```

### 2. Use Grouped Properties
```javascript
// ✅ Correct - grouped pricing
const lineData = {
  itemCode: "WIDGET-001",
  orderQty: 10,
  unitPrice: 25.50,
  pricing: {
    discountPercent: 10,
    taxPercent: 8.25
  }
};

// ❌ Wrong - flat structure
const lineData = {
  itemCode: "WIDGET-001",
  orderQty: 10,
  unitPrice: 25.50,
  discountPercent: 10,
  taxPercent: 8.25
};
```

### 3. Handle Auto-Generated Values
```javascript
// Line number is auto-generated if omitted
const newLine = {
  itemCode: "WIDGET-001",
  orderQty: 10,
  unitPrice: 25.50
  // lineNum will be auto-generated
};
```

### 4. Use Appropriate Endpoints
```javascript
// ✅ Adding a single line
POST /api/so/${publicId}/lines

// ✅ Bulk update (add/update/delete multiple lines)
PATCH /api/so/${publicId}/with-lines

// ✅ Update only header
PATCH /api/so/${publicId}
```

### 5. Validate ULID Format
```javascript
function isValidULID(ulid) {
  return /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/.test(ulid);
}
```

---

## Version History
- **v1.0** (2024-01-19): Initial API documentation with ULID-based endpoints
