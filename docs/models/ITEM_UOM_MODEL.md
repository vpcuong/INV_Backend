# ItemUOM Model Documentation

## Mô tả

Model `ItemUOM` quản lý nhiều đơn vị tính (Multi-UOM) cho một sản phẩm, cho phép quy đổi giữa các đơn vị khác nhau và đánh dấu đơn vị mặc định cho từng nghiệp vụ.

## Schema

```prisma
model ItemUOM {
  id                  Int      @id @default(autoincrement())
  itemId              Int
  uomId               Int
  toBaseFactor        Decimal  @db.Decimal(18,6)
  roundingPrecision   Int?     @default(2)
  isDefaultTransUom   Boolean  @default(false)
  isPurchasingUom     Boolean  @default(false)
  isSalesUom          Boolean  @default(false)
  isManufacturingUom  Boolean  @default(false)
  isActive            Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  item                Item     @relation(fields: [itemId], references: [id], onUpdate: Cascade, onDelete: Cascade)
  uom                 UOM      @relation("ItemUOMs", fields: [uomId], references: [id], onUpdate: Cascade, onDelete: Restrict)

  @@unique([itemId, uomId], name: "ux_item_uom_once")
  @@index([itemId], name: "ix_itemuom_item")
  @@index([uomId], name: "ix_itemuom_uom")
  @@map("ItemUOM")
}
```

## Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | Int | Yes | Auto | Primary key |
| `itemId` | Int | Yes | - | ID của Item |
| `uomId` | Int | Yes | - | ID của UOM |
| `toBaseFactor` | Decimal(18,6) | Yes | - | Hệ số quy đổi về UOM cơ bản |
| `roundingPrecision` | Int | No | 2 | Số chữ số thập phân khi làm tròn |
| `isDefaultTransUom` | Boolean | No | false | UOM giao dịch mặc định |
| `isPurchasingUom` | Boolean | No | false | UOM cho mua hàng |
| `isSalesUom` | Boolean | No | false | UOM cho bán hàng |
| `isManufacturingUom` | Boolean | No | false | UOM cho sản xuất |
| `isActive` | Boolean | No | true | Trạng thái active |
| `createdAt` | DateTime | Yes | now() | Ngày tạo |
| `updatedAt` | DateTime | Yes | Auto | Ngày cập nhật |

## Conversion Logic

### Công thức quy đổi

```
1 (UOM này) = toBaseFactor × (UOM cơ bản của Item)
```

### Ví dụ 1: Áo thun (T-Shirt)

**Item**: T-Shirt
**Base UOM** (Item.uomId): PCS (Pieces) - ID: 1

**ItemUOM Records**:

| UOM | toBaseFactor | Giải thích |
|-----|--------------|------------|
| PCS (ID: 1) | 1 | 1 PCS = 1 PCS (base) |
| DOZEN (ID: 2) | 12 | 1 DOZEN = 12 PCS |
| BOX (ID: 3) | 144 | 1 BOX = 144 PCS (12 dozens) |
| CARTON (ID: 4) | 288 | 1 CARTON = 288 PCS (2 boxes) |

**Quy đổi**:
- Mua 5 CARTON = 5 × 288 = 1,440 PCS
- Bán 10 DOZEN = 10 × 12 = 120 PCS
- Tồn kho 500 PCS = 500 ÷ 144 = 3.47 BOX

### Ví dụ 2: Vải (Fabric)

**Item**: Cotton Fabric
**Base UOM** (Item.uomId): METER (M) - ID: 5

**ItemUOM Records**:

| UOM | toBaseFactor | Giải thích |
|-----|--------------|------------|
| M (ID: 5) | 1 | 1 M = 1 M (base) |
| YARD (ID: 6) | 0.9144 | 1 YARD = 0.9144 M |
| ROLL (ID: 7) | 50 | 1 ROLL = 50 M |

**Quy đổi**:
- Mua 10 ROLL = 10 × 50 = 500 M
- Xuất 100 YARD = 100 × 0.9144 = 91.44 M
- Tồn 1,000 M = 1,000 ÷ 50 = 20 ROLL

## Business Scenarios

### 1. Mua hàng (Purchasing)

```javascript
// Item: T-Shirt
// Base UOM: PCS
// Supplier bán theo CARTON (1 CARTON = 288 PCS)

ItemUOM {
  itemId: 10,
  uomId: 4, // CARTON
  toBaseFactor: 288,
  isPurchasingUom: true,  // Đánh dấu là UOM mua hàng
}

// PO: 10 CARTON × 500,000 VND/CARTON = 5,000,000 VND
// Inventory: 10 × 288 = 2,880 PCS
```

### 2. Bán hàng (Sales)

```javascript
// Item: T-Shirt
// Base UOM: PCS
// Customer mua theo DOZEN (1 DOZEN = 12 PCS)

ItemUOM {
  itemId: 10,
  uomId: 2, // DOZEN
  toBaseFactor: 12,
  isSalesUom: true,  // Đánh dấu là UOM bán hàng
}

// SO: 50 DOZEN × 300,000 VND/DOZEN = 15,000,000 VND
// Inventory deduct: 50 × 12 = 600 PCS
```

### 3. Sản xuất (Manufacturing)

```javascript
// Item: Fabric
// Base UOM: METER
// BOM yêu cầu theo METER

ItemUOM {
  itemId: 20,
  uomId: 5, // METER
  toBaseFactor: 1,
  isManufacturingUom: true,  // Đánh dấu là UOM sản xuất
}

// BOM: 1 T-Shirt cần 1.5 METER fabric
// Production Order: 100 T-Shirts
// Material required: 100 × 1.5 = 150 METER
```

## Rounding Precision

Sử dụng `roundingPrecision` để xác định độ chính xác khi quy đổi:

```javascript
// roundingPrecision = 2
145.678 PCS → 145.68 PCS

// roundingPrecision = 0
145.678 PCS → 146 PCS

// roundingPrecision = 3
145.678 PCS → 145.678 PCS
```

## Validation Rules

### 1. Unique Constraint
Một Item chỉ có thể có **một** bản ghi ItemUOM cho mỗi UOM:
```sql
@@unique([itemId, uomId])
```

### 2. Base UOM Requirement
Item **phải** có Base UOM (`Item.uomId`) trước khi tạo ItemUOM records.

### 3. Factor Validation
- `toBaseFactor` phải > 0
- Base UOM của Item nên có `toBaseFactor = 1`

### 4. Default Flags
- Chỉ nên có **một** UOM với `isDefaultTransUom = true` cho mỗi Item
- Có thể có nhiều UOM với các flags khác (isPurchasing, isSales, isManufacturing)

## Database Table

```sql
CREATE TABLE "ItemUOM" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
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

    CONSTRAINT "ItemUOM_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ItemUOM_itemId_uomId_key" ON "ItemUOM"("itemId", "uomId");
CREATE INDEX "ix_itemuom_item" ON "ItemUOM"("itemId");
CREATE INDEX "ix_itemuom_uom" ON "ItemUOM"("uomId");

ALTER TABLE "ItemUOM"
  ADD CONSTRAINT "ItemUOM_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "Item"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ItemUOM"
  ADD CONSTRAINT "ItemUOM_uomId_fkey"
  FOREIGN KEY ("uomId") REFERENCES "UOM"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
```

## Relations

### Item → ItemUOM (1:N)
Một Item có thể có nhiều UOM khác nhau:
```typescript
item.itemUoms // ItemUOM[]
```

### UOM → ItemUOM (1:N)
Một UOM có thể được sử dụng bởi nhiều Item:
```typescript
uom.itemUoms // ItemUOM[]
```

## Use Cases

### 1. Setup Multi-UOM cho Item mới

```typescript
// Item: T-Shirt
// Base UOM: PCS (id: 1)

// 1. Tạo Item
const item = await prisma.item.create({
  data: {
    name: "Classic T-Shirt",
    uomId: 1, // PCS as base UOM
    // ... other fields
  }
});

// 2. Tạo các ItemUOM
await prisma.itemUOM.createMany({
  data: [
    {
      itemId: item.id,
      uomId: 1, // PCS
      toBaseFactor: 1,
      isDefaultTransUom: true,
      isPurchasingUom: true,
      isSalesUom: true,
    },
    {
      itemId: item.id,
      uomId: 2, // DOZEN
      toBaseFactor: 12,
      isSalesUom: true,
    },
    {
      itemId: item.id,
      uomId: 3, // BOX
      toBaseFactor: 144,
    },
    {
      itemId: item.id,
      uomId: 4, // CARTON
      toBaseFactor: 288,
      isPurchasingUom: true,
    },
  ]
});
```

### 2. Lấy tất cả UOM của Item

```typescript
const itemWithUOMs = await prisma.item.findUnique({
  where: { id: 10 },
  include: {
    uom: true, // Base UOM
    itemUoms: {
      where: { isActive: true },
      include: { uom: true },
      orderBy: { toBaseFactor: 'asc' }
    }
  }
});

// Output:
{
  id: 10,
  name: "T-Shirt",
  uom: { id: 1, code: "PCS", name: "Pieces" },
  itemUoms: [
    {
      id: 1,
      toBaseFactor: 1,
      uom: { id: 1, code: "PCS", name: "Pieces" }
    },
    {
      id: 2,
      toBaseFactor: 12,
      uom: { id: 2, code: "DOZEN", name: "Dozen" }
    },
    {
      id: 3,
      toBaseFactor: 144,
      uom: { id: 3, code: "BOX", name: "Box" }
    },
    {
      id: 4,
      toBaseFactor: 288,
      uom: { id: 4, code: "CARTON", name: "Carton" }
    }
  ]
}
```

### 3. Lấy UOM mặc định cho từng nghiệp vụ

```typescript
// Get default sales UOM
const salesUOM = await prisma.itemUOM.findFirst({
  where: {
    itemId: 10,
    isSalesUom: true,
    isActive: true,
  },
  include: { uom: true }
});

// Get default purchasing UOM
const purchasingUOM = await prisma.itemUOM.findFirst({
  where: {
    itemId: 10,
    isPurchasingUom: true,
    isActive: true,
  },
  include: { uom: true }
});
```

### 4. Quy đổi số lượng giữa các UOM

```typescript
function convertQuantity(
  fromQty: number,
  fromFactor: number,
  toFactor: number,
  precision: number = 2
): number {
  // Convert to base UOM first
  const baseQty = fromQty * fromFactor;

  // Convert to target UOM
  const targetQty = baseQty / toFactor;

  // Apply rounding
  return Number(targetQty.toFixed(precision));
}

// Example: Convert 5 CARTON to PCS
// CARTON factor = 288, PCS factor = 1
const result = convertQuantity(5, 288, 1, 0);
// result = 1440 PCS

// Example: Convert 100 PCS to DOZEN
// PCS factor = 1, DOZEN factor = 12
const result2 = convertQuantity(100, 1, 12, 2);
// result2 = 8.33 DOZEN
```

## Best Practices

### 1. Luôn tạo Base UOM record
```typescript
// Khi tạo Item với uomId = 1 (PCS)
// Luôn tạo ItemUOM record cho Base UOM
{
  itemId: item.id,
  uomId: 1,
  toBaseFactor: 1, // Always 1 for base UOM
  isDefaultTransUom: true,
}
```

### 2. Validate conversion trước khi lưu
```typescript
// Đảm bảo các conversion có ý nghĩa
// VD: 1 DOZEN = 12 PCS, 1 BOX = 12 DOZEN = 144 PCS
// toBaseFactor của BOX phải là 144, không phải 12
```

### 3. Sử dụng flags hợp lý
```typescript
// Một UOM có thể có nhiều flags
{
  isPurchasingUom: true,
  isSalesUom: true, // OK - có thể vừa mua vừa bán cùng UOM
}

// Nhưng chỉ nên có 1 default
{
  isDefaultTransUom: true, // Chỉ 1 record per item
}
```

### 4. Xử lý làm tròn cẩn thận
```typescript
// Với các UOM có conversion phức tạp
// Nên set roundingPrecision phù hợp
{
  uomId: YARD,
  toBaseFactor: 0.9144, // 1 yard = 0.9144 meter
  roundingPrecision: 4, // Cần độ chính xác cao
}
```

## Migration Checklist

Khi migrate từ hệ thống cũ sang multi-UOM:

- [ ] Xác định Base UOM cho mỗi Item
- [ ] Tính toán toBaseFactor cho tất cả UOM conversions
- [ ] Đánh dấu UOM mặc định cho từng nghiệp vụ
- [ ] Migrate historical transactions với conversion factor đúng
- [ ] Test quy đổi giữa các UOM
- [ ] Update UI để support multiple UOM selection
- [ ] Update reports để hiển thị đúng UOM

## Related Models

- **Item**: Sản phẩm chính
- **UOM**: Đơn vị tính
- **SODetail**: Chi tiết đơn hàng (sử dụng ItemUOM)
- **SupplierItemPackaging**: Đóng gói của supplier (có thể tham khảo ItemUOM)

## Notes

- ItemUOM là bảng quan hệ nhiều-nhiều giữa Item và UOM với metadata bổ sung
- Cascade delete: Khi xóa Item, tất cả ItemUOM records sẽ bị xóa theo
- Restrict delete: Không thể xóa UOM nếu đang được sử dụng trong ItemUOM
- Conversion factor nên được validate ở application level trước khi lưu database