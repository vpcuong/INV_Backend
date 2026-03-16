# Purchase Order API

Base URL: `/api/po`

All endpoints require Bearer Token:
```
Authorization: Bearer <token>
```

---

## Enumerations

### PO Type (`type`)

| Value | Description |
|-------|-------------|
| `STANDARD` | Standard purchase order |
| `SUBCONTRACT` | Subcontracting PO — each line must be mapped to a Sales Order line |

### PO Header Status (`status`)

| Value | Description |
|-------|-------------|
| `DRAFT` | Draft — can edit header and lines |
| `APPROVED` | Approved |
| `PARTIALLY_RECEIVED` | Some lines received |
| `RECEIVED` | All lines fully received |
| `CLOSED` | Closed |
| `CANCELLED` | Cancelled |

### PO Line Status

| Value | Description |
|-------|-------------|
| `OPEN` | Awaiting receipt |
| `PARTIALLY_RECEIVED` | Partially received |
| `RECEIVED` | Fully received |
| `CANCELLED` | Cancelled |

---

## ID types

| Identifier | Format | Used in |
|------------|--------|---------|
| `id` | integer | `GET /:id`, `PATCH /:id`, `DELETE /:id` |
| `publicId` | ULID (26-char string) | All other endpoints, `linesToDelete[]` |

---

## Endpoints

### 1. List POs (offset pagination)

```
GET /api/po
```

Returns a flat array of PO headers with lines and supplier.

**Query params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `supplierId` | number | No | Filter by supplier |
| `status` | string | No | Filter by PO status |
| `type` | string | No | Filter by PO type (`STANDARD` or `SUBCONTRACT`) |
| `skip` | number | No | Offset (default: 0) |
| `take` | number | No | Page size (default: all) |

**Example:**
```
GET /api/po?type=SUBCONTRACT&status=APPROVED&skip=0&take=20
```

---

### 2. List POs (cursor pagination)

```
GET /api/po/cursor
```

Use this endpoint for infinite-scroll or large list scenarios. More efficient than offset pagination for large datasets.

**Query params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `cursor` | string | No | Opaque cursor from previous response's `nextCursor`. Omit for first page. |
| `limit` | number | No | Page size 1–100 (default: 20) |
| `supplierId` | number | No | Filter by supplier |
| `status` | string | No | Filter by PO status |
| `type` | string | No | Filter by PO type |
| `fromDate` | ISO date | No | Filter orderDate >= fromDate |
| `toDate` | ISO date | No | Filter orderDate <= toDate |

**Response shape:**

```json
{
  "data": [ /* array of PO objects */ ],
  "nextCursor": "eyJvcmRlckRhdGUiOiIyMDI2LTAzLTAxVDAwOjAwOjAwLjAwMFoiLCJwb051bSI6IlBPLTIwMjYtMDAxIn0",
  "hasMore": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | PO objects for this page |
| `nextCursor` | string \| null | Pass as `cursor` param to get next page. `null` when no more pages. |
| `hasMore` | boolean | Whether more records exist after this page |

**Usage pattern:**

```
// First page
GET /api/po/cursor?type=SUBCONTRACT&limit=20

// Next page — use nextCursor from previous response
GET /api/po/cursor?type=SUBCONTRACT&limit=20&cursor=<nextCursor>

// Keep paginating until hasMore === false
```

> **Important:** The cursor is opaque — do not parse or construct it manually. Always use the value returned from `nextCursor` as-is.

---

### 3. List POs by Supplier

```
GET /api/po/supplier/:supplierId
```

**Example:**
```
GET /api/po/supplier/1
```

---

### 4. Get PO by ID

```
GET /api/po/:id
```

Returns full PO with lines and supplier.

**Example:**
```
GET /api/po/10
```

---

### 5. Create PO

```
POST /api/po
```

**Standard PO request body:**

```json
{
  "supplierId": 1,
  "type": "STANDARD",
  "orderDate": "2026-03-09",
  "expectedDate": "2026-04-01",
  "note": "Monthly order",
  "lines": [
    {
      "skuPublicId": "01JNXXX...",
      "uomCode": "PCS",
      "orderQty": 100,
      "unitPrice": 50000,
      "description": "White T-shirt size M",
      "warehouseCode": "WH01",
      "note": ""
    }
  ]
}
```

**Subcontract PO request body:**

```json
{
  "supplierId": 5,
  "type": "SUBCONTRACT",
  "orderDate": "2026-03-09",
  "expectedDate": "2026-04-01",
  "note": "Gia công tháng 3",
  "lines": [
    {
      "skuPublicId": "01JNXXX...",
      "uomCode": "PCS",
      "orderQty": 500,
      "unitPrice": 20000,
      "soLinePublicId": "01JNSOLINE...",
      "warehouseCode": "WH01"
    }
  ]
}
```

**Header fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `supplierId` | number | **Yes** | Supplier ID |
| `type` | string | No | `STANDARD` (default) or `SUBCONTRACT` |
| `orderDate` | ISO date | No | Order date (default: today) |
| `expectedDate` | ISO date | No | Expected delivery date |
| `note` | string | No | Note |
| `lines` | array | No | Line items |

**Line fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `skuPublicId` | string | **Yes** | SKU public ID |
| `uomCode` | string | **Yes** | Unit of measure code |
| `orderQty` | number | **Yes** | Ordered quantity |
| `unitPrice` | number | **Yes** | Unit price |
| `soLinePublicId` | string | Required for SUBCONTRACT | Public ID of the SO line to map. Enforces 1:1 mapping — each SO line can only be mapped to one PO line at a time. |
| `description` | string | No | Line description |
| `warehouseCode` | string | No | Receiving warehouse |
| `note` | string | No | Line note |

**Business rules:**
- When `type = SUBCONTRACT`, at least one line must include `soLinePublicId` — otherwise HTTP 400
- Each `soLinePublicId` can only be used by one active PO line — attempting to map a SO line already in use returns HTTP 409
- When a SUBCONTRACT PO line is deleted or cancelled, its SO line mapping is released and can be remapped

---

### 6. Update PO (header + lines)

```
PATCH /api/po/:publicId/with-lines
```

Update header, add/edit/delete lines in a single request. Only allowed when PO status is **DRAFT**.

**Request body:**

```json
{
  "header": {
    "supplierId": 2,
    "expectedDate": "2026-04-15",
    "note": "Updated note"
  },
  "lines": [
    {
      "publicId": "01JNYYY...",
      "orderQty": 200,
      "unitPrice": 45000
    },
    {
      "skuPublicId": "01JNZZZ...",
      "uomCode": "PCS",
      "orderQty": 50,
      "unitPrice": 80000,
      "soLinePublicId": "01JNSOLINE2..."
    }
  ],
  "linesToDelete": ["01JNAAA...", "01JNBBB..."]
}
```

**Line processing rules:**

| Case | Condition | Action |
|------|-----------|--------|
| Add new line | `lines[]` entry has no `publicId` | Creates a new line |
| Update existing line | `lines[]` entry has `publicId` | Updates that line |
| Delete line | publicId in `linesToDelete` | Removes that line; releases SO line mapping if any |

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `header` | object | No | Header fields to update (omit entirely if no header changes) |
| `lines` | array | No | Lines to add or update |
| `lines[].publicId` | string | No | Present = update existing line; absent = add new line |
| `lines[].skuPublicId` | string | When adding | SKU public ID |
| `lines[].uomCode` | string | When adding | Unit of measure |
| `lines[].orderQty` | number | When adding | Ordered quantity |
| `lines[].unitPrice` | number | When adding | Unit price |
| `lines[].soLinePublicId` | string | No | SO line mapping (SUBCONTRACT only). Updating a line's own mapping is allowed. |
| `lines[].description` | string | No | Description |
| `lines[].warehouseCode` | string | No | Warehouse |
| `lines[].note` | string | No | Note |
| `linesToDelete` | string[] | No | publicIds of lines to delete |

**Minimal examples:**

```json
// Update header only
{ "header": { "note": "New note", "expectedDate": "2026-05-01" } }

// Add a new line
{ "lines": [{ "skuPublicId": "01JN...", "uomCode": "PCS", "orderQty": 10, "unitPrice": 100000 }] }

// Delete lines
{ "linesToDelete": ["01JNAAA...", "01JNBBB..."] }
```

---

### 7. Update PO Header only

```
PATCH /api/po/:id
```

Updates header fields only, does not touch lines.

```json
{
  "supplierId": 2,
  "expectedDate": "2026-04-15",
  "note": "New note"
}
```

---

### 8. Approve PO

```
PATCH /api/po/:publicId/approve
```

Transitions status: `DRAFT` → `APPROVED`. No request body.

---

### 9. Cancel PO

```
PATCH /api/po/:publicId/cancel
```

Transitions status to `CANCELLED`. All open lines are cancelled and their SO line mappings are released. No request body.

---

### 10. Close PO

```
PATCH /api/po/:publicId/close
```

Transitions status to `CLOSED`. No request body.

---

### 11. Delete PO

```
DELETE /api/po/:id
```

Only allowed when PO status is **DRAFT**.

---

## Business Flows

### Standard PO

```
POST /api/po  (type: STANDARD)
    ↓
PATCH /api/po/:publicId/with-lines  (edit if needed, status: DRAFT)
    ↓
PATCH /api/po/:publicId/approve  →  status: APPROVED
    ↓
Goods Receipt (inventory API)  →  receivedQty updated automatically
    ↓
status auto-transitions to PARTIALLY_RECEIVED or RECEIVED
    ↓
PATCH /api/po/:publicId/close
```

### Subcontract PO

```
// 1. Find available SO lines for subcontracting (via SO API)
GET /api/so?soType=PROCESSING&orderStatus=OPEN

// 2. Create SUBCONTRACT PO — map each PO line to one SO line
POST /api/po
{
  "type": "SUBCONTRACT",
  "supplierId": 5,
  "lines": [
    { "skuPublicId": "...", "orderQty": 500, "unitPrice": 20000, "soLinePublicId": "01JNSO..." }
  ]
}

// 3. Approve and receive as usual
PATCH /api/po/:publicId/approve
```

---

## Notes for AI Agents

- Always use `publicId` (ULID string) for approve/cancel/close/with-lines endpoints; use integer `id` for GET by id, PATCH header-only, DELETE
- The cursor in `GET /api/po/cursor` response is opaque — store and forward it as-is, never parse it
- `soLinePublicId` is only meaningful when `type = SUBCONTRACT`; sending it on a STANDARD PO line will still set the mapping but has no business meaning
- `receivedQty` on lines is read-only from this API — it is updated by the Goods Receipt API
- A PO line's `soLinePublicId` can be changed on update (pass new value), but the new SO line must not already be mapped to another PO line
