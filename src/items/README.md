# Items Module - OOP/Domain-Driven Design

## Kiến trúc

Module này được thiết kế theo hướng **Object-Oriented Programming (OOP)** và **Domain-Driven Design (DDD)** với các layer rõ ràng:

```
items/
├── domain/                      # Domain Layer - Business Logic
│   ├── item.entity.ts          # Item aggregate root
│   ├── item-uom.value-object.ts # ItemUOM value object
│   ├── item-status.enum.ts     # Domain enums
│   └── item.repository.interface.ts # Repository contract
├── application/                 # Application Layer - Use Cases
│   └── item.service.ts         # Application service (orchestration)
├── infrastructure/              # Infrastructure Layer - Technical Details
│   └── item.repository.ts      # Prisma implementation
├── dto/                        # Data Transfer Objects
├── items.controller.ts         # Original controller (backward compatible)
├── items-oop.controller.ts     # OOP-based controller (demo)
└── items.service.ts            # Original service (backward compatible)
```

## Các Layer

### 1. Domain Layer (Core Business Logic)

**Item Entity** (`domain/item.entity.ts`):
- Chứa business logic và business rules
- Encapsulates behavior, không chỉ là data holder
- Methods:
  - `canBeDeleted()`: Business rule kiểm tra item có thể xóa không
  - `updatePrice()`: Cập nhật giá với validation
  - `addUOM()`: Thêm UOM với business rules
  - `convertQuantity()`: Logic conversion giữa các UOM

**ItemUOM Value Object** (`domain/item-uom.value-object.ts`):
- Immutable value object
- Chứa logic conversion giữa các UOM
- Method `convertTo()`: Convert quantity từ UOM này sang UOM khác

**Repository Interface** (`domain/item.repository.interface.ts`):
- Abstract interface không phụ thuộc vào infrastructure
- Định nghĩa contract cho data access
- Cho phép dễ dàng test và swap implementation

### 2. Application Layer (Use Cases)

**ItemApplicationService** (`application/item.service.ts`):
- Orchestrates use cases
- Delegates business logic to domain entities
- Use cases:
  - `createItem()`: Tạo item mới
  - `updatePrice()`: Cập nhật giá với business rules
  - `convertQuantity()`: Convert quantity giữa UOMs
  - `remove()`: Xóa item với business validation

### 3. Infrastructure Layer (Technical Implementation)

**ItemRepository** (`infrastructure/item.repository.ts`):
- Prisma implementation của IItemRepository
- Handles persistence details
- Converts between Prisma models và Domain entities

## So sánh với Transaction Script

### Transaction Script (items.service.ts - Old)
```typescript
// Service chứa TẤT CẢ logic
async create(dto) {
  // Validation logic
  // Business logic
  // Persistence logic
  return await prisma.item.create({...});
}
```

**Nhược điểm:**
- Logic rải rác trong service methods
- Khó test business logic độc lập
- Business rules không rõ ràng
- Entities chỉ là data holders (anemic model)

### OOP/DDD (ItemApplicationService - New)
```typescript
// Service orchestrates
async createItem(dto) {
  // Create domain entity (business rules applied)
  const item = new Item({...});

  // Persist through repository
  const saved = await repository.save(item);

  return this.toDto(saved);
}

// Business logic trong entity
class Item {
  public updatePrice(cost, selling) {
    if (selling < cost) {
      console.warn('Warning: selling price < cost price');
    }
    this.costPrice = cost;
    this.sellingPrice = selling;
  }
}
```

**Ưu điểm:**
- Business logic encapsulated trong domain entities
- Dễ test (domain logic độc lập với infrastructure)
- Clear separation of concerns
- Business rules rõ ràng và dễ maintain
- Có thể reuse domain logic ở nhiều nơi

## Sử dụng

### API Endpoints

**Original API** (backward compatible):
- `POST /api/items` - Create item
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item by ID
- `PATCH /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

**OOP API** (new endpoints for demo):
- `POST /api/items-oop` - Create item (OOP)
- `GET /api/items-oop` - Get all items (OOP)
- `GET /api/items-oop/:id` - Get item (OOP)
- `PATCH /api/items-oop/:id` - Update item (OOP)
- `DELETE /api/items-oop/:id` - Delete item (OOP)
- `PATCH /api/items-oop/:id/price` - Update price with business rules
- `GET /api/items-oop/:id/convert-quantity` - Convert quantity between UOMs

### Examples

**Update price with business validation:**
```bash
PATCH /api/items-oop/1/price
{
  "costPrice": 100,
  "sellingPrice": 80
}

# Response: Warning logged if selling < cost
```

**Convert quantity between UOMs:**
```bash
GET /api/items-oop/1/convert-quantity?fromUomCode=PCS&toUomCode=BOX&quantity=24

# Response:
{
  "itemId": 1,
  "fromUomCode": "PCS",
  "toUomCode": "BOX",
  "originalQuantity": 24,
  "convertedQuantity": 2  // if 1 BOX = 12 PCS
}
```

## Testing

### Unit Test Domain Logic

```typescript
describe('Item Entity', () => {
  it('should throw error when selling price < cost price', () => {
    const item = new Item({...});

    // Test business rule
    item.updatePrice(100, 80); // Should log warning

    expect(item.getCostPrice()).toBe(100);
    expect(item.getSellingPrice()).toBe(80);
  });

  it('should not allow adding base UOM as ItemUOM', () => {
    const item = new Item({ uomCode: 'PCS', ... });
    const itemUOM = new ItemUOM({ uomCode: 'PCS', ... });

    // Business rule: cannot add base UOM
    expect(() => item.addUOM(itemUOM)).toThrow();
  });
});
```

### Integration Test with Repository

```typescript
describe('ItemApplicationService', () => {
  it('should create item through repository', async () => {
    const dto = { name: 'Test Item', ... };
    const result = await service.createItem(dto);

    expect(result.name).toBe('Test Item');
  });
});
```

## Migration Strategy

1. **Phase 1** (Current):
   - Cả 2 approaches chạy song song
   - Original endpoints vẫn hoạt động
   - OOP endpoints ở `/items-oop/*`

2. **Phase 2** (Future):
   - Migrate dần endpoints sang OOP approach
   - Deprecate old service methods
   - Update frontend để dùng OOP endpoints

3. **Phase 3** (Final):
   - Remove old transaction script code
   - Chỉ giữ OOP/DDD approach

## Benefits

1. **Maintainability**: Business logic tập trung, dễ maintain
2. **Testability**: Domain logic test độc lập, không cần database
3. **Scalability**: Dễ thêm features mới
4. **Clarity**: Business rules rõ ràng, self-documenting
5. **Flexibility**: Dễ swap infrastructure (Prisma → TypeORM, etc.)

## Next Steps

Để refactor toàn bộ sang OOP:

1. Refactor các modules khác (SKU, UOM, Supplier, etc.)
2. Implement domain events (Event Sourcing)
3. Add CQRS pattern (Command Query Responsibility Segregation)
4. Implement specifications pattern cho complex queries
5. Add unit tests cho domain logic