# Prisma Multi-File Schema Guide

## 📁 Schema Structure

Prisma schema đã được chia nhỏ thành nhiều files theo domain để dễ quản lý:

```
prisma/
├── schema/
│   ├── user.prisma              # User authentication
│   ├── items.prisma             # Item management (Item, ItemCategory, ItemType, ItemRevision, ItemSKU)
│   ├── attributes.prisma        # Item attributes (Color, Gender, Size, Material)
│   ├── uom.prisma              # UOM management (UOMClass, UOM, UOMConversion)
│   ├── suppliers.prisma        # Supplier management (Supplier, SupplierItem, SupplierItemPackaging)
│   └── customers.prisma        # Customer management (Customer, CustomerAddress, CustomerContact, CustomerPaymentTerm)
├── migrations/                  # Database migrations
└── schema.prisma.old           # Backup of old single-file schema
```

## 🎯 Benefits

### Before (Single File)
- ❌ 450+ lines in one file
- ❌ Hard to navigate
- ❌ Difficult to review changes in PRs
- ❌ Merge conflicts when multiple developers work on schema

### After (Multi-File)
- ✅ Each domain in separate file (~50-150 lines)
- ✅ Easy to find models
- ✅ Clean PR diffs
- ✅ Better collaboration
- ✅ Logical organization

## 📋 File Contents

### 1. user.prisma
- **Generator & Datasource configuration** (only defined once here)
- `User` model

### 2. items.prisma
Models:
- `ItemCategory`
- `ItemType`
- `Item`
- `ItemRevision`
- `ItemSKU`

### 3. attributes.prisma
Models:
- `Color`
- `Gender`
- `Size`
- `Material`

### 4. uom.prisma
Models:
- `UOMClass`
- `UOM`
- `UOMConversion`

### 5. suppliers.prisma
Models:
- `Supplier`
- `SupplierItem`
- `SupplierItemPackaging`

### 6. customers.prisma
Enums:
- `CustomerStatus`
- `AddressType`
- `PaymentTermCode`

Models:
- `Customer`
- `CustomerAddress`
- `CustomerContact`
- `CustomerPaymentTerm`

## 🔧 Configuration

### prisma.config.ts
```typescript
export default defineConfig({
  schema: "prisma/schema",  // Points to directory, not file
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

### Important Rules

1. **Generator & Datasource**: Chỉ định nghĩa 1 lần trong 1 file (hiện tại: user.prisma)
2. **File naming**: Sử dụng `.prisma` extension
3. **Location**: Tất cả files phải trong `prisma/schema/` directory
4. **Auto-merge**: Prisma tự động merge tất cả files

## 📝 How to Use

### Adding New Models

**Option 1: Add to existing file**
```prisma
// prisma/schema/customers.prisma

model CustomerOrder {
  id         Int      @id @default(autoincrement())
  customerId Int
  orderDate  DateTime @default(now())

  customer   Customer @relation(fields: [customerId], references: [id])
}
```

**Option 2: Create new domain file**
```prisma
// prisma/schema/orders.prisma

model Order {
  id         Int      @id @default(autoincrement())
  customerId Int
  orderDate  DateTime @default(now())

  customer   Customer @relation(fields: [customerId], references: [id])
  items      OrderItem[]
}

model OrderItem {
  id       Int   @id @default(autoincrement())
  orderId  Int
  itemId   Int
  quantity Int

  order    Order @relation(fields: [orderId], references: [id])
  item     Item  @relation(fields: [itemId], references: [id])
}
```

### Running Migrations

```bash
# Same commands as before
npx prisma generate
npx prisma migrate dev --name your_migration_name
npx prisma migrate deploy
npx prisma studio
```

### Prisma Studio

```bash
npx prisma studio
```

Prisma Studio vẫn hoạt động bình thường với multi-file schema.

## 🎨 Best Practices

### 1. File Organization
- Group related models together
- Keep files focused (50-150 lines ideal)
- Use descriptive file names

### 2. Naming Convention
- Use singular form: `user.prisma`, `customer.prisma`
- Use domain name for groups: `items.prisma`, `attributes.prisma`

### 3. Relations
- Relations can span across files
- Example: `Customer` in `customers.prisma` can reference `User` in `user.prisma`

### 4. Enums
- Keep enums close to models that use them
- Example: `CustomerStatus` enum in `customers.prisma`

## 🔄 Migrating from Single File

If you need to go back to single file:

```bash
# Merge all schema files into one
cat prisma/schema/*.prisma > prisma/schema.prisma

# Update prisma.config.ts
schema: "prisma/schema.prisma"

# Generate
npx prisma generate
```

## ⚠️ Common Issues

### Issue 1: Duplicate Generator/Datasource
**Error:**
```
The generator "client" cannot be defined because a generator with that name already exists.
```

**Solution:**
Only define `generator` and `datasource` in ONE file (currently in `user.prisma`).

### Issue 2: Model Not Found
**Error:**
```
Model "Customer" not found
```

**Solution:**
Make sure the file containing the model is in `prisma/schema/` directory with `.prisma` extension.

### Issue 3: Circular Dependencies
**Error:**
```
Circular dependency detected
```

**Solution:**
This shouldn't happen with multi-file schemas. If it does, the issue is in your model relations, not file structure.

## 📊 File Statistics

| File | Models | Enums | Lines |
|------|--------|-------|-------|
| user.prisma | 1 | 0 | ~20 |
| items.prisma | 5 | 0 | ~120 |
| attributes.prisma | 4 | 0 | ~80 |
| uom.prisma | 3 | 0 | ~60 |
| suppliers.prisma | 3 | 0 | ~90 |
| customers.prisma | 4 | 3 | ~120 |
| **Total** | **20** | **3** | **~490** |

## 🚀 Next Steps

1. ✅ Schema files created and organized
2. ✅ Configuration updated
3. ✅ Prisma Client generated successfully
4. ✅ Build passing
5. 🎯 Ready to develop!

## 💡 Tips

1. **IDE Support**: Most IDEs (VS Code, IntelliJ) support Prisma multi-file schemas
2. **Formatting**: Run `npx prisma format` to auto-format all schema files
3. **Validation**: Run `npx prisma validate` to check schema validity
4. **Git**: Commit schema files together when making related changes

## 📚 References

- [Prisma Multi-File Schema Docs](https://www.prisma.io/docs/orm/prisma-schema/overview/location#multi-file-prisma-schema)
- [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
