# Supplier API Documentation (Updated Schema)

## ⚠️ Schema Changes

Schema đã được cập nhật từ `ItemSupplierUOM` sang `SupplierItem` + `SupplierItemPackaging`.

**Thay đổi chính:**
- ✅ `supplierItems` thay vì `items`
- ✅ Thêm `supplierItemCode`, `currency`, `unitPrice`, `leadTimeDays`
- ✅ Hỗ trợ multi-level packaging (`SupplierItemPackaging`)
- ✅ Delete constraint: Restrict (phải xóa items trước khi xóa supplier)

---

## Base URL
```
http://localhost:3000/api/suppliers
```

## Response Structure

### Supplier Object
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Textiles Co.",
  "phone": "+84123456789",
  "email": "contact@abctextiles.com",
  "website": "https://abctextiles.com",
  "address": "123 Main Street",
  "city": "Ho Chi Minh City",
  "province": "Ho Chi Minh",
  "country": "Vietnam",
  "postalCode": "700000",
  "taxId": "0123456789",
  "contactPerson": "John Doe",
  "paymentTerms": "NET30",
  "status": "Active",
  "category": "Fabric",
  "rating": 4.5,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "createdBy": "admin",
  "sortOrder": 0
}
```

### SupplierItem Object (NEW)
```json
{
  "id": 1,
  "supplierId": 1,
  "itemId": 10,
  "supplierItemCode": "FAB-001-SUP",  // Mã hàng theo NCC
  "currency": "VND",                   // VND, USD,...
  "unitPrice": "50000.00",            // Decimal
  "leadTimeDays": 14,                 // Thời gian giao hàng
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### SupplierItemPackaging Object (NEW)
```json
{
  "id": 1,
  "supplierItemId": 1,
  "level": 1,              // 1 = cấp nhỏ nhất, 2 = lớn hơn,...
  "uomId": 2,
  "qtyPerPrevLevel": 100,  // Số lượng cấp trước trong cấp này
  "qtyToBase": 100,        // Tổng số base unit
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## 1. GET /api/suppliers - Lấy danh sách suppliers

**Response:**
```json
[
  {
    "id": 1,
    "code": "SUP001",
    "name": "ABC Textiles Co.",
    "isActive": true,
    "supplierItems": [
      {
        "id": 1,
        "supplierId": 1,
        "itemId": 10,
        "supplierItemCode": "FAB-001",
        "currency": "VND",
        "unitPrice": "50000.00",
        "leadTimeDays": 14,
        "isActive": true,
        "item": {
          "id": 10,
          "name": "Cotton Fabric"
        }
      }
    ]
  }
]
```

---

## 2. GET /api/suppliers/:id - Chi tiết supplier

**Response bao gồm packagings:**
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Textiles Co.",
  "supplierItems": [
    {
      "id": 1,
      "supplierId": 1,
      "itemId": 10,
      "supplierItemCode": "FAB-001",
      "currency": "VND",
      "unitPrice": "50000.00",
      "leadTimeDays": 14,
      "isActive": true,
      "item": {
        "id": 10,
        "name": "Cotton Fabric",
        "categoryId": 1
      },
      "packagings": [
        {
          "id": 1,
          "supplierItemId": 1,
          "level": 1,
          "uomId": 2,
          "qtyPerPrevLevel": 100,
          "qtyToBase": 100,
          "uom": {
            "id": 2,
            "code": "M",
            "name": "Meter"
          }
        },
        {
          "id": 2,
          "supplierItemId": 1,
          "level": 2,
          "uomId": 5,
          "qtyPerPrevLevel": 10,
          "qtyToBase": 1000,
          "uom": {
            "id": 5,
            "code": "ROLL",
            "name": "Roll"
          }
        }
      ]
    }
  ]
}
```

**Giải thích Packaging Levels:**
- **Level 1**: 1 METER = 100 EA (base unit)
- **Level 2**: 1 ROLL = 10 METER = 1000 EA
- `qtyPerPrevLevel`: Số lượng của cấp ngay trước
- `qtyToBase`: Tổng số base unit trong packaging này

---

## 3. POST /api/suppliers - Tạo supplier

**Request Body:**
```json
{
  "code": "SUP001",
  "name": "ABC Textiles Co.",
  "phone": "+84123456789",
  "email": "contact@abctextiles.com",
  "taxId": "0123456789",
  "category": "Fabric",
  "isActive": true
}
```

**Required Fields:**
- `code` (string, unique)
- `name` (string)

---

## 4. PATCH /api/suppliers/:id - Cập nhật

**Request Body (partial):**
```json
{
  "phone": "+84987654321",
  "rating": 5.0,
  "status": "Active"
}
```

---

## 5. DELETE /api/suppliers/:id - Xóa supplier

**⚠️ IMPORTANT:**
- Delete constraint: **RESTRICT**
- Phải xóa tất cả `SupplierItem` trước khi xóa supplier
- Nếu còn items, server sẽ trả về error

**Error Response (nếu còn items):**
```json
{
  "statusCode": 400,
  "message": "Cannot delete supplier with existing items",
  "error": "Bad Request"
}
```

---

## 6. PATCH /api/suppliers/:id/activate

Set `isActive = true`

---

## 7. PATCH /api/suppliers/:id/deactivate

Set `isActive = false`

---

## Frontend Integration Notes

### 1. Supplier Items Structure
```typescript
interface SupplierItem {
  id: number;
  supplierId: number;
  itemId: number;
  supplierItemCode?: string;  // Mã hàng của NCC
  currency?: string;          // VND, USD,...
  unitPrice?: string;         // Decimal as string
  leadTimeDays?: number;      // Thời gian giao hàng (ngày)
  isActive: boolean;
  item?: Item;                // Relation
  packagings?: SupplierItemPackaging[];
}

interface SupplierItemPackaging {
  id: number;
  supplierItemId: number;
  level: number;              // 1, 2, 3,...
  uomId: number;
  qtyPerPrevLevel: number;    // Qty của cấp trước trong cấp này
  qtyToBase?: number;         // Tổng số base unit
  uom?: UOM;
}
```

### 2. Displaying Packaging Levels

Hiển thị theo hierarchy:
```
Item: Cotton Fabric
├─ Level 1: 1 Meter = 100 EA
└─ Level 2: 1 Roll = 10 Meters = 1,000 EA
```

### 3. Price Calculation

```typescript
// Nếu mua 5 rolls (level 2)
const rolls = 5;
const rollPackaging = packagings.find(p => p.level === 2);
const totalEA = rolls * rollPackaging.qtyToBase; // 5 * 1000 = 5000 EA
const totalPrice = (unitPrice / 100) * totalEA; // Nếu unitPrice theo base unit
```

### 4. Delete Warning

Trước khi delete supplier:
```typescript
const supplier = await getSupplierById(id);
if (supplier.supplierItems && supplier.supplierItems.length > 0) {
  showWarning(
    `Cannot delete supplier "${supplier.name}". ` +
    `Please remove ${supplier.supplierItems.length} items first.`
  );
  return;
}
await deleteSupplier(id);
```

---

## Migration Notes

### Database Changes:
1. ✅ Dropped `ItemSupplierUOM` table
2. ✅ Created `SupplierItem` table
3. ✅ Created `SupplierItemPackaging` table
4. ✅ Foreign key constraints updated

### Breaking Changes:
- ❌ API response `items` → `supplierItems`
- ❌ Structure hoàn toàn khác
- ❌ Không còn `fromUOM`, `toUOM`, `conversionQty`
- ✅ Thay bằng multi-level packaging system

---

## Example Use Cases

### Use Case 1: Display Supplier with Items
```typescript
const supplier = await fetch('/api/suppliers/1').then(r => r.json());

console.log(`Supplier: ${supplier.name}`);
supplier.supplierItems.forEach(si => {
  console.log(`  - ${si.item.name}`);
  console.log(`    Code: ${si.supplierItemCode}`);
  console.log(`    Price: ${si.unitPrice} ${si.currency}`);
  console.log(`    Lead Time: ${si.leadTimeDays} days`);

  si.packagings?.forEach(pkg => {
    console.log(`    Level ${pkg.level}: ${pkg.uom.name} (${pkg.qtyToBase} EA)`);
  });
});
```

### Use Case 2: Calculate Order Price
```typescript
function calculateOrderPrice(
  supplierItem: SupplierItem,
  packagingLevel: number,
  quantity: number
): number {
  const packaging = supplierItem.packagings.find(p => p.level === packagingLevel);
  if (!packaging) throw new Error('Invalid packaging level');

  const totalBaseUnits = quantity * packaging.qtyToBase;
  const unitPrice = parseFloat(supplierItem.unitPrice);

  return totalBaseUnits * unitPrice;
}
```

---

## Swagger Documentation

Visit: `http://localhost:3000/api/docs`

Section: **suppliers**
