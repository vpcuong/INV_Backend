# Supplier Item Packaging API Documentation

## Overview

API để quản lý các cấp đóng gói (packaging levels) của supplier items. Mỗi supplier item có thể có nhiều cấp đóng gói với mối quan hệ hierarchical (level 1 < level 2 < level 3...).

## Base URL
```
http://localhost:3000/api/supplier-item-packagings
```

---

## Concepts

### Packaging Levels

**Level System:**
- **Level 1**: Cấp nhỏ nhất gần với base unit (EA)
- **Level 2**: Cấp lớn hơn level 1 (VD: Box chứa nhiều EA)
- **Level 3**: Cấp lớn hơn level 2 (VD: Carton chứa nhiều Box)
- ...và cứ thế tiếp tục

**Key Fields:**
- `qtyPerPrevLevel`: Số lượng của **cấp ngay trước** trong cấp này
  - Level 1: số EA trong 1 unit level 1
  - Level 2: số unit level 1 trong 1 unit level 2
  - Level 3: số unit level 2 trong 1 unit level 3

- `qtyToBase`: Tổng số **base units (EA)** trong 1 unit cấp này
  - Level 1: = qtyPerPrevLevel (vì prev = EA)
  - Level 2: = qtyPerPrevLevel × level1.qtyToBase
  - Level 3: = qtyPerPrevLevel × level2.qtyToBase

### Example

```
Item: Cotton T-Shirt
├─ Level 1: 1 BAG = 12 EA         (qtyPerPrevLevel: 12, qtyToBase: 12)
├─ Level 2: 1 BOX = 5 BAG         (qtyPerPrevLevel: 5,  qtyToBase: 60)
└─ Level 3: 1 CTN = 10 BOX        (qtyPerPrevLevel: 10, qtyToBase: 600)
```

---

## Endpoints

### 1. POST /supplier-item-packagings - Tạo packaging level mới

**Request Body:**
```json
{
  "supplierItemId": 1,
  "level": 1,
  "uomId": 5,
  "qtyPerPrevLevel": 12,
  "qtyToBase": 12
}
```

**Required Fields:**
- `supplierItemId` (integer): ID của supplier item
- `level` (integer, ≥1): Cấp đóng gói
- `uomId` (integer): ID của UOM (BAG, BOX, CTN,...)
- `qtyPerPrevLevel` (integer, ≥1): Số lượng cấp trước trong cấp này

**Optional Fields:**
- `qtyToBase` (integer): Tổng số EA. Nếu không cung cấp, sẽ tự động tính

**Business Rules:**
- ⚠️ Phải tạo level theo thứ tự: 1 → 2 → 3...
- ⚠️ Không thể tạo level 2 nếu chưa có level 1
- ⚠️ Mỗi supplier item chỉ có 1 dòng cho mỗi level
- ✅ `qtyToBase` sẽ tự động tính nếu không cung cấp

**Response (201):**
```json
{
  "id": 1,
  "supplierItemId": 1,
  "level": 1,
  "uomId": 5,
  "qtyPerPrevLevel": 12,
  "qtyToBase": 12,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "uom": {
    "id": 5,
    "code": "BAG",
    "name": "Bag"
  },
  "supplierItem": {
    "id": 1,
    "supplierItemCode": "T-SHIRT-001",
    "item": {
      "id": 10,
      "name": "Cotton T-Shirt"
    },
    "supplier": {
      "id": 1,
      "name": "ABC Supplier"
    }
  }
}
```

**Errors:**
- `400`: Validation error hoặc missing previous level
- `404`: Supplier item hoặc UOM không tồn tại
- `409`: Level đã tồn tại cho supplier item này

---

### 2. GET /supplier-item-packagings - Lấy tất cả packagings

**Response (200):**
```json
[
  {
    "id": 1,
    "supplierItemId": 1,
    "level": 1,
    "qtyPerPrevLevel": 12,
    "qtyToBase": 12,
    "uom": { "code": "BAG", "name": "Bag" },
    "supplierItem": {
      "item": { "name": "Cotton T-Shirt" },
      "supplier": { "name": "ABC Supplier" }
    }
  }
]
```

**Use Cases:**
- Admin view tất cả packagings
- Export/Report

---

### 3. GET /supplier-item-packagings/supplier-item/:supplierItemId

Lấy tất cả packaging levels cho 1 supplier item cụ thể.

**Parameters:**
- `supplierItemId` (path): ID của supplier item

**Response (200):**
```json
[
  {
    "id": 1,
    "level": 1,
    "qtyPerPrevLevel": 12,
    "qtyToBase": 12,
    "uom": { "code": "BAG", "name": "Bag" }
  },
  {
    "id": 2,
    "level": 2,
    "qtyPerPrevLevel": 5,
    "qtyToBase": 60,
    "uom": { "code": "BOX", "name": "Box" }
  },
  {
    "id": 3,
    "level": 3,
    "qtyPerPrevLevel": 10,
    "qtyToBase": 600,
    "uom": { "code": "CTN", "name": "Carton" }
  }
]
```

**Use Cases:**
- Hiển thị packaging hierarchy cho 1 supplier item
- Chọn UOM khi tạo purchase order
- Calculate pricing theo packaging level

**Error:**
- `404`: Supplier item không tồn tại

---

### 4. GET /supplier-item-packagings/:id - Chi tiết packaging

**Response (200):**
```json
{
  "id": 1,
  "supplierItemId": 1,
  "level": 1,
  "uomId": 5,
  "qtyPerPrevLevel": 12,
  "qtyToBase": 12,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "uom": {
    "id": 5,
    "code": "BAG",
    "name": "Bag"
  },
  "supplierItem": {
    "id": 1,
    "supplierItemCode": "T-SHIRT-001",
    "item": { "name": "Cotton T-Shirt" },
    "supplier": { "name": "ABC Supplier" }
  }
}
```

---

### 5. PATCH /supplier-item-packagings/:id - Cập nhật packaging

**Request Body (partial):**
```json
{
  "qtyPerPrevLevel": 15,
  "qtyToBase": 15
}
```

**⚠️ Important:**
- Nếu update `qtyPerPrevLevel` của level thấp, cần recalculate các level cao hơn
- Sử dụng endpoint `/recalculate` sau khi update

**Response (200):**
```json
{
  "id": 1,
  "supplierItemId": 1,
  "level": 1,
  "qtyPerPrevLevel": 15,
  "qtyToBase": 15,
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

### 6. DELETE /supplier-item-packagings/:id - Xóa packaging

**⚠️ Important:**
- Xóa level thấp có thể làm invalid các level cao hơn
- Nên xóa từ level cao → thấp

**Response (200):**
```json
{
  "id": 1,
  "level": 1,
  "supplierItemId": 1
}
```

---

### 7. POST /supplier-item-packagings/supplier-item/:supplierItemId/recalculate

**Recalculate tất cả `qtyToBase` cho tất cả levels của supplier item.**

Sử dụng khi:
- Sau khi update `qtyPerPrevLevel` của level thấp
- Để đảm bảo tất cả calculations đều chính xác

**Response (200):**
```json
[
  {
    "id": 1,
    "level": 1,
    "qtyPerPrevLevel": 15,
    "qtyToBase": 15
  },
  {
    "id": 2,
    "level": 2,
    "qtyPerPrevLevel": 5,
    "qtyToBase": 75
  },
  {
    "id": 3,
    "level": 3,
    "qtyPerPrevLevel": 10,
    "qtyToBase": 750
  }
]
```

---

## Frontend Integration

### TypeScript Interfaces

```typescript
interface SupplierItemPackaging {
  id: number;
  supplierItemId: number;
  level: number;
  uomId: number;
  qtyPerPrevLevel: number;
  qtyToBase?: number;
  createdAt: string;
  updatedAt: string;
  uom?: UOM;
  supplierItem?: SupplierItem;
}

interface UOM {
  id: number;
  code: string;
  name: string;
  description?: string;
}
```

### Example: Display Packaging Hierarchy

```typescript
async function displayPackagingHierarchy(supplierItemId: number) {
  const packagings = await fetch(
    `/api/supplier-item-packagings/supplier-item/${supplierItemId}`
  ).then(r => r.json());

  console.log('Packaging Hierarchy:');
  packagings.forEach(pkg => {
    const prevQty = pkg.level === 1 ? 'EA' : `Level ${pkg.level - 1}`;
    console.log(
      `Level ${pkg.level}: 1 ${pkg.uom.code} = ${pkg.qtyPerPrevLevel} ${prevQty} (Total: ${pkg.qtyToBase} EA)`
    );
  });
}

// Output:
// Level 1: 1 BAG = 12 EA (Total: 12 EA)
// Level 2: 1 BOX = 5 Level 1 (Total: 60 EA)
// Level 3: 1 CTN = 10 Level 2 (Total: 600 EA)
```

### Example: Create Packaging Levels

```typescript
async function setupPackaging(supplierItemId: number) {
  // Level 1: BAG
  const level1 = await createPackaging({
    supplierItemId,
    level: 1,
    uomId: 5, // BAG
    qtyPerPrevLevel: 12, // 12 EA per bag
  });

  // Level 2: BOX
  const level2 = await createPackaging({
    supplierItemId,
    level: 2,
    uomId: 6, // BOX
    qtyPerPrevLevel: 5, // 5 bags per box
    // qtyToBase will be auto-calculated: 5 × 12 = 60
  });

  // Level 3: CARTON
  const level3 = await createPackaging({
    supplierItemId,
    level: 3,
    uomId: 7, // CTN
    qtyPerPrevLevel: 10, // 10 boxes per carton
    // qtyToBase will be auto-calculated: 10 × 60 = 600
  });
}
```

### Example: Calculate Order Quantity

```typescript
interface OrderLine {
  packagingLevel: number;
  quantity: number;
}

async function calculateTotalEA(
  supplierItemId: number,
  orderLine: OrderLine
): Promise<number> {
  const packagings = await fetch(
    `/api/supplier-item-packagings/supplier-item/${supplierItemId}`
  ).then(r => r.json());

  const packaging = packagings.find(p => p.level === orderLine.packagingLevel);
  if (!packaging) throw new Error('Invalid packaging level');

  return orderLine.quantity * packaging.qtyToBase;
}

// Example usage:
// Order: 5 Cartons (level 3)
const totalEA = await calculateTotalEA(1, { packagingLevel: 3, quantity: 5 });
// Result: 5 × 600 = 3000 EA
```

### Example: Update and Recalculate

```typescript
async function updateLevel1AndRecalculate(
  packagingId: number,
  supplierItemId: number,
  newQtyPerPrevLevel: number
) {
  // Update level 1
  await fetch(`/api/supplier-item-packagings/${packagingId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qtyPerPrevLevel: newQtyPerPrevLevel,
      qtyToBase: newQtyPerPrevLevel, // For level 1
    }),
  });

  // Recalculate all levels
  const updated = await fetch(
    `/api/supplier-item-packagings/supplier-item/${supplierItemId}/recalculate`,
    { method: 'POST' }
  ).then(r => r.json());

  console.log('Updated packaging levels:', updated);
}
```

---

## Validation & Business Rules

### Creating Packaging

✅ **Valid:**
```javascript
// Create level 1 first
POST { supplierItemId: 1, level: 1, uomId: 5, qtyPerPrevLevel: 12 }

// Then create level 2
POST { supplierItemId: 1, level: 2, uomId: 6, qtyPerPrevLevel: 5 }
```

❌ **Invalid:**
```javascript
// Cannot create level 2 without level 1
POST { supplierItemId: 1, level: 2, uomId: 6, qtyPerPrevLevel: 5 }
// Error: Cannot create level 2 without level 1
```

### Unique Constraint

❌ **Duplicate level:**
```javascript
// Already exists: supplierItemId=1, level=1
POST { supplierItemId: 1, level: 1, uomId: 7, qtyPerPrevLevel: 10 }
// Error: Packaging level 1 already exists for supplier item 1
```

### Updating Best Practices

1. **Update lower levels** → Recalculate
```javascript
PATCH /supplier-item-packagings/1 { qtyPerPrevLevel: 15 }
POST  /supplier-item-packagings/supplier-item/1/recalculate
```

2. **Update higher levels** → No recalculation needed
```javascript
PATCH /supplier-item-packagings/3 { qtyPerPrevLevel: 12 }
// Only affects level 3, no cascade
```

---

## Common Workflows

### Workflow 1: Setup New Supplier Item Packaging

```
1. Create supplier item
2. Create level 1 packaging (closest to base unit)
3. Create level 2 packaging (if needed)
4. Create level 3 packaging (if needed)
5. Verify with GET /supplier-item/:id
```

### Workflow 2: Update Packaging Structure

```
1. Identify which level to update
2. PATCH the packaging level
3. If updated level < 3, run recalculate
4. Verify updated values
```

### Workflow 3: Remove Packaging Level

```
1. Start from highest level
2. DELETE level 3
3. DELETE level 2 (if needed)
4. DELETE level 1 (if needed)
```

---

## Error Handling

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Cannot create level N without level N-1 | Create levels in order (1→2→3) |
| 400 | Previous level does not have qtyToBase calculated | Recalculate previous levels |
| 404 | Supplier item not found | Verify supplierItemId exists |
| 404 | UOM not found | Verify uomId exists |
| 409 | Level already exists | Use PATCH to update, or choose different level |

---

## Swagger Documentation

Visit: `http://localhost:3000/api/docs`

Section: **supplier-item-packagings**

---

## Notes

1. **Auto-calculation**: `qtyToBase` được tự động tính nếu không cung cấp
2. **Level order**: Luôn tạo levels theo thứ tự tăng dần
3. **Cascade updates**: Update level thấp cần recalculate levels cao hơn
4. **Delete order**: Nên xóa từ level cao xuống thấp
5. **Unique constraint**: (supplierItemId, level) phải unique
