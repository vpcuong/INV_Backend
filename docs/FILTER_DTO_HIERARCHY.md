# Filter DTO Hierarchy

## Cấu trúc phân cấp DTOs

```
PaginationDto
    │
    ├── BaseFilterDto (pagination + search + sort + fields)
    │       │
    │       ├── SupplierFilterDto (BaseFilterDto + quick filters)
    │       ├── CustomerFilterDto (BaseFilterDto + quick filters)
    │       └── ... (other custom filter DTOs)
    │
    └── FilterDto (BaseFilterDto + advanced filters)
            └── Generic filtering with JSON-based filters
```

---

## 1. PaginationDto

**Chứa:** Chỉ pagination
**Sử dụng khi:** Chỉ cần phân trang, không cần filter/search/sort

```typescript
export class PaginationDto {
  page?: number = 1;
  limit?: number = 10;
}
```

**API Example:**
```bash
GET /suppliers?page=1&limit=20
```

---

## 2. BaseFilterDto

**Extends:** `PaginationDto`
**Chứa:** pagination + search + sort + fields
**KHÔNG có:** advanced filters (filters parameter)
**Sử dụng khi:** Cần pagination + search + sort nhưng KHÔNG cần advanced JSON filters

```typescript
export class BaseFilterDto extends PaginationDto {
  search?: string;           // Full-text search
  sort?: SortCondition[];    // Sorting
  fields?: string[];         // Field selection
}
```

**API Example:**
```bash
GET /suppliers?page=1&limit=20&search=ABC&sort=[{"field":"name","order":"asc"}]&fields=id,code,name
```

**Khi nào dùng:**
- ✅ Tạo custom filter DTOs (như SupplierFilterDto)
- ✅ Không muốn expose advanced filters ra ngoài
- ✅ Chỉ cần quick filters + search + sort

---

## 3. SupplierFilterDto

**Extends:** `BaseFilterDto`
**Chứa:** BaseFilterDto + supplier-specific quick filters
**KHÔNG có:** advanced filters
**Sử dụng:** Cho Supplier API

```typescript
export class SupplierFilterDto extends BaseFilterDto {
  // Inherited from BaseFilterDto
  page?: number;
  limit?: number;
  search?: string;
  sort?: SortCondition[];
  fields?: string[];

  // Quick filters - Supplier specific
  status?: SupplierStatus;
  category?: SupplierCategory;
  isActive?: boolean;
  city?: string;
  province?: string;
  country?: string;
  minRating?: number;
  maxRating?: number;
  code?: string;
  name?: string;
}
```

**API Example:**
```bash
# Simple quick filters
GET /suppliers?status=Active&category=Fabric&minRating=4

# With pagination & search
GET /suppliers?status=Active&search=Vietnam&page=1&limit=20

# With sorting
GET /suppliers?category=Fabric&sort=[{"field":"rating","order":"desc"}]
```

**Lợi ích:**
- ✅ Type-safe với enums
- ✅ Better Swagger docs
- ✅ User-friendly API (simple query params)
- ✅ KHÔNG có advanced filters phức tạp
- ✅ Business-specific quick filters

---

## 4. FilterDto

**Extends:** `BaseFilterDto`
**Chứa:** BaseFilterDto + advanced JSON filters
**Sử dụng khi:** Cần advanced filtering với flexible operators

```typescript
export class FilterDto extends BaseFilterDto {
  // Inherited from BaseFilterDto
  page?: number;
  limit?: number;
  search?: string;
  sort?: SortCondition[];
  fields?: string[];

  // Advanced filters
  filters?: FilterCondition[];  // JSON-based filters
}
```

**API Example:**
```bash
# Advanced filters with operators
GET /suppliers?filters=[
  {"field":"status","operator":"eq","value":"Active"},
  {"field":"rating","operator":"gte","value":4},
  {"field":"email","operator":"endsWith","value":"@gmail.com"}
]
```

**Khi nào dùng:**
- ✅ Generic filtering endpoint
- ✅ Cần flexible operators (eq, neq, contains, in, gte, lte, etc.)
- ✅ Dynamic filtering do user tự tạo
- ✅ Advanced use cases

---

## So sánh

| Feature | PaginationDto | BaseFilterDto | SupplierFilterDto | FilterDto |
|---------|--------------|---------------|-------------------|-----------|
| **Pagination** | ✅ | ✅ | ✅ | ✅ |
| **Search** | ❌ | ✅ | ✅ | ✅ |
| **Sort** | ❌ | ✅ | ✅ | ✅ |
| **Fields** | ❌ | ✅ | ✅ | ✅ |
| **Quick Filters** | ❌ | ❌ | ✅ | ❌ |
| **Advanced Filters** | ❌ | ❌ | ❌ | ✅ |
| **Type-safe** | N/A | N/A | ✅ (enums) | ❌ |
| **User-friendly** | ✅ | ✅ | ✅✅ | ❌ |
| **Flexible** | ❌ | ❌ | ❌ | ✅✅ |

---

## Use Cases

### Use Case 1: Simple pagination only
```typescript
// Controller
@Get()
findAll(@Query() pagination: PaginationDto) {
  // ...
}

// API call
GET /items?page=1&limit=20
```

### Use Case 2: Pagination + Search + Sort (NO advanced filters)
```typescript
// Controller
@Get()
findAll(@Query() filterDto: BaseFilterDto) {
  // ...
}

// API call
GET /items?page=1&search=ABC&sort=[{"field":"name","order":"asc"}]
```

### Use Case 3: Custom quick filters (Recommended for most APIs)
```typescript
// DTO
export class SupplierFilterDto extends BaseFilterDto {
  status?: SupplierStatus;
  category?: SupplierCategory;
  isActive?: boolean;
  // ... more quick filters
}

// Controller
@Get()
findAll(@Query() filterDto: SupplierFilterDto) {
  // ...
}

// API call - User-friendly!
GET /suppliers?status=Active&category=Fabric&isActive=true&page=1
```

### Use Case 4: Advanced filtering (Power users)
```typescript
// Controller
@Get()
findAll(@Query() filterDto: FilterDto) {
  // ...
}

// API call - Powerful but complex
GET /items?filters=[{"field":"price","operator":"gte","value":100}]
```

---

## Migration Example

### Before (Using FilterDto everywhere)
```typescript
// ❌ Exposes advanced filters everywhere
export class SupplierFilterDto extends FilterDto {
  status?: SupplierStatus;
  category?: SupplierCategory;
}

// API - User has to deal with both quick filters AND advanced filters
GET /suppliers?status=Active&filters=[...]  // Confusing!
```

### After (Using BaseFilterDto)
```typescript
// ✅ Only quick filters, no advanced filters
export class SupplierFilterDto extends BaseFilterDto {
  status?: SupplierStatus;
  category?: SupplierCategory;
}

// API - Clear and simple
GET /suppliers?status=Active&category=Fabric  // Clean!
```

---

## Best Practices

### 1. Use BaseFilterDto for custom DTOs
```typescript
// ✅ GOOD
export class SupplierFilterDto extends BaseFilterDto {
  // Add supplier-specific quick filters
}

// ❌ BAD
export class SupplierFilterDto extends FilterDto {
  // Now you have advanced filters too, which might not be needed
}
```

### 2. Use FilterDto for generic endpoints
```typescript
// ✅ GOOD - Generic admin panel filtering
@Get('admin/data')
findAll(@Query() filterDto: FilterDto) {
  // Power users can use advanced filters
}
```

### 3. Keep it simple for end users
```typescript
// ✅ GOOD - Simple for end users
export class SupplierFilterDto extends BaseFilterDto {
  status?: SupplierStatus;      // Simple enum
  isActive?: boolean;           // Simple boolean
}

// ❌ BAD - Too complex for end users
export class SupplierFilterDto extends FilterDto {
  // Users have to learn JSON filter syntax
}
```

---

## Summary

**Hierarchy:**
```
PaginationDto
    └── BaseFilterDto (+ search, sort, fields)
            ├── SupplierFilterDto (+ quick filters) ✅ Recommended
            └── FilterDto (+ advanced filters) - Only when needed
```

**Choose:**
- **PaginationDto**: Chỉ cần pagination
- **BaseFilterDto**: Cần search + sort + fields, không cần advanced filters
- **Custom DTO extends BaseFilterDto**: Recommend cho hầu hết APIs (như SupplierFilterDto)
- **FilterDto**: Chỉ khi thực sự cần advanced filtering

**Lợi ích của thiết kế này:**
- ✅ Tách biệt concerns
- ✅ Linh hoạt - pick what you need
- ✅ User-friendly cho end users
- ✅ Powerful cho power users (khi cần)
- ✅ Type-safe với custom DTOs
- ✅ Better Swagger documentation
