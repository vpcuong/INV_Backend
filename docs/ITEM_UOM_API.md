# ItemUOM API Documentation

## Base URL
```
http://localhost:3000/item-uom
```

## API Endpoints

### 1. Create ItemUOM
**POST** `/item-uom`

Tạo mới một ItemUOM (thêm UOM cho Item).

**Request Body:**
```json
{
  "itemId": 10,
  "uomId": 2,
  "toBaseFactor": 12,
  "roundingPrecision": 2,
  "isDefaultTransUom": false,
  "isPurchasingUom": false,
  "isSalesUom": true,
  "isManufacturingUom": false,
  "isActive": true
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "itemId": 10,
  "uomId": 2,
  "toBaseFactor": 12,
  "roundingPrecision": 2,
  "isDefaultTransUom": false,
  "isPurchasingUom": false,
  "isSalesUom": true,
  "isManufacturingUom": false,
  "isActive": true,
  "createdAt": "2024-12-17T10:00:00.000Z",
  "updatedAt": "2024-12-17T10:00:00.000Z",
  "item": {
    "id": 10,
    "name": "Classic T-Shirt",
    "uomId": 1
  },
  "uom": {
    "id": 2,
    "code": "DOZEN",
    "name": "Dozen"
  }
}
```

**Error Responses:**

**404 Not Found** - Item hoặc UOM không tồn tại:
```json
{
  "statusCode": 404,
  "message": "Item with ID 10 not found",
  "error": "Not Found"
}
```

**409 Conflict** - ItemUOM đã tồn tại:
```json
{
  "statusCode": 409,
  "message": "ItemUOM already exists for Item 10 and UOM 2",
  "error": "Conflict"
}
```

---

### 2. Get All ItemUOMs
**GET** `/item-uom`

Lấy danh sách tất cả ItemUOM với filter và pagination.

**Query Parameters:**
- `skip` (optional): Số bản ghi bỏ qua
- `take` (optional): Số bản ghi lấy về
- `itemId` (optional): Filter theo Item ID
- `uomId` (optional): Filter theo UOM ID
- `isActive` (optional): Filter theo trạng thái active (true/false)
- `isPurchasingUom` (optional): Filter UOM mua hàng (true/false)
- `isSalesUom` (optional): Filter UOM bán hàng (true/false)
- `isManufacturingUom` (optional): Filter UOM sản xuất (true/false)

**Example Requests:**
```
GET /item-uom?skip=0&take=10
GET /item-uom?itemId=10
GET /item-uom?isSalesUom=true&isActive=true
GET /item-uom?itemId=10&isActive=true
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "itemId": 10,
    "uomId": 1,
    "toBaseFactor": 1,
    "roundingPrecision": 2,
    "isDefaultTransUom": true,
    "isPurchasingUom": true,
    "isSalesUom": true,
    "isManufacturingUom": false,
    "isActive": true,
    "createdAt": "2024-12-17T10:00:00.000Z",
    "updatedAt": "2024-12-17T10:00:00.000Z",
    "item": {
      "id": 10,
      "name": "Classic T-Shirt",
      "uomId": 1
    },
    "uom": {
      "id": 1,
      "code": "PCS",
      "name": "Pieces"
    }
  },
  {
    "id": 2,
    "itemId": 10,
    "uomId": 2,
    "toBaseFactor": 12,
    "roundingPrecision": 2,
    "isDefaultTransUom": false,
    "isPurchasingUom": false,
    "isSalesUom": true,
    "isManufacturingUom": false,
    "isActive": true,
    "createdAt": "2024-12-17T10:01:00.000Z",
    "updatedAt": "2024-12-17T10:01:00.000Z",
    "item": {
      "id": 10,
      "name": "Classic T-Shirt",
      "uomId": 1
    },
    "uom": {
      "id": 2,
      "code": "DOZEN",
      "name": "Dozen"
    }
  }
]
```

---

### 3. Get ItemUOM by ID
**GET** `/item-uom/:id`

Lấy chi tiết một ItemUOM theo ID.

**Example Request:**
```
GET /item-uom/1
```

**Response (200 OK):**
```json
{
  "id": 1,
  "itemId": 10,
  "uomId": 1,
  "toBaseFactor": 1,
  "roundingPrecision": 2,
  "isDefaultTransUom": true,
  "isPurchasingUom": true,
  "isSalesUom": true,
  "isManufacturingUom": false,
  "isActive": true,
  "createdAt": "2024-12-17T10:00:00.000Z",
  "updatedAt": "2024-12-17T10:00:00.000Z",
  "item": {
    "id": 10,
    "name": "Classic T-Shirt",
    "uomId": 1,
    "uom": {
      "id": 1,
      "code": "PCS",
      "name": "Pieces"
    }
  },
  "uom": {
    "id": 1,
    "code": "PCS",
    "name": "Pieces"
  }
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "ItemUOM with ID 999 not found",
  "error": "Not Found"
}
```

---

### 4. Get All UOMs for an Item
**GET** `/item-uom/item/:itemId`

Lấy tất cả các UOM của một Item (sắp xếp theo toBaseFactor tăng dần).

**Example Request:**
```
GET /item-uom/item/10
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "itemId": 10,
    "uomId": 1,
    "toBaseFactor": 1,
    "roundingPrecision": 2,
    "isDefaultTransUom": true,
    "isPurchasingUom": true,
    "isSalesUom": true,
    "isManufacturingUom": false,
    "isActive": true,
    "createdAt": "2024-12-17T10:00:00.000Z",
    "updatedAt": "2024-12-17T10:00:00.000Z",
    "uom": {
      "id": 1,
      "code": "PCS",
      "name": "Pieces"
    }
  },
  {
    "id": 2,
    "itemId": 10,
    "uomId": 2,
    "toBaseFactor": 12,
    "roundingPrecision": 2,
    "isDefaultTransUom": false,
    "isPurchasingUom": false,
    "isSalesUom": true,
    "isManufacturingUom": false,
    "isActive": true,
    "createdAt": "2024-12-17T10:01:00.000Z",
    "updatedAt": "2024-12-17T10:01:00.000Z",
    "uom": {
      "id": 2,
      "code": "DOZEN",
      "name": "Dozen"
    }
  },
  {
    "id": 3,
    "itemId": 10,
    "uomId": 3,
    "toBaseFactor": 144,
    "roundingPrecision": 2,
    "isDefaultTransUom": false,
    "isPurchasingUom": false,
    "isSalesUom": false,
    "isManufacturingUom": false,
    "isActive": true,
    "createdAt": "2024-12-17T10:02:00.000Z",
    "updatedAt": "2024-12-17T10:02:00.000Z",
    "uom": {
      "id": 3,
      "code": "BOX",
      "name": "Box"
    }
  }
]
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Item with ID 999 not found",
  "error": "Not Found"
}
```

---

### 5. Get ItemUOM by Item ID and UOM ID
**GET** `/item-uom/item/:itemId/uom/:uomId`

Lấy ItemUOM theo Item ID và UOM ID.

**Example Request:**
```
GET /item-uom/item/10/uom/2
```

**Response (200 OK):**
```json
{
  "id": 2,
  "itemId": 10,
  "uomId": 2,
  "toBaseFactor": 12,
  "roundingPrecision": 2,
  "isDefaultTransUom": false,
  "isPurchasingUom": false,
  "isSalesUom": true,
  "isManufacturingUom": false,
  "isActive": true,
  "createdAt": "2024-12-17T10:01:00.000Z",
  "updatedAt": "2024-12-17T10:01:00.000Z",
  "item": {
    "id": 10,
    "name": "Classic T-Shirt",
    "uomId": 1
  },
  "uom": {
    "id": 2,
    "code": "DOZEN",
    "name": "Dozen"
  }
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "ItemUOM not found for Item 10 and UOM 999",
  "error": "Not Found"
}
```

---

### 6. Convert Quantity Between UOMs
**GET** `/item-uom/convert/:itemId/:fromUomId/:toUomId/:quantity`

Quy đổi số lượng giữa các UOM của một Item.

**Note**: Nếu `fromUomId` và `toUomId` giống nhau, API sẽ trả về số lượng gốc (không quy đổi).

**Example Requests:**
```
GET /item-uom/convert/10/2/1/5
// Convert 5 DOZEN to PCS

GET /item-uom/convert/10/1/3/1440
// Convert 1440 PCS to BOX

GET /item-uom/convert/10/2/2/100
// Same UOM - returns original quantity
```

**Response (200 OK):**

**Example 1** - Convert 5 DOZEN to PCS:
```json
{
  "itemId": 10,
  "fromUomId": 2,
  "toUomId": 1,
  "originalQuantity": 5,
  "convertedQuantity": 60
}
```
**Explanation**: 5 DOZEN × 12 = 60 PCS

**Example 2** - Convert 1440 PCS to BOX:
```json
{
  "itemId": 10,
  "fromUomId": 1,
  "toUomId": 3,
  "originalQuantity": 1440,
  "convertedQuantity": 10
}
```
**Explanation**: 1440 PCS ÷ 144 = 10 BOX

**Example 3** - Convert 100 PCS to DOZEN (with rounding):
```json
{
  "itemId": 10,
  "fromUomId": 1,
  "toUomId": 2,
  "originalQuantity": 100,
  "convertedQuantity": 8.33
}
```
**Explanation**: 100 PCS ÷ 12 = 8.33 DOZEN (rounded to 2 decimal places)

**Example 4** - Same UOM (no conversion):
```json
{
  "itemId": 10,
  "fromUomId": 2,
  "toUomId": 2,
  "originalQuantity": 100,
  "convertedQuantity": 100
}
```
**Explanation**: Khi fromUomId === toUomId, trả về số lượng gốc (không cần quy đổi)

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "ItemUOM not found for Item 10 and UOM 999",
  "error": "Not Found"
}
```

---

### 7. Update ItemUOM
**PATCH** `/item-uom/:id`

Cập nhật thông tin ItemUOM.

**Request Body:** (Tất cả fields đều optional)
```json
{
  "toBaseFactor": 12,
  "roundingPrecision": 3,
  "isDefaultTransUom": false,
  "isPurchasingUom": true,
  "isSalesUom": true,
  "isManufacturingUom": false,
  "isActive": true
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "itemId": 10,
  "uomId": 2,
  "toBaseFactor": 12,
  "roundingPrecision": 3,
  "isDefaultTransUom": false,
  "isPurchasingUom": true,
  "isSalesUom": true,
  "isManufacturingUom": false,
  "isActive": true,
  "createdAt": "2024-12-17T10:01:00.000Z",
  "updatedAt": "2024-12-17T11:00:00.000Z",
  "item": {
    "id": 10,
    "name": "Classic T-Shirt",
    "uomId": 1
  },
  "uom": {
    "id": 2,
    "code": "DOZEN",
    "name": "Dozen"
  }
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "ItemUOM with ID 999 not found",
  "error": "Not Found"
}
```

---

### 8. Delete ItemUOM
**DELETE** `/item-uom/:id`

Xóa ItemUOM.

**Example Request:**
```
DELETE /item-uom/2
```

**Response (200 OK):**
```json
{
  "id": 2,
  "itemId": 10,
  "uomId": 2,
  "toBaseFactor": 12,
  "roundingPrecision": 2,
  "isDefaultTransUom": false,
  "isPurchasingUom": false,
  "isSalesUom": true,
  "isManufacturingUom": false,
  "isActive": true,
  "createdAt": "2024-12-17T10:01:00.000Z",
  "updatedAt": "2024-12-17T10:01:00.000Z"
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "ItemUOM with ID 999 not found",
  "error": "Not Found"
}
```

---

## Use Cases & Examples

### Use Case 1: Setup Multi-UOM cho Item mới

**Scenario**: Setup UOM cho T-Shirt (Item ID: 10)
- Base UOM: PCS (ID: 1)
- Sales UOM: DOZEN (ID: 2) - 1 DOZEN = 12 PCS
- Purchasing UOM: CARTON (ID: 4) - 1 CARTON = 288 PCS

**Steps:**

1. **Tạo Base UOM** (PCS):
```bash
POST /item-uom
{
  "itemId": 10,
  "uomId": 1,
  "toBaseFactor": 1,
  "isDefaultTransUom": true,
  "isPurchasingUom": true,
  "isSalesUom": true
}
```

2. **Tạo Sales UOM** (DOZEN):
```bash
POST /item-uom
{
  "itemId": 10,
  "uomId": 2,
  "toBaseFactor": 12,
  "isSalesUom": true
}
```

3. **Tạo Purchasing UOM** (CARTON):
```bash
POST /item-uom
{
  "itemId": 10,
  "uomId": 4,
  "toBaseFactor": 288,
  "isPurchasingUom": true
}
```

---

### Use Case 2: Lấy UOM cho Form Dropdown

**Scenario**: Frontend cần load UOM options cho Item dropdown

```javascript
// 1. Lấy tất cả active UOM cho item
const response = await fetch('/item-uom/item/10');
const itemUoms = await response.json();

// 2. Transform cho dropdown
const uomOptions = itemUoms
  .filter(iu => iu.isActive)
  .map(iu => ({
    value: iu.uomId,
    label: `${iu.uom.code} - ${iu.uom.name}`,
    factor: iu.toBaseFactor,
  }));

// Result:
// [
//   { value: 1, label: "PCS - Pieces", factor: 1 },
//   { value: 2, label: "DOZEN - Dozen", factor: 12 },
//   { value: 4, label: "CARTON - Carton", factor: 288 }
// ]
```

---

### Use Case 3: Tính giá theo UOM

**Scenario**: Item có base price 250,000 VND/PCS. Tính giá cho các UOM khác.

```javascript
const basePricePerPcs = 250000;
const itemUoms = await fetch('/item-uom/item/10').then(r => r.json());

const prices = itemUoms.map(iu => ({
  uom: iu.uom.code,
  pricePerUnit: basePricePerPcs * iu.toBaseFactor,
}));

// Result:
// [
//   { uom: "PCS", pricePerUnit: 250000 },      // 250,000 VND/PCS
//   { uom: "DOZEN", pricePerUnit: 3000000 },   // 3,000,000 VND/DOZEN
//   { uom: "CARTON", pricePerUnit: 72000000 }  // 72,000,000 VND/CARTON
// ]
```

---

### Use Case 4: Quy đổi số lượng khi tạo đơn hàng

**Scenario**: Customer đặt 10 DOZEN, cần convert sang PCS để trừ inventory.

```javascript
// Option 1: Dùng API conversion
const result = await fetch('/item-uom/convert/10/2/1/10').then(r => r.json());
console.log(result.convertedQuantity); // 120 PCS

// Option 2: Tự tính
const dozenUom = await fetch('/item-uom/item/10/uom/2').then(r => r.json());
const pcsUom = await fetch('/item-uom/item/10/uom/1').then(r => r.json());

const quantityInDozen = 10;
const baseQty = quantityInDozen * dozenUom.toBaseFactor; // 10 × 12 = 120
const quantityInPcs = baseQty / pcsUom.toBaseFactor;     // 120 ÷ 1 = 120
```

---

### Use Case 5: Filter UOM theo nghiệp vụ

**Frontend Sales Form** - Chỉ hiển thị Sales UOM:
```javascript
const salesUoms = await fetch('/item-uom?itemId=10&isSalesUom=true&isActive=true')
  .then(r => r.json());
```

**Frontend Purchase Form** - Chỉ hiển thị Purchasing UOM:
```javascript
const purchaseUoms = await fetch('/item-uom?itemId=10&isPurchasingUom=true&isActive=true')
  .then(r => r.json());
```

---

## Validation Rules

### Create ItemUOM
- `itemId`: Required, must exist in Item table
- `uomId`: Required, must exist in UOM table
- Combination of `itemId` + `uomId` must be unique
- `toBaseFactor`: Required, must be > 0
- `roundingPrecision`: Optional, default = 2, must be >= 0

### Update ItemUOM
- All fields are optional
- Cannot change `itemId` or `uomId` (delete and recreate instead)
- `toBaseFactor`: Must be > 0 if provided
- `roundingPrecision`: Must be >= 0 if provided

---

## Business Logic

### Conversion Formula
```
baseQuantity = quantity × fromUom.toBaseFactor
targetQuantity = baseQuantity ÷ toUom.toBaseFactor
result = round(targetQuantity, toUom.roundingPrecision)
```

### Example Conversions

**Item**: T-Shirt
**Base UOM**: PCS (factor = 1)

| From | To | Quantity | Calculation | Result |
|------|------|----------|-------------|--------|
| DOZEN (12) | PCS (1) | 5 | 5 × 12 ÷ 1 | 60 PCS |
| PCS (1) | DOZEN (12) | 100 | 100 × 1 ÷ 12 | 8.33 DOZEN |
| CARTON (288) | BOX (144) | 2 | 2 × 288 ÷ 144 | 4 BOX |
| BOX (144) | PCS (1) | 10 | 10 × 144 ÷ 1 | 1440 PCS |

---

## Error Handling

### Common Errors

**400 Bad Request** - Invalid input:
```json
{
  "statusCode": 400,
  "message": [
    "itemId must be a number",
    "toBaseFactor must not be less than 0"
  ],
  "error": "Bad Request"
}
```

**404 Not Found** - Resource not found:
```json
{
  "statusCode": 404,
  "message": "Item with ID 999 not found",
  "error": "Not Found"
}
```

**409 Conflict** - Duplicate:
```json
{
  "statusCode": 409,
  "message": "ItemUOM already exists for Item 10 and UOM 2",
  "error": "Conflict"
}
```

---

## Tips for Frontend Integration

### 1. Cache ItemUOM Data
```javascript
// Cache UOMs per item to reduce API calls
const uomCache = new Map();

async function getItemUoms(itemId) {
  if (!uomCache.has(itemId)) {
    const data = await fetch(`/item-uom/item/${itemId}`).then(r => r.json());
    uomCache.set(itemId, data);
  }
  return uomCache.get(itemId);
}
```

### 2. Display UOM with Conversion Info
```javascript
function formatUomOption(itemUom) {
  const factor = itemUom.toBaseFactor;
  const baseUom = "PCS"; // Get from item.uom

  if (factor === 1) {
    return itemUom.uom.name; // "Pieces"
  } else {
    return `${itemUom.uom.name} (1 = ${factor} ${baseUom})`; // "Dozen (1 = 12 PCS)"
  }
}
```

### 3. Real-time Price Calculation
```javascript
function calculatePrice(quantity, uomId, basePricePerPcs, itemUoms) {
  const uom = itemUoms.find(u => u.uomId === uomId);
  if (!uom) return 0;

  const pricePerUnit = basePricePerPcs * uom.toBaseFactor;
  return quantity * pricePerUnit;
}

// Example:
// quantity = 5, uomId = 2 (DOZEN), basePricePerPcs = 250000
// pricePerUnit = 250000 × 12 = 3,000,000 VND/DOZEN
// total = 5 × 3,000,000 = 15,000,000 VND
```

---

## Summary

Module ItemUOM cung cấp đầy đủ các API để:
- ✅ Quản lý nhiều UOM cho một Item
- ✅ Quy đổi số lượng giữa các UOM
- ✅ Đánh dấu UOM mặc định cho từng nghiệp vụ (Sales, Purchasing, Manufacturing)
- ✅ Filter và search linh hoạt
- ✅ Validation đầy đủ để đảm bảo data integrity

Tất cả endpoints đều có Swagger documentation tại `/api` (Swagger UI).
