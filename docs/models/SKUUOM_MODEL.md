# SKUUOM Model Documentation

## Overview

Model **SKUUOM** (SKU Unit of Measure) là bảng quản lý các đơn vị tính thay thế (alternate UOMs) cho từng SKU cụ thể. Tương tự như ItemUOM, SKUUOM cho phép một SKU có nhiều đơn vị tính khác nhau với hệ số quy đổi riêng.

## Schema Definition

```prisma
model SKUUOM {
  id    Int @id @default(autoincrement())
  skuId Int
  uomId Int

  toBaseFactor Decimal @db.Decimal(18, 6)
  roundingPrecision Int? @default(2)

  isDefaultTransUom  Boolean @default(false)
  isPurchasingUom    Boolean @default(false)
  isSalesUom         Boolean @default(false)
  isManufacturingUom Boolean @default(false)

  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sku ItemSKU @relation(fields: [skuId], references: [id], onUpdate: Cascade, onDelete: Cascade)
  uom UOM     @relation("SKUUOMs", fields: [uomId], references: [id], onUpdate: Cascade, onDelete: Restrict)

  @@unique([skuId, uomId], name: "ux_sku_uom_once")
  @@index([skuId], name: "ix_skuuom_sku")
  @@index([uomId], name: "ix_skuuom_uom")
  @@map("SKUUOM")
}
```

## Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | Int | Yes | Auto | Primary key |
| `skuId` | Int | Yes | - | Reference to ItemSKU |
| `uomId` | Int | Yes | - | Reference to UOM (alternate UOM) |
| `toBaseFactor` | Decimal(18,6) | Yes | - | Conversion factor to SKU's base UOM |
| `roundingPrecision` | Int | No | 2 | Number of decimal places for rounding |
| `isDefaultTransUom` | Boolean | No | false | Default transaction UOM for this SKU |
| `isPurchasingUom` | Boolean | No | false | Used for purchasing |
| `isSalesUom` | Boolean | No | false | Used for sales |
| `isManufacturingUom` | Boolean | No | false | Used for manufacturing |
| `isActive` | Boolean | No | true | Active status |
| `createdAt` | DateTime | Yes | now() | Creation timestamp |
| `updatedAt` | DateTime | Yes | - | Last update timestamp |

## Conversion Logic

### Base UOM vs Alternate UOM

- **Base UOM**: Được lưu trong `ItemSKU.uomId` - đơn vị tính cơ sở của SKU
- **Alternate UOM**: Được lưu trong bảng SKUUOM - các đơn vị tính thay thế

### Conversion Factor (toBaseFactor)

`toBaseFactor` là hệ số quy đổi từ UOM hiện tại về Base UOM của SKU.

**Công thức:**
```
1 (alternate UOM) = toBaseFactor × 1 (base UOM)
```

**Ví dụ:**
- SKU có base UOM = PCS (Pieces)
- Muốn thêm UOM DOZEN (12 pieces)
  - `toBaseFactor = 12` (1 DOZEN = 12 PCS)
- Muốn thêm UOM BOX (120 pieces)
  - `toBaseFactor = 120` (1 BOX = 120 PCS)

### Quy đổi giữa các UOM

Để quy đổi từ UOM A sang UOM B:
1. Quy đổi từ A về Base UOM: `qty_base = qty_A × toBaseFactor_A`
2. Quy đổi từ Base UOM sang B: `qty_B = qty_base ÷ toBaseFactor_B`

**Ví dụ quy đổi:**
```
SKU có:
- Base UOM: PCS
- DOZEN: toBaseFactor = 12
- BOX: toBaseFactor = 120

Quy đổi 5 DOZEN sang BOX:
1. 5 DOZEN → PCS: 5 × 12 = 60 PCS
2. 60 PCS → BOX: 60 ÷ 120 = 0.5 BOX
```

## Business Use Cases

### 1. Sales Order

Khi khách hàng đặt hàng theo DOZEN nhưng xuất kho theo PCS:

```typescript
// Order: 10 DOZEN
// SKU base UOM: PCS
// SKUUOM: DOZEN với toBaseFactor = 12

const orderQty = 10; // DOZEN
const toBaseFactor = 12;
const qtyInPCS = orderQty * toBaseFactor; // 120 PCS
```

### 2. Purchase Order

Mua hàng theo BOX nhưng nhập kho theo PCS:

```typescript
// Purchase: 2 BOX
// SKU base UOM: PCS
// SKUUOM: BOX với toBaseFactor = 144

const purchaseQty = 2; // BOX
const toBaseFactor = 144;
const qtyInPCS = purchaseQty * toBaseFactor; // 288 PCS
```

### 3. Manufacturing

Sản xuất theo PAIR nhưng quản lý tồn kho theo PCS:

```typescript
// Production: 500 PAIR
// SKU base UOM: PCS
// SKUUOM: PAIR với toBaseFactor = 2

const productionQty = 500; // PAIR
const toBaseFactor = 2;
const qtyInPCS = productionQty * toBaseFactor; // 1000 PCS
```

## Constraints and Validations

### 1. Unique Constraint
- Mỗi SKU chỉ có **một** SKUUOM record cho mỗi UOM
- Constraint: `ux_sku_uom_once` trên `[skuId, uomId]`

### 2. Business Rules
- `toBaseFactor` phải > 0
- Không được tạo SKUUOM với `uomId` trùng với `ItemSKU.uomId` (base UOM)
- Nên có tối đa **một** UOM với `isDefaultTransUom = true` cho mỗi SKU

### 3. Rounding Precision
- Mặc định: 2 chữ số thập phân
- Có thể điều chỉnh tùy theo yêu cầu nghiệp vụ
- VD: 0 cho số nguyên, 3 cho độ chính xác cao

### 4. Default Flags
- Chỉ nên có **một** UOM với `isDefaultTransUom = true` cho mỗi SKU
- Có thể có nhiều UOM với các flags khác (isPurchasing, isSales, isManufacturing)

## Database Table

```sql
CREATE TABLE "SKUUOM" (
    "id" SERIAL NOT NULL,
    "skuId" INTEGER NOT NULL,
    "uomId" INTEGER NOT NULL,
    "toBaseFactor" DECIMAL(18,6) NOT NULL,
    "roundingPrecision" INTEGER DEFAULT 2,
    "isDefaultTransUom" BOOLEAN NOT NULL DEFAULT false,
    "isPurchasingUom" BOOLEAN NOT NULL DEFAULT false,
    "isSalesUom" BOOLEAN NOT NULL DEFAULT false,
    "isManufacturingUom" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SKUUOM_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SKUUOM_skuId_uomId_key" ON "SKUUOM"("skuId", "uomId");
CREATE INDEX "ix_skuuom_sku" ON "SKUUOM"("skuId");
CREATE INDEX "ix_skuuom_uom" ON "SKUUOM"("uomId");

ALTER TABLE "SKUUOM"
  ADD CONSTRAINT "SKUUOM_skuId_fkey"
  FOREIGN KEY ("skuId") REFERENCES "ItemSKU"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SKUUOM"
  ADD CONSTRAINT "SKUUOM_uomId_fkey"
  FOREIGN KEY ("uomId") REFERENCES "UOM"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
```

## Relations

### ItemSKU → SKUUOM (1:N)
Một SKU có thể có nhiều UOM khác nhau:
```typescript
const sku = await prisma.itemSKU.findUnique({
  where: { id: 1 },
  include: {
    skuUoms: {
      include: { uom: true }
    }
  }
});
```

### UOM → SKUUOM (1:N)
Một UOM có thể được sử dụng cho nhiều SKU:
```typescript
const uom = await prisma.uOM.findUnique({
  where: { id: 2 },
  include: {
    skuUoms: {
      include: { sku: true }
    }
  }
});
```

## Example Data

```typescript
// SKU: T-Shirt Red-M có base UOM = PCS (id: 1)

// SKUUOM records:
{
  skuId: 10,
  uomId: 2, // DOZEN
  toBaseFactor: 12,
  roundingPrecision: 2,
  isDefaultTransUom: false,
  isPurchasingUom: false,
  isSalesUom: true,
  isManufacturingUom: false,
  isActive: true
}

{
  skuId: 10,
  uomId: 3, // BOX
  toBaseFactor: 120,
  roundingPrecision: 0,
  isDefaultTransUom: false,
  isPurchasingUom: true,
  isSalesUom: false,
  isManufacturingUom: false,
  isActive: true
}

{
  skuId: 10,
  uomId: 4, // CARTON
  toBaseFactor: 1440,
  roundingPrecision: 0,
  isDefaultTransUom: false,
  isPurchasingUom: false,
  isSalesUom: false,
  isManufacturingUom: false,
  isActive: true
}
```

## Best Practices

### 1. Consistent Base UOM
- Chọn UOM nhỏ nhất làm base UOM (VD: PCS, CM, G)
- Giữ nguyên base UOM trong suốt vòng đời của SKU

### 2. Accurate Conversion Factors
- Kiểm tra kỹ hệ số quy đổi trước khi lưu
- Test quy đổi hai chiều để đảm bảo tính chính xác
- Document các hệ số quy đổi đặc biệt

### 3. Rounding Strategy
- Dùng roundingPrecision phù hợp với từng UOM
- UOM lớn (BOX, CARTON): 0-1 decimal
- UOM nhỏ (PCS, G): 2-3 decimal

### 4. Flag Management
- Rõ ràng về mục đích sử dụng của mỗi UOM
- Tránh trùng lặp `isDefaultTransUom`
- Review và update flags khi thay đổi quy trình

## Comparison: SKUUOM vs ItemUOM

| Aspect | ItemUOM | SKUUOM |
|--------|---------|--------|
| **Scope** | Item level | SKU level (more specific) |
| **Base UOM** | Item.uomId | ItemSKU.uomId |
| **Use case** | General item UOMs | SKU-specific UOMs |
| **Granularity** | Coarse | Fine-grained |
| **When to use** | Item has no variants | Item has variants (SKUs) |

### Decision Guide

- **Use ItemUOM** when:
  - Item has `hasSku = false`
  - UOM applies to all variants
  - Simple product structure

- **Use SKUUOM** when:
  - Item has `hasSku = true`
  - Different variants have different UOMs
  - Need SKU-level control

## Migration Checklist

- [x] Create SKUUOM table with all fields
- [x] Add unique constraint on [skuId, uomId]
- [x] Add foreign keys to ItemSKU and UOM
- [x] Add indexes for performance
- [x] Generate Prisma Client
- [ ] Create SKUUOM module with APIs
- [ ] Add validation in create endpoint
- [ ] Implement conversion utility
- [ ] Create comprehensive tests
- [ ] Update frontend integration

## Related Models

- **ItemSKU**: Parent model (each SKUUOM belongs to one SKU)
- **UOM**: Referenced UOM (the alternate unit)
- **SODetail**: Sales order details (may use SKUUOM for conversions)
- **ItemUOM**: Similar concept at Item level

## Notes

- SKUUOM is similar to ItemUOM but at SKU level for finer control
- Cascade delete: Khi xóa SKU, tất cả SKUUOM records sẽ bị xóa theo
- Restrict delete: Không thể xóa UOM nếu đang được sử dụng trong SKUUOM
- Conversion factor nên được validate ở application level trước khi lưu database
- For items without SKUs (hasSku = false), use ItemUOM instead