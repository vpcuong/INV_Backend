# Create Item API Documentation

## Endpoint
```
POST /items
Content-Type: application/json
```

## Request Body Schema

### Required Fields
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `code` | string | Unique item code | Max 10 characters, Required |
| `categoryId` | number | Item Category ID | Integer, Min 1, Required |
| `itemTypeId` | number | Item Type ID | Integer, Min 1, Required |

### Optional Fields
| Field | Type | Description | Default | Validation |
|-------|------|-------------|---------|------------|
| `materialId` | number \| null | Material ID | null | Integer, Min 1 |
| `uomCode` | string \| null | Unit of Measure code | null | Max 10 characters |
| `purchasingPrice` | number \| null | Purchasing/cost price | null | Min 0 |
| `sellingPrice` | number \| null | Selling/retail price | null | Min 0 |
| `lengthCm` | number \| null | Length in centimeters | null | Min 0 |
| `widthCm` | number \| null | Width in centimeters | null | Min 0 |
| `heightCm` | number \| null | Height in centimeters | null | Min 0 |
| `weightG` | number \| null | Weight in grams | null | Min 0 |
| `desc` | string \| null | Item description | null | Max 200 characters |
| `status` | string | Item status | "active" | Enum: "active", "inactive" |
| `isPurchasable` | boolean | Can be purchased? | false | Boolean |
| `isSellable` | boolean | Can be sold? | false | Boolean |
| `isManufactured` | boolean | Is manufactured? | false | Boolean |

## Master Data APIs (Required for Dropdowns)

Before creating an item, frontend needs to fetch these master data:

### 1. Item Categories
```
GET /item-categories?limit=100
```
Response:
```json
{
  "data": [
    { "id": 1, "code": "FAB", "desc": "Fabric", "isActive": true },
    { "id": 2, "code": "ACC", "desc": "Accessories", "isActive": true }
  ],
  "pagination": { ... }
}
```

### 2. Item Types
```
GET /item-types?limit=100
```
Response:
```json
{
  "data": [
    { "id": 1, "code": "RAW", "desc": "Raw Material", "isActive": true },
    { "id": 2, "code": "FIN", "desc": "Finished Goods", "isActive": true }
  ],
  "pagination": { ... }
}
```

### 3. Materials
```
GET /materials?limit=100
```
Response:
```json
{
  "data": [
    { "id": 1, "code": "COT", "desc": "Cotton", "isActive": true },
    { "id": 2, "code": "POL", "desc": "Polyester", "isActive": true }
  ],
  "pagination": { ... }
}
```

### 4. UOMs (Unit of Measure)
```
GET /uoms?limit=100
```
Response:
```json
{
  "data": [
    { "code": "PCS", "desc": "Pieces" },
    { "code": "MTR", "desc": "Meter" },
    { "code": "KG", "desc": "Kilogram" },
    { "code": "SET", "desc": "Set" }
  ]
}
```

## Request Examples

### Example 1: Minimal Request (Required Fields Only)
```json
{
  "code": "FABRIC001",
  "categoryId": 1,
  "itemTypeId": 2
}
```

### Example 2: Complete Request (All Fields)
```json
{
  "code": "FABRIC001",
  "categoryId": 1,
  "itemTypeId": 2,
  "materialId": 5,
  "uomCode": "MTR",
  "purchasingPrice": 15.50,
  "sellingPrice": 25.99,
  "lengthCm": 100.0,
  "widthCm": 150.0,
  "heightCm": 0.5,
  "weightG": 250.0,
  "desc": "Premium cotton fabric for t-shirts",
  "status": "active",
  "isPurchasable": true,
  "isSellable": true,
  "isManufactured": false
}
```

### Example 3: Purchasable Item (Can Buy)
```json
{
  "code": "THREAD001",
  "categoryId": 2,
  "itemTypeId": 1,
  "materialId": 3,
  "uomCode": "PCS",
  "purchasingPrice": 5.00,
  "desc": "High-quality polyester thread",
  "isPurchasable": true,
  "isSellable": false,
  "isManufactured": false
}
```

### Example 4: Sellable Item (Can Sell)
```json
{
  "code": "TSHIRT001",
  "categoryId": 3,
  "itemTypeId": 2,
  "uomCode": "PCS",
  "sellingPrice": 150.00,
  "desc": "Cotton t-shirt - Blue color",
  "isPurchasable": false,
  "isSellable": true,
  "isManufactured": true
}
```

## Response

### Success Response (201 Created)
```json
{
  "id": 123,
  "code": "FABRIC001",
  "categoryId": 1,
  "itemTypeId": 2,
  "materialId": 5,
  "uomCode": "MTR",
  "purchasingPrice": 15.50,
  "sellingPrice": 25.99,
  "lengthCm": 100.0,
  "widthCm": 150.0,
  "heightCm": 0.5,
  "weightG": 250.0,
  "desc": "Premium cotton fabric for t-shirts",
  "status": "active",
  "isPurchasable": true,
  "isSellable": true,
  "isManufactured": false,
  "createdAt": "2026-01-05T04:00:00.000Z",
  "updatedAt": "2026-01-05T04:00:00.000Z"
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "code must be shorter than or equal to 10 characters",
    "categoryId must be a number"
  ],
  "error": "Bad Request"
}
```

#### 409 Conflict - Duplicate Code
```json
{
  "statusCode": 409,
  "message": "Item with code 'FABRIC001' already exists",
  "error": "Conflict"
}
```

#### 404 Not Found - Invalid Foreign Key
```json
{
  "statusCode": 404,
  "message": "Item category with ID 999 not found",
  "error": "Not Found"
}
```

## Frontend Implementation Guide

### TypeScript Interface
```typescript
// types/item.types.ts
export interface CreateItemRequest {
  // Required
  code: string;
  categoryId: number;
  itemTypeId: number;

  // Optional
  materialId?: number | null;
  uomCode?: string | null;
  purchasingPrice?: number | null;
  sellingPrice?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  weightG?: number | null;
  desc?: string | null;
  status?: 'active' | 'inactive';
  isPurchasable?: boolean;
  isSellable?: boolean;
  isManufactured?: boolean;
}

export interface ItemResponse extends CreateItemRequest {
  id: number;
  createdAt: string;
  updatedAt: string;
}
```

### React Hook Form Example (with Zod)
```typescript
import { z } from 'zod';

export const createItemSchema = z.object({
  code: z.string()
    .min(1, 'Code is required')
    .max(10, 'Code must be 10 characters or less')
    .regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers'),

  categoryId: z.number()
    .int('Must be a valid category')
    .min(1, 'Category is required'),

  itemTypeId: z.number()
    .int('Must be a valid item type')
    .min(1, 'Item type is required'),

  materialId: z.number().int().min(1).nullable().optional(),
  uomCode: z.string().max(10).nullable().optional(),

  purchasingPrice: z.number()
    .min(0, 'Price cannot be negative')
    .nullable()
    .optional(),

  sellingPrice: z.number()
    .min(0, 'Price cannot be negative')
    .nullable()
    .optional(),

  lengthCm: z.number().min(0).nullable().optional(),
  widthCm: z.number().min(0).nullable().optional(),
  heightCm: z.number().min(0).nullable().optional(),
  weightG: z.number().min(0).nullable().optional(),

  desc: z.string()
    .max(200, 'Description must be 200 characters or less')
    .nullable()
    .optional(),

  status: z.enum(['active', 'inactive']).default('active'),
  isPurchasable: z.boolean().default(false),
  isSellable: z.boolean().default(false),
  isManufactured: z.boolean().default(false),
});

export type CreateItemFormData = z.infer<typeof createItemSchema>;
```

### API Service Example (Axios)
```typescript
// services/item.service.ts
import axios from 'axios';
import { CreateItemRequest, ItemResponse } from '@/types/item.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const itemService = {
  async createItem(data: CreateItemRequest): Promise<ItemResponse> {
    const response = await axios.post<ItemResponse>(
      `${API_URL}/items`,
      data
    );
    return response.data;
  },

  async getItemCategories() {
    const response = await axios.get(`${API_URL}/item-categories?limit=100`);
    return response.data.data;
  },

  async getItemTypes() {
    const response = await axios.get(`${API_URL}/item-types?limit=100`);
    return response.data.data;
  },

  async getMaterials() {
    const response = await axios.get(`${API_URL}/materials?limit=100`);
    return response.data.data;
  },

  async getUoms() {
    const response = await axios.get(`${API_URL}/uoms?limit=100`);
    return response.data.data;
  },
};
```

## Business Rules

1. **Code Uniqueness**: Item code must be unique across all items
2. **Category & Type**: Must exist in their respective master data tables
3. **Material**: Optional, but if provided must exist in materials table
4. **UOM**: Optional, but if provided must exist in UOM table
5. **Prices**: Cannot be negative
6. **Dimensions**: Cannot be negative
7. **Status**: Defaults to "active" if not provided
8. **Flags**: All boolean flags default to `false`

## Notes for Frontend Team

1. **Fetch Master Data First**: Always load item categories, types, materials, and UOMs before rendering the form
2. **Code Format**: Use uppercase letters and numbers only (e.g., "FABRIC001", not "fabric001")
3. **Price Precision**: Backend stores prices as Float, consider using 2 decimal places in UI
4. **Dimensions**: All dimensions are in metric units (cm for length, g for weight)
5. **Status Toggle**: Consider using a switch/toggle for status instead of dropdown
6. **Boolean Flags**: Use checkboxes for isPurchasable, isSellable, isManufactured
7. **Validation**: Implement client-side validation before submitting to reduce API errors
8. **Error Handling**: Display validation errors next to relevant form fields