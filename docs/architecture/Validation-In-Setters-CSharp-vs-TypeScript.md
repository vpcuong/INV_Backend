# Validation trong Setter - C# vs TypeScript

## Tổng Quan

Trong C#, bạn có thể đặt **validation logic** ngay trong **setter** của properties. Khi ai đó gán giá trị cho property, validation sẽ tự động chạy.

---

## 1. C# - Validation trong Setter

### ✅ **Cách 1: Full Property với Validation**

```csharp
public class Item
{
    private string _name;
    private decimal _costPrice;
    private decimal _sellingPrice;

    // Property với validation trong setter
    public string Name
    {
        get { return _name; }
        set
        {
            // ✅ Validation tự động khi set giá trị
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new ArgumentException("Item name cannot be empty");
            }
            if (value.Length > 100)
            {
                throw new ArgumentException("Item name too long");
            }

            // ✅ Normalize data
            _name = value.Trim();
        }
    }

    public decimal CostPrice
    {
        get { return _costPrice; }
        set
        {
            // ✅ Validation
            if (value < 0)
            {
                throw new ArgumentException("Cost price cannot be negative");
            }
            _costPrice = value;
        }
    }

    public decimal SellingPrice
    {
        get { return _sellingPrice; }
        set
        {
            // ✅ Validation
            if (value < 0)
            {
                throw new ArgumentException("Selling price cannot be negative");
            }

            // ✅ Business Rule: Warn if selling < cost
            if (value < _costPrice)
            {
                Console.WriteLine($"Warning: Selling price ({value}) < Cost price ({_costPrice})");
            }

            _sellingPrice = value;
        }
    }
}
```

### **Cách Sử Dụng:**

```csharp
var item = new Item();

// ✅ Valid - Setter chạy validation
item.Name = "Cotton T-Shirt";
Console.WriteLine(item.Name); // "Cotton T-Shirt" (trimmed)

// ❌ Invalid - Throw exception ngay
try
{
    item.Name = ""; // Setter detect empty!
}
catch (ArgumentException ex)
{
    Console.WriteLine(ex.Message);
    // Output: "Item name cannot be empty"
}

// ✅ Set prices
item.CostPrice = 50000;
item.SellingPrice = 40000;
// Console Warning: "Selling price (40000) < Cost price (50000)"

// ❌ Invalid price
try
{
    item.CostPrice = -100; // Setter detect negative!
}
catch (ArgumentException ex)
{
    Console.WriteLine(ex.Message);
    // Output: "Cost price cannot be negative"
}
```

---

### ✅ **Cách 2: Init-Only Setter (C# 9.0+)**

```csharp
public class Item
{
    private string _name;

    // Property chỉ set được khi khởi tạo
    public string Name
    {
        get { return _name; }
        init // ← init thay vì set
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Name required");

            _name = value.Trim();
        }
    }

    public int CategoryId { get; init; } // Auto-property với init
}

// Sử dụng:
var item = new Item
{
    Name = "Test",      // ✅ OK khi khởi tạo
    CategoryId = 1
};

// ❌ Không thể set lại sau khi tạo
// item.Name = "New Name"; // Compile error!
```

---

### ✅ **Cách 3: Required Properties (C# 11+)**

```csharp
public class Item
{
    private string _name;

    // Required property - BẮT BUỘC phải set khi khởi tạo
    public required string Name
    {
        get { return _name; }
        init
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Name required");
            _name = value.Trim();
        }
    }

    public required int CategoryId { get; init; }
}

// ❌ Compile error nếu không set required properties
// var item = new Item(); // Error!

// ✅ Phải set đầy đủ
var item = new Item
{
    Name = "Test",      // Required
    CategoryId = 1      // Required
};
```

---

## 2. TypeScript - Không Có Setter Validation Tốt

TypeScript **KHÔNG HỖ TRỢ TỐT** validation trong setter như C#:

### ❌ **Vấn Đề với TypeScript Setter**

```typescript
class Item {
  private _name: string;

  // Setter với validation
  set name(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Name cannot be empty');
    }
    this._name = value.trim();
  }

  get name(): string {
    return this._name;
  }
}

// VẤN ĐỀ 1: Phải dùng setter thủ công
const item = new Item();
item.name = "Test"; // ✅ Setter chạy validation

// VẤN ĐỀ 2: Constructor KHÔNG gọi setter!
class Item {
  constructor(private _name: string) {
    // ❌ Không chạy qua setter!
    // Validation BỊ BỎ QUA!
  }

  set name(value: string) {
    // Validation ở đây KHÔNG chạy khi constructor
    if (!value) throw new Error('Name required');
    this._name = value;
  }
}

const item = new Item(''); // ❌ Không có error!
// Constructor gán trực tiếp _name = ''
// Bỏ qua validation trong setter!
```

### ✅ **Giải Pháp TypeScript: Validation trong Constructor**

```typescript
class Item {
  private readonly name: string;
  private readonly costPrice: number;
  private readonly sellingPrice: number;

  constructor(data: {
    name: string;
    costPrice: number;
    sellingPrice: number;
  }) {
    // ✅ Validation trong constructor
    if (!data.name || data.name.trim() === '') {
      throw new Error('Name cannot be empty');
    }
    if (data.costPrice < 0) {
      throw new Error('Cost price cannot be negative');
    }
    if (data.sellingPrice < 0) {
      throw new Error('Selling price cannot be negative');
    }
    if (data.sellingPrice < data.costPrice) {
      console.warn('Warning: Selling < Cost');
    }

    // Set values
    this.name = data.name.trim();
    this.costPrice = data.costPrice;
    this.sellingPrice = data.sellingPrice;
  }

  // Getters only (immutable)
  getName(): string { return this.name; }
  getCostPrice(): number { return this.costPrice; }
  getSellingPrice(): number { return this.sellingPrice; }
}
```

---

## 3. So Sánh Chi Tiết

| Tính Năng | C# | TypeScript |
|-----------|----|-----------|
| **Setter Validation** | ✅ Rất mạnh | ❌ Hạn chế |
| **Constructor Call Setter** | ✅ Có | ❌ Không |
| **Init-Only Properties** | ✅ Có (`init`) | ❌ Không |
| **Required Properties** | ✅ Có (`required`) | ❌ Không |
| **Auto-Properties** | ✅ Có | ❌ Không |
| **Immutability** | ✅ Dễ (`init`) | ⚠️ Dùng `readonly` |

---

## 4. Ví Dụ Thực Tế - C# với Setter Validation

```csharp
public class Item
{
    private string _name;
    private int _categoryId;
    private decimal _costPrice;
    private decimal _sellingPrice;
    private bool _isPurchasable;
    private bool _isSellable;

    // ========================================
    // Name - Required, Max 100 chars
    // ========================================
    public string Name
    {
        get => _name;
        set
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Name is required");

            if (value.Length > 100)
                throw new ArgumentException("Name max 100 characters");

            _name = value.Trim();
        }
    }

    // ========================================
    // CategoryId - Must be positive
    // ========================================
    public int CategoryId
    {
        get => _categoryId;
        set
        {
            if (value <= 0)
                throw new ArgumentException("Invalid category ID");

            _categoryId = value;
        }
    }

    // ========================================
    // CostPrice - Cannot be negative
    // ========================================
    public decimal CostPrice
    {
        get => _costPrice;
        set
        {
            if (value < 0)
                throw new ArgumentException("Cost price cannot be negative");

            _costPrice = value;

            // Business rule: Check against selling price
            if (_sellingPrice > 0 && _sellingPrice < value)
            {
                Console.WriteLine("Warning: Selling price < cost price");
            }
        }
    }

    // ========================================
    // SellingPrice - Business Rules
    // ========================================
    public decimal SellingPrice
    {
        get => _sellingPrice;
        set
        {
            if (value < 0)
                throw new ArgumentException("Selling price cannot be negative");

            // Business rule
            if (_costPrice > 0 && value < _costPrice)
            {
                Console.WriteLine($"Warning: Selling ({value}) < Cost ({_costPrice})");
            }

            _sellingPrice = value;
        }
    }

    // ========================================
    // IsSellable - Requires selling price
    // ========================================
    public bool IsSellable
    {
        get => _isSellable;
        set
        {
            if (value && _sellingPrice <= 0)
                throw new InvalidOperationException(
                    "Cannot mark as sellable without selling price"
                );

            _isSellable = value;
        }
    }

    // ========================================
    // Auto-properties (no validation needed)
    // ========================================
    public bool HasSku { get; set; }
    public bool IsManufactured { get; set; }
    public string? UomCode { get; set; }
}
```

### **Sử Dụng:**

```csharp
class Program
{
    static void Main()
    {
        var item = new Item();

        // ✅ Test 1: Valid assignments
        item.Name = "Cotton T-Shirt";
        item.CategoryId = 1;
        item.CostPrice = 50000m;
        item.SellingPrice = 100000m;

        Console.WriteLine($"Item: {item.Name}");
        Console.WriteLine($"Cost: {item.CostPrice}");
        Console.WriteLine($"Selling: {item.SellingPrice}");

        // ✅ Test 2: Validation errors
        try
        {
            item.Name = ""; // ❌ Exception!
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }

        try
        {
            item.CategoryId = -1; // ❌ Exception!
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }

        try
        {
            item.CostPrice = -100; // ❌ Exception!
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }

        // ✅ Test 3: Business rule warning
        item.CostPrice = 100000m;
        item.SellingPrice = 80000m;
        // Console: "Warning: Selling (80000) < Cost (100000)"

        // ✅ Test 4: Business rule validation
        try
        {
            item.IsSellable = true; // OK - có selling price
            Console.WriteLine("Item marked as sellable");
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }

        // Clear selling price
        item.SellingPrice = 0;

        try
        {
            item.IsSellable = true; // ❌ Exception!
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            // Output: "Cannot mark as sellable without selling price"
        }
    }
}
```

**Output:**
```
Item: Cotton T-Shirt
Cost: 50000
Selling: 100000
Error: Name is required
Error: Invalid category ID
Error: Cost price cannot be negative
Warning: Selling (80000) < Cost (100000)
Item marked as sellable
Error: Cannot mark as sellable without selling price
```

---

## 5. Best Practices - C# Setter Validation

### ✅ **1. Validate Ngay Trong Setter**

```csharp
public string Email
{
    get => _email;
    set
    {
        if (!IsValidEmail(value))
            throw new ArgumentException("Invalid email format");
        _email = value;
    }
}

private bool IsValidEmail(string email)
{
    return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
}
```

### ✅ **2. Normalize Data Trong Setter**

```csharp
public string PhoneNumber
{
    get => _phoneNumber;
    set
    {
        // Remove all non-digits
        var cleaned = Regex.Replace(value ?? "", @"[^\d]", "");

        if (cleaned.Length < 10)
            throw new ArgumentException("Phone number must have 10 digits");

        _phoneNumber = cleaned;
    }
}
```

### ✅ **3. Cross-Property Validation**

```csharp
public DateTime StartDate { get; set; }

public DateTime EndDate
{
    get => _endDate;
    set
    {
        if (value < StartDate)
            throw new ArgumentException("End date must be after start date");
        _endDate = value;
    }
}
```

### ✅ **4. Lazy Validation**

```csharp
private List<string> _errors = new();

public string Name
{
    get => _name;
    set
    {
        _errors.Clear();

        if (string.IsNullOrWhiteSpace(value))
            _errors.Add("Name is required");

        if (value?.Length > 100)
            _errors.Add("Name too long");

        _name = value;
    }
}

public bool IsValid => _errors.Count == 0;
public IReadOnlyList<string> Errors => _errors;
```

---

## 6. Khi Nào Dùng Setter Validation vs Constructor Validation

| Scenario | Dùng Setter | Dùng Constructor |
|----------|-------------|------------------|
| **Mutable object** (có thể thay đổi) | ✅ | ⚠️ |
| **Immutable object** (không đổi) | ❌ | ✅ |
| **Domain entities** | ✅ | ✅ Cả hai |
| **DTOs / POCOs** | ⚠️ | ❌ |
| **Value Objects** | ❌ | ✅ |

### **C# - Mutable Entity với Setter Validation**

```csharp
public class Item
{
    public string Name { get; set; } // Validation trong setter
    public decimal Price { get; set; } // Validation trong setter

    // Có thể thay đổi sau khi tạo
}
```

### **C# - Immutable Entity với Constructor Validation**

```csharp
public class Item
{
    public string Name { get; init; } // Chỉ set khi khởi tạo
    public decimal Price { get; init; }

    public Item(string name, decimal price)
    {
        // Validation trong constructor
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name required");
        if (price < 0)
            throw new ArgumentException("Price invalid");

        Name = name;
        Price = price;
    }
}
```

---

## Tóm Tắt

### **C#:**
- ✅ **Setter validation rất mạnh** - Validation tự động mỗi khi gán giá trị
- ✅ **Constructor gọi setter** - Validation chạy ngay khi tạo object
- ✅ **Init-only properties** - Immutable nhưng vẫn có validation
- ✅ **Required properties** - Compile-time check

### **TypeScript:**
- ❌ **Setter validation hạn chế** - Constructor không gọi setter
- ✅ **Constructor validation** - Validation tập trung trong constructor
- ✅ **Readonly properties** - Immutable pattern
- ⚠️ **Runtime validation only** - Không có compile-time required check

### **Khuyến Nghị:**

| Ngôn Ngữ | Pattern Khuyên Dùng |
|----------|---------------------|
| **C#** | Setter validation + Constructor validation |
| **TypeScript** | Constructor validation + Readonly properties |

**C# Example:**
```csharp
public class Item
{
    public string Name { get; set; } // Setter validation
}
```

**TypeScript Example:**
```typescript
class Item {
    constructor(private readonly name: string) {
        // Constructor validation
        if (!name) throw new Error('Name required');
    }
}
```

Hy vọng giải thích này giúp bạn hiểu rõ sự khác biệt! 🚀