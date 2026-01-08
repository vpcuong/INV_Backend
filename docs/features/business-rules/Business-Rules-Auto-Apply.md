# Business Rules Tự Động Apply Trong Constructor

## Khái Niệm

Khi nói **"Business Rules tự động apply trong constructor"**, có nghĩa là:

> Ngay khi bạn tạo một object từ class (gọi `new Item(...)`), các **business rules** và **invariants** (điều kiện bất biến) sẽ được **tự động kiểm tra và áp dụng** mà không cần gọi thêm method nào khác.

---

## So Sánh 2 Cách Tiếp Cận

### ❌ **Cách 1: Anemic Model (Không có Business Rules trong Constructor)**

```typescript
// Model chỉ là data holder - KHÔNG có logic
class Item {
  public id: number;
  public name: string;
  public hasSku: boolean;
  public isPurchasable: boolean;
  public costPrice: number;
  public sellingPrice: number;
}

// Service chứa TOÀN BỘ business logic
class ItemService {
  async create(dto) {
    const item = new Item();

    // ❌ Phải SET THỦ CÔNG từng field
    item.name = dto.name;
    item.hasSku = dto.hasSku;

    // ❌ Phải VALIDATION THỦ CÔNG
    if (!item.name) {
      throw new Error('Name is required');
    }

    // ❌ Phải ÁP DỤNG DEFAULT VALUES THỦ CÔNG
    if (item.hasSku === undefined) {
      item.hasSku = false;
    }
    if (item.isPurchasable === undefined) {
      item.isPurchasable = false;
    }

    // ❌ Phải KIỂM TRA BUSINESS RULES THỦ CÔNG
    if (item.sellingPrice < item.costPrice) {
      console.warn('Selling price < cost price!');
    }

    await prisma.item.create({ data: item });
  }
}
```

**Vấn đề:**
- 😰 Dễ quên validation
- 😰 Logic rải rác khắp nơi
- 😰 Mỗi service method phải lặp lại logic
- 😰 Khó test business rules

---

### ✅ **Cách 2: Rich Domain Model (Business Rules Tự Động Apply)**

```typescript
// Domain Entity - CHỨA business logic
export class Item {
  private id: number;
  private name: string;
  private hasSku: boolean;
  private isPurchasable: boolean;
  private costPrice?: number | null;
  private sellingPrice?: number | null;

  constructor(data: ItemConstructorData) {
    // ✅ Validation tự động
    if (!data.name || data.name.trim() === '') {
      throw new Error('Item name is required');
    }
    if (data.categoryId <= 0) {
      throw new Error('Category ID must be positive');
    }

    // ✅ Set values
    this.id = data.id;
    this.name = data.name.trim(); // Auto clean
    this.categoryId = data.categoryId;

    // ✅ Default values TỰ ĐỘNG apply
    this.hasSku = data.hasSku ?? false;  // Nếu undefined → false
    this.isManufactured = data.isManufactured ?? false;
    this.isPurchasable = data.isPurchasable ?? false;
    this.isSellable = data.isSellable ?? false;

    // ✅ Business rule: Warn if selling price < cost price
    if (data.sellingPrice && data.costPrice) {
      if (data.sellingPrice < data.costPrice) {
        console.warn(
          `Warning: Selling price (${data.sellingPrice}) < ` +
          `Cost price (${data.costPrice}) for item "${data.name}"`
        );
      }
    }

    this.costPrice = data.costPrice;
    this.sellingPrice = data.sellingPrice;

    // ✅ Status default
    this.status = data.status ?? 'Draft';

    // ✅ Initialize collections
    this.itemUoms = data.itemUoms ?? [];
  }
}

// Service chỉ cần orchestrate - KHÔNG có business logic
class ItemApplicationService {
  async createItem(dto: CreateItemDto) {
    // ✅ Chỉ cần 1 dòng - TẤT CẢ business rules tự động apply!
    const item = new Item({
      id: 0,
      name: dto.name,
      categoryId: dto.categoryId,
      hasSku: dto.hasSku,
      costPrice: dto.costPrice,
      sellingPrice: dto.sellingPrice,
      // ... other fields
    });

    // Constructor đã validate rồi!
    // Default values đã set rồi!
    // Business rules đã check rồi!

    const saved = await repository.save(item);
    return this.toDto(saved);
  }
}
```

---

## Chi Tiết: Business Rules Tự Động Apply

### 1️⃣ **Validation Tự Động**

```typescript
constructor(data: ItemConstructorData) {
  // ✅ BUSINESS RULE: Name không được rỗng
  if (!data.name || data.name.trim() === '') {
    throw new Error('Item name is required');
  }

  // ✅ BUSINESS RULE: Category phải hợp lệ
  if (!data.categoryId || data.categoryId <= 0) {
    throw new Error('Valid category is required');
  }

  // ✅ BUSINESS RULE: Giá không âm
  if (data.costPrice !== undefined && data.costPrice < 0) {
    throw new Error('Cost price cannot be negative');
  }

  this.name = data.name.trim();
  this.categoryId = data.categoryId;
  this.costPrice = data.costPrice;
}
```

**Kết quả:**
```typescript
// ❌ Sẽ THROW ERROR ngay lập tức!
const item = new Item({
  id: 0,
  name: '',  // ← Invalid!
  categoryId: 1
});

// ❌ Sẽ THROW ERROR ngay lập tức!
const item = new Item({
  id: 0,
  name: 'Test',
  categoryId: -1  // ← Invalid!
});

// ✅ OK - Pass validation
const item = new Item({
  id: 0,
  name: 'Valid Item',
  categoryId: 5
});
```

---

### 2️⃣ **Default Values Tự Động**

```typescript
constructor(data: ItemConstructorData) {
  // ✅ Tự động set default = false nếu không được cung cấp
  this.hasSku = data.hasSku ?? false;
  this.isManufactured = data.isManufactured ?? false;
  this.isPurchasable = data.isPurchasable ?? false;
  this.isSellable = data.isSellable ?? false;

  // ✅ Tự động set status = 'Draft'
  this.status = data.status ?? 'Draft';

  // ✅ Tự động init array rỗng
  this.itemUoms = data.itemUoms ?? [];
}
```

**Kết quả:**
```typescript
// Input: Không cung cấp hasSku, isPurchasable...
const item = new Item({
  id: 0,
  name: 'Test Item',
  categoryId: 1,
  itemTypeId: 2
  // Không truyền hasSku, isPurchasable, status...
});

// Output: Tự động có default values!
console.log(item.getHasSku());        // false (auto)
console.log(item.getIsPurchasable()); // false (auto)
console.log(item.getStatus());        // 'Draft' (auto)
```

---

### 3️⃣ **Business Rules Tự Động Check**

```typescript
constructor(data: ItemConstructorData) {
  // ... other code ...

  // ✅ BUSINESS RULE: Cảnh báo nếu giá bán < giá vốn
  if (data.sellingPrice && data.costPrice) {
    if (data.sellingPrice < data.costPrice) {
      console.warn(
        `⚠️ WARNING: Selling price (${data.sellingPrice}) ` +
        `is less than cost price (${data.costPrice})`
      );
    }
  }

  // ✅ BUSINESS RULE: Không thể sellable nếu chưa có giá
  if (data.isSellable && !data.sellingPrice) {
    throw new Error('Cannot mark as sellable without selling price');
  }

  this.costPrice = data.costPrice;
  this.sellingPrice = data.sellingPrice;
  this.isSellable = data.isSellable ?? false;
}
```

**Kết quả:**
```typescript
// ⚠️ Sẽ LOG WARNING tự động!
const item = new Item({
  id: 0,
  name: 'Test',
  categoryId: 1,
  itemTypeId: 1,
  costPrice: 100,
  sellingPrice: 80  // ← Less than cost!
});
// Console: ⚠️ WARNING: Selling price (80) is less than cost price (100)

// ❌ Sẽ THROW ERROR!
const item = new Item({
  id: 0,
  name: 'Test',
  categoryId: 1,
  itemTypeId: 1,
  isSellable: true,  // ← Want to sell
  sellingPrice: null // ← But no price!
});
// Error: Cannot mark as sellable without selling price
```

---

### 4️⃣ **Data Normalization Tự Động**

```typescript
constructor(data: ItemConstructorData) {
  // ✅ Tự động trim whitespace
  this.name = data.name.trim();

  // ✅ Tự động uppercase cho codes
  this.uomCode = data.uomCode?.toUpperCase();

  // ✅ Tự động round numbers
  this.lengthCm = data.lengthCm ?
    Math.round(data.lengthCm * 100) / 100 : null;
}
```

**Kết quả:**
```typescript
const item = new Item({
  id: 0,
  name: '  Test Item  ',  // ← Có spaces
  categoryId: 1,
  itemTypeId: 1,
  uomCode: 'pcs',         // ← Lowercase
  lengthCm: 12.3456789    // ← Nhiều decimals
});

console.log(item.getName());     // 'Test Item' (trimmed)
console.log(item.getUomCode());  // 'PCS' (uppercase)
console.log(item.getLengthCm()); // 12.35 (rounded)
```

---

## Ví Dụ Thực Tế Đầy Đủ

### Scenario: Tạo một sản phẩm mới

```typescript
// ========================================
// Application Service
// ========================================
class ItemApplicationService {
  async createItem(dto: CreateItemDto) {
    // Chỉ cần gọi constructor
    const item = new Item({
      id: 0,
      name: dto.name,
      categoryId: dto.categoryId,
      itemTypeId: dto.itemTypeId,
      costPrice: dto.costPrice,
      sellingPrice: dto.sellingPrice,
      isSellable: dto.isSellable,
      isPurchasable: dto.isPurchasable,
      uomCode: dto.uomCode,
      status: dto.status
    });

    // Tất cả đã xảy ra trong constructor:
    // ✅ Name đã được validate
    // ✅ Default values đã được set
    // ✅ Business rules đã được check
    // ✅ Data đã được normalize

    // Chỉ cần save
    const saved = await this.repository.save(item);
    return this.toDto(saved);
  }
}

// ========================================
// Test Case 1: Valid Item
// ========================================
const dto1 = {
  name: 'Cotton T-Shirt',
  categoryId: 1,
  itemTypeId: 2,
  costPrice: 50000,
  sellingPrice: 100000,
  isSellable: true,
  uomCode: 'PCS'
};

const item1 = new Item({ ...dto1, id: 0 });
// ✅ Success!
// - name: 'Cotton T-Shirt'
// - hasSku: false (auto default)
// - isPurchasable: false (auto default)
// - isSellable: true
// - status: 'Draft' (auto default)

// ========================================
// Test Case 2: Invalid - Empty Name
// ========================================
const dto2 = {
  name: '',  // ❌ Invalid
  categoryId: 1,
  itemTypeId: 2
};

try {
  const item2 = new Item({ ...dto2, id: 0 });
} catch (error) {
  console.log(error.message);
  // Output: "Item name is required"
}

// ========================================
// Test Case 3: Warning - Selling < Cost
// ========================================
const dto3 = {
  name: 'Discounted Item',
  categoryId: 1,
  itemTypeId: 2,
  costPrice: 100000,
  sellingPrice: 80000  // ⚠️ Less than cost!
};

const item3 = new Item({ ...dto3, id: 0 });
// Console Warning:
// ⚠️ WARNING: Selling price (80000) is less than cost price (100000)

// ========================================
// Test Case 4: Auto Default Values
// ========================================
const dto4 = {
  name: 'Simple Item',
  categoryId: 1,
  itemTypeId: 2
  // Không truyền hasSku, isPurchasable, status...
};

const item4 = new Item({ ...dto4, id: 0 });
console.log(item4.getHasSku());        // false ✅
console.log(item4.getIsPurchasable()); // false ✅
console.log(item4.getIsSellable());    // false ✅
console.log(item4.getStatus());        // 'Draft' ✅
```

---

## Lợi Ích

### 1. **Không Thể Tạo Object Invalid**

```typescript
// ❌ KHÔNG THỂ tạo item với name rỗng
const invalid = new Item({ name: '', ... });
// → Throw error ngay!

// ❌ KHÔNG THỂ tạo item sellable mà không có giá
const invalid = new Item({
  isSellable: true,
  sellingPrice: null
});
// → Throw error ngay!
```

### 2. **Luôn Đảm Bảo Consistency**

```typescript
// ✅ Item luôn có status (mặc định 'Draft')
// ✅ Item luôn có hasSku (mặc định false)
// ✅ Item luôn có valid categoryId
// → Không bao giờ có item "inconsistent"!
```

### 3. **Business Logic Tập Trung**

```typescript
// ✅ Tất cả business rules ở 1 nơi (constructor)
// ✅ Service không cần biết rules
// ✅ Dễ tìm và sửa rules
```

### 4. **Dễ Test**

```typescript
describe('Item Constructor', () => {
  it('should throw error if name is empty', () => {
    expect(() => {
      new Item({ name: '', categoryId: 1, ... });
    }).toThrow('Item name is required');
  });

  it('should set default hasSku to false', () => {
    const item = new Item({ name: 'Test', categoryId: 1, ... });
    expect(item.getHasSku()).toBe(false);
  });

  it('should warn if selling < cost', () => {
    const spy = jest.spyOn(console, 'warn');
    const item = new Item({
      name: 'Test',
      categoryId: 1,
      costPrice: 100,
      sellingPrice: 80
    });
    expect(spy).toHaveBeenCalled();
  });
});
```

---

## Tóm Tắt

**"Business Rules tự động apply trong constructor"** nghĩa là:

| Khi Gọi | Constructor Tự Động |
|---------|---------------------|
| `new Item(...)` | ✅ Validate required fields |
| | ✅ Set default values |
| | ✅ Check business rules |
| | ✅ Normalize data |
| | ✅ Initialize collections |
| | ✅ Ensure invariants |

**Kết quả:**
- 🎯 Object luôn ở trạng thái **valid**
- 🎯 Không cần validate thủ công
- 🎯 Business rules **không thể bị bỏ qua**
- 🎯 Code **clean** và **maintainable**

---

## Mở Rộng: Constructor với Validation Phức Tạp

```typescript
constructor(data: ItemConstructorData) {
  // 1. Required fields validation
  this.validateRequiredFields(data);

  // 2. Business rules validation
  this.validateBusinessRules(data);

  // 3. Set values với defaults
  this.initializeFields(data);

  // 4. Post-initialization validation
  this.validateInvariants();
}

private validateRequiredFields(data: ItemConstructorData) {
  if (!data.name?.trim()) {
    throw new Error('Item name is required');
  }
  if (!data.categoryId) {
    throw new Error('Category is required');
  }
}

private validateBusinessRules(data: ItemConstructorData) {
  // Rule: Cannot be sellable without price
  if (data.isSellable && !data.sellingPrice) {
    throw new Error('Sellable items must have selling price');
  }

  // Rule: Warn if selling < cost
  if (data.sellingPrice && data.costPrice) {
    if (data.sellingPrice < data.costPrice) {
      console.warn('Selling price less than cost price');
    }
  }
}

private validateInvariants() {
  // Invariant: Item phải luôn có status
  if (!this.status) {
    throw new Error('Invalid state: status is null');
  }
}
```

Bây giờ bạn đã hiểu rõ cách "Business Rules tự động apply" hoạt động! 🚀