# Giải Thích Kiến Trúc 4 Layers trong Items Module

## Tổng Quan Kiến Trúc

Module Items được xây dựng theo mô hình **Domain-Driven Design (DDD)** với **4 layers** rõ ràng:

```
items/
├── 📦 domain/          → Domain Layer (Business Logic)
├── 🎯 application/     → Application Layer (Use Cases)
├── 🏗️ infrastructure/  → Infrastructure Layer (Technical Details)
└── 📋 dto/            → Data Transfer Objects
```

---

## 1. 📦 DOMAIN Layer - Lớp Business Logic

**Mục đích**: Chứa **toàn bộ business logic** và **business rules** của ứng dụng

### Files chính:

#### a) `item.entity.ts` - Entity (Aggregate Root)

```typescript
class Item {
  private id: number;
  private name: string;
  private costPrice?: number;
  // ... các properties khác

  // 👉 Business Logic Methods
  public updatePrice(costPrice, sellingPrice) {
    if (sellingPrice < costPrice) {
      console.warn('Warning: selling price < cost price');
    }
    this.costPrice = costPrice;
    this.sellingPrice = sellingPrice;
  }

  public canBeDeleted(): boolean {
    return this.itemUoms.length === 0 && !this.hasSku;
  }

  public addUOM(uom: ItemUOM): void {
    if (uom.getUomCode() === this.uomCode) {
      throw new Error('Cannot add base UOM as ItemUOM');
    }
    this.itemUoms.push(uom);
  }
}
```

**Đặc điểm:**
- ✅ **Encapsulation**: Properties là `private`, chỉ truy cập qua methods
- ✅ **Business Rules**: Logic kiểm tra giá bán < giá vốn
- ✅ **Self-contained**: Không phụ thuộc vào database hay framework
- ✅ **Rich Domain Model**: Có hành vi (behavior), không chỉ là data

#### b) `item-uom.value-object.ts` - Value Object

```typescript
class ItemUOM {
  private uomCode: string;
  private toBaseFactor: number;

  // Business logic: Convert quantity
  public convertTo(toUom: ItemUOM, quantity: number): number {
    const baseQty = quantity * this.toBaseFactor;
    return baseQty / toUom.toBaseFactor;
  }
}
```

**Đặc điểm:**
- ✅ **Immutable**: Không thay đổi sau khi tạo
- ✅ **No Identity**: Được định nghĩa bởi giá trị, không có ID
- ✅ **Business Logic**: Chứa logic conversion

#### c) `item.repository.interface.ts` - Repository Interface

```typescript
interface IItemRepository {
  findById(id: number): Promise<Item | null>;
  save(item: Item): Promise<Item>;
  update(item: Item): Promise<Item>;
  delete(id: number): Promise<void>;
}
```

**Đặc điểm:**
- ✅ **Abstract**: Chỉ định nghĩa contract, không có implementation
- ✅ **Technology Agnostic**: Không phụ thuộc Prisma, TypeORM...
- ✅ **Testable**: Dễ dàng mock trong unit tests

---

## 2. 🎯 APPLICATION Layer - Lớp Use Cases

**Mục đích**: **Orchestrate** (điều phối) các use cases, không chứa business logic

### File: `application/item.service.ts`

```typescript
@Injectable()
class ItemApplicationService {
  constructor(
    @Inject('IItemRepository')
    private itemRepository: IItemRepository
  ) {}

  // Use Case: Create Item
  async createItem(dto: CreateItemDto) {
    // 1. Tạo domain entity (business rules tự động apply)
    const item = new Item({
      name: dto.name,
      categoryId: dto.categoryId,
      // ...
    });

    // 2. Persist qua repository
    const savedItem = await this.itemRepository.save(item);

    // 3. Convert về DTO để trả client
    return this.toDto(savedItem);
  }

  // Use Case: Update Price với Business Logic
  async updatePrice(id: number, cost, selling) {
    const item = await this.findItemOrFail(id);

    // Delegate business logic cho domain entity
    item.updatePrice(cost, selling);

    const updated = await this.itemRepository.update(item);
    return this.toDto(updated);
  }
}
```

**Vai trò:**
- ✅ **Orchestration**: Điều phối flow của use case
- ✅ **Transaction**: Quản lý transactions
- ✅ **Delegation**: Ủy thác business logic cho domain entities
- ✅ **Conversion**: Chuyển đổi giữa DTO ↔ Domain Entity

**Không làm gì:**
- ❌ Không chứa business logic
- ❌ Không gọi database trực tiếp (dùng repository)
- ❌ Không biết về Prisma hay TypeORM

---

## 3. 🏗️ INFRASTRUCTURE Layer - Lớp Technical Details

**Mục đích**: Implement các interface từ Domain Layer với **công nghệ cụ thể**

### File: `infrastructure/item.repository.ts`

```typescript
@Injectable()
class ItemRepository implements IItemRepository {
  constructor(private prisma: PrismaService) {}

  // Implement interface với Prisma
  async findById(id: number): Promise<Item | null> {
    const data = await this.prisma.client.item.findUnique({
      where: { id },
      include: { itemUoms: true, category: true }
    });

    // Convert Prisma model → Domain Entity
    return data ? Item.fromPersistence(data) : null;
  }

  async save(item: Item): Promise<Item> {
    // Convert Domain Entity → Prisma model
    const data = await this.prisma.client.item.create({
      data: item.toPersistence()
    });

    return Item.fromPersistence(data);
  }
}
```

**Vai trò:**
- ✅ **Implementation**: Implement các interface từ domain
- ✅ **Technology Specific**: Dùng Prisma, TypeORM, MongoDB...
- ✅ **Data Mapping**: Convert giữa Domain Entity ↔ Database Model
- ✅ **Query Building**: Build các queries phức tạp

**Có thể thay thế:**
- 🔄 Prisma → TypeORM
- 🔄 PostgreSQL → MongoDB
- 🔄 REST → GraphQL

---

## 4. 📋 DTO Layer - Data Transfer Objects

**Mục đích**: Định nghĩa **contract** giữa client và server

### Files: `dto/create-item.dto.ts`, `dto/update-item.dto.ts`

```typescript
export class CreateItemDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  categoryId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  costPrice?: number;
}
```

**Vai trò:**
- ✅ **Validation**: Validate input từ client
- ✅ **Documentation**: Tạo Swagger docs tự động
- ✅ **Type Safety**: TypeScript type checking
- ✅ **Security**: Chỉ expose những fields cần thiết

---

## 🔄 Data Flow - Luồng Dữ Liệu

### Request Flow (Client → Server):

```
1. Client gửi request
   ↓
2. Controller nhận DTO
   POST /api/items-oop
   Body: CreateItemDto
   ↓
3. Application Service nhận DTO
   ItemApplicationService.createItem(dto)
   ↓
4. Tạo Domain Entity từ DTO
   const item = new Item({ name: dto.name, ... })
   ↓
5. Business Rules tự động apply
   Item constructor validates data
   ↓
6. Repository persist entity
   itemRepository.save(item)
   ↓
7. Infrastructure convert Entity → Prisma Model
   item.toPersistence()
   ↓
8. Prisma save vào Database
   prisma.item.create(...)
   ↓
9. Convert Prisma Model → Domain Entity
   Item.fromPersistence(data)
   ↓
10. Application Service convert Entity → DTO
    this.toDto(item)
    ↓
11. Controller trả response về Client
```

---

## 📊 So Sánh 2 Approaches

### ❌ Transaction Script (Old Way - items.service.ts)

```typescript
@Injectable()
class ItemsService {
  async create(dto) {
    // ❌ Logic rải rác trong service
    if (!dto.name) throw new Error('Name required');
    if (dto.sellingPrice < dto.costPrice) {
      console.warn('Warning...');
    }

    // ❌ Gọi database trực tiếp
    return await this.prisma.item.create({
      data: {
        name: dto.name,
        costPrice: dto.costPrice,
        // ...
      }
    });
  }
}
```

**Nhược điểm:**
- ❌ Business logic rải rác trong các service methods
- ❌ Entities chỉ là data holders (Anemic Model)
- ❌ Khó test business logic độc lập
- ❌ Khó tái sử dụng logic
- ❌ Phụ thuộc chặt vào Prisma

### ✅ DDD/OOP (New Way - items-oop.controller.ts)

```typescript
// Application Service
async createItem(dto) {
  const item = new Item({ ... }); // Business rules apply
  const saved = await repository.save(item);
  return this.toDto(saved);
}

// Domain Entity
class Item {
  updatePrice(cost, selling) {
    if (selling < cost) console.warn('Warning...');
    this.costPrice = cost;
  }
}
```

**Ưu điểm:**
- ✅ Business logic tập trung trong entities
- ✅ Rich Domain Model (có behavior)
- ✅ Dễ test (unit test domain logic độc lập)
- ✅ Dễ tái sử dụng
- ✅ Độc lập với framework

---

## 🎯 Ví Dụ Thực Tế

### Use Case: Update giá sản phẩm

**❌ Old Way:**
```typescript
// Service chứa TÁCH RỜI logic
async updatePrice(id, cost, selling) {
  if (selling < cost) console.warn('Warning');
  return await prisma.item.update({
    where: { id },
    data: { costPrice: cost, sellingPrice: selling }
  });
}
```

**✅ New Way:**
```typescript
// Application Service (orchestration)
async updatePrice(id, cost, selling) {
  const item = await repository.findById(id);
  item.updatePrice(cost, selling); // Domain logic
  return await repository.update(item);
}

// Domain Entity (business logic)
class Item {
  updatePrice(cost, selling) {
    if (selling < cost) console.warn('Warning');
    this.costPrice = cost;
    this.sellingPrice = selling;
  }
}
```

---

## 🧪 Testing Benefits

### Unit Test Domain Logic (Không cần database!)

```typescript
describe('Item Entity', () => {
  it('should warn when selling price < cost price', () => {
    const item = new Item({ id: 1, name: 'Test' });

    // Test business rule (no database needed!)
    const spy = jest.spyOn(console, 'warn');
    item.updatePrice(100, 80);

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Warning'));
    expect(item.getCostPrice()).toBe(100);
  });
});
```

### Integration Test với Repository

```typescript
describe('ItemApplicationService', () => {
  it('should create item', async () => {
    const dto = { name: 'Test', categoryId: 1 };
    const result = await service.createItem(dto);
    expect(result.name).toBe('Test');
  });
});
```

---

## ✨ Tóm Tắt

| Layer | Vai Trò | Chứa Gì | Phụ Thuộc |
|-------|---------|---------|-----------|
| **Domain** | Business Logic | Entities, Value Objects, Interfaces | Không phụ thuộc gì |
| **Application** | Use Cases | Services orchestrate domain | Domain interfaces |
| **Infrastructure** | Technical Details | Repository implementations | Domain interfaces + Prisma |
| **DTO** | API Contract | Validation, Documentation | Class-validator |

### Dependencies Direction (Dependency Inversion):
```
Controller → Application → Domain ← Infrastructure
                           ↑
                      (Interface)
```

## 🎁 Lợi Ích

Với kiến trúc này, bạn có thể:

1. ✅ **Test business logic độc lập** - Không cần database hay framework
2. ✅ **Thay đổi database dễ dàng** - Prisma → TypeORM chỉ cần sửa Infrastructure layer
3. ✅ **Business rules rõ ràng** - Tập trung trong domain entities
4. ✅ **Code dễ maintain** - Mỗi layer có trách nhiệm rõ ràng
5. ✅ **Dễ scale** - Thêm features mới không ảnh hưởng code cũ
6. ✅ **Tái sử dụng logic** - Domain logic có thể dùng ở nhiều nơi

## 📚 Tham Khảo

- Domain-Driven Design (Eric Evans)
- Clean Architecture (Robert C. Martin)
- Implementing Domain-Driven Design (Vaughn Vernon)

---

**Tác giả**: Claude Code Assistant
**Ngày tạo**: 26/12/2024