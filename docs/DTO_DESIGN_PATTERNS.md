# DTO Design Patterns - Filter vs Aggregation

## Vấn đề ban đầu

**Câu hỏi:** Có hợp lý không khi `SupplierAggregationRequestDto` kế thừa các thuộc tính phân trang từ `SupplierFilterDto`?

**Trả lời:** **KHÔNG hợp lý!**

---

## Tại sao không hợp lý?

### 1. Aggregation không cần phân trang

**Lọc dữ liệu (Filtering):**
- Trả về **danh sách items** (mảng các suppliers)
- Cần phân trang vì có nhiều items
- Response: `{ data: [...], meta: { page, limit, total } }`

**Tổng hợp dữ liệu (Aggregation):**
- Trả về **tổng hợp/thống kê** (counts, averages, sums)
- KHÔNG có danh sách items để phân trang
- Response: `{ total: 150, active: 120, inactive: 30 }`

### 2. Thuộc tính thừa gây nhầm lẫn

Nếu `SupplierAggregationRequestDto` kế thừa từ `SupplierFilterDto` → có các thuộc tính không cần thiết:

| Thuộc tính | Cần cho Filter? | Cần cho Aggregation? | Lý do |
|------------|-----------------|----------------------|-------|
| `page` | ✅ Có | ❌ Không | Aggregation không trả về danh sách |
| `limit` | ✅ Có | ❌ Không | Không có gì để giới hạn |
| `sort` | ✅ Có | ❌ Không | Aggregation tự động sắp xếp theo count |
| `fields` | ✅ Có | ❌ Không | Aggregation có cấu trúc response cố định |
| `search` | ✅ Có | ✅ Có | Lọc trước khi tổng hợp |
| `status` | ✅ Có | ✅ Có | Lọc trước khi tổng hợp |
| `category` | ✅ Có | ✅ Có | Lọc trước khi tổng hợp |
| `groupBy` | ❌ Không | ✅ Có | Chỉ dùng cho aggregation |
| `metrics` | ❌ Không | ✅ Có | Chỉ dùng cho aggregation |

---

## Giải pháp: Phân tách DTO theo chức năng

### Cấu trúc DTO mới:

```
SupplierQuickFiltersDto (Base - chỉ filters)
    │
    ├── SupplierFilterDto (+ pagination, sort, fields)
    │       → Dùng cho API filtering/listing
    │
    └── SupplierAggregationRequestDto (+ groupBy, metrics)
            → Dùng cho API aggregation/statistics
```

### 1. SupplierQuickFiltersDto (Base Class)

**Chứa:** Chỉ quick filters
**Không có:** Pagination, sort, fields, groupBy, metrics

```typescript
export class SupplierQuickFiltersDto {
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
  search?: string;
}
```

**Đặc điểm:**
- Chỉ chứa các filters có thể áp dụng cho cả filtering VÀ aggregation
- Không có logic phân trang hay sắp xếp
- Base class cho tất cả DTOs cần filter suppliers

### 2. SupplierFilterDto (For Filtering/Listing)

**Extends:** `SupplierQuickFiltersDto`
**Thêm:** Pagination, sort, fields

```typescript
export class SupplierFilterDto extends SupplierQuickFiltersDto {
  // Inherited: status, category, isActive, city, province, country,
  //            minRating, maxRating, code, name, search

  // Pagination
  page?: number = 1;
  limit?: number = 10;

  // Sorting
  sort?: SortCondition[];

  // Field selection
  fields?: string[];
}
```

**Sử dụng:**
- `GET /suppliers` - List suppliers với phân trang
- `GET /suppliers/filter/active` - List active suppliers
- `GET /suppliers/filter/category/:category` - List by category

**Response:**
```json
{
  "data": [...],  // Array of suppliers
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### 3. SupplierAggregationRequestDto (For Aggregation)

**Extends:** `SupplierQuickFiltersDto`
**Thêm:** groupBy, metrics
**KHÔNG có:** page, limit, sort, fields

```typescript
export class SupplierAggregationRequestDto extends SupplierQuickFiltersDto {
  // Inherited: status, category, isActive, city, province, country,
  //            minRating, maxRating, code, name, search

  // Aggregation-specific
  groupBy?: AggregationField[];
  metrics?: AggregationType[];
}
```

**Sử dụng:**
- `GET /suppliers/aggregations/statistics` - Comprehensive stats
- `GET /suppliers/aggregations/custom` - Custom aggregations
- `GET /suppliers/aggregations/active-status` - Active/inactive counts

**Response:**
```json
{
  "total": 150,
  "active": 120,
  "inactive": 30,
  "activePercentage": 80.0,
  "inactivePercentage": 20.0
}
```

---

## So sánh trước và sau refactor

### ❌ TRƯỚC (Không hợp lý)

```typescript
// BAD: Aggregation kế thừa FilterDto
export class SupplierAggregationRequestDto extends SupplierFilterDto {
  groupBy?: AggregationField[];
  metrics?: AggregationType[];
}
```

**Vấn đề:**
- Có `page`, `limit` nhưng không dùng → gây nhầm lẫn
- Có `sort` nhưng aggregation tự động sắp xếp
- Có `fields` nhưng aggregation response cố định
- User có thể truyền `?page=1&limit=20` nhưng không có ý nghĩa
- Swagger docs hiển thị các tham số vô dụng

### ✅ SAU (Hợp lý)

```typescript
// GOOD: Chỉ kế thừa filters
export class SupplierAggregationRequestDto extends SupplierQuickFiltersDto {
  groupBy?: AggregationField[];
  metrics?: AggregationType[];
}
```

**Lợi ích:**
- Chỉ có các tham số cần thiết
- Swagger docs rõ ràng, không có tham số thừa
- Type-safe - không thể truyền page/limit vào aggregation
- Dễ hiểu - user biết rõ aggregation không có phân trang

---

## Nguyên tắc thiết kế DTO

### 1. Single Responsibility Principle (SRP)

Mỗi DTO nên có một trách nhiệm duy nhất:
- `SupplierQuickFiltersDto` - Chỉ chứa filters
- `SupplierFilterDto` - Filtering + Pagination
- `SupplierAggregationRequestDto` - Aggregation + Filters

### 2. Interface Segregation Principle (ISP)

Clients không nên phụ thuộc vào interfaces họ không dùng:
- Aggregation API không nên có pagination parameters
- Filtering API không nên có groupBy/metrics parameters

### 3. Composition Over Inheritance

Chỉ kế thừa những gì thực sự cần:
- ✅ Kế thừa QuickFilters vì cả Filter và Aggregation đều cần
- ❌ KHÔNG kế thừa FilterDto vào AggregationDto vì không cần pagination

---

## Use Cases

### Use Case 1: Lấy danh sách suppliers (Filtering)

**Endpoint:** `GET /suppliers`
**DTO:** `SupplierFilterDto`

**Request:**
```bash
GET /suppliers?category=Fabric&isActive=true&page=1&limit=20&sort=[{"field":"rating","order":"desc"}]
```

**Response:** Danh sách suppliers với pagination
```json
{
  "data": [
    { "id": 1, "name": "ABC", "category": "Fabric" },
    { "id": 2, "name": "XYZ", "category": "Fabric" }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### Use Case 2: Thống kê active/inactive (Aggregation)

**Endpoint:** `GET /suppliers/aggregations/active-status`
**DTO:** `SupplierAggregationRequestDto`

**Request:**
```bash
GET /suppliers/aggregations/active-status?category=Fabric
```

**Response:** Thống kê tổng hợp
```json
{
  "total": 80,
  "active": 70,
  "inactive": 10,
  "activePercentage": 87.5,
  "inactivePercentage": 12.5
}
```

**Lưu ý:** KHÔNG có `page`, `limit` vì không cần phân trang!

### Use Case 3: Tổng hợp theo nhiều chiều (Custom Aggregation)

**Endpoint:** `GET /suppliers/aggregations/custom`
**DTO:** `SupplierAggregationRequestDto`

**Request:**
```bash
GET /suppliers/aggregations/custom?groupBy=["category","status"]&metrics=["count","avg"]&country=Vietnam
```

**Response:** Groups theo category + status
```json
{
  "groups": [
    {
      "groupBy": { "category": "Fabric", "status": "Active" },
      "count": 60,
      "avg": { "rating": 4.5 }
    },
    {
      "groupBy": { "category": "Accessories", "status": "Active" },
      "count": 25,
      "avg": { "rating": 4.2 }
    }
  ],
  "total": 85
}
```

---

## Tổng kết

### Khi nào dùng DTO nào?

| Mục đích | DTO | Có Pagination? | Có GroupBy? |
|----------|-----|---------------|-------------|
| Lấy danh sách suppliers | `SupplierFilterDto` | ✅ Có | ❌ Không |
| Thống kê tổng hợp | `SupplierAggregationRequestDto` | ❌ Không | ✅ Có |
| Base filters cho các DTO khác | `SupplierQuickFiltersDto` | ❌ Không | ❌ Không |

### Nguyên tắc chung:

1. **Filtering (List) → Cần Pagination**
   - Response là array → cần page, limit
   - Dùng `SupplierFilterDto`

2. **Aggregation (Stats) → KHÔNG cần Pagination**
   - Response là tổng hợp → không có array
   - Dùng `SupplierAggregationRequestDto`

3. **Share filters, không share pagination**
   - Both cần filters (status, category, etc.)
   - Chỉ filtering cần page/limit
   - → Tách thành 2 DTOs riêng biệt

### Lợi ích của thiết kế này:

✅ **Rõ ràng** - Mỗi DTO có mục đích cụ thể
✅ **Type-safe** - Không thể truyền tham số không hợp lệ
✅ **Maintainable** - Dễ bảo trì và mở rộng
✅ **Self-documenting** - Code tự giải thích
✅ **Better Swagger docs** - Chỉ hiển thị tham số cần thiết
✅ **Follow SOLID principles** - SRP, ISP

---

## Ví dụ thực tế

### Frontend gọi API thống kê:

```typescript
// ❌ BAD: Frontend có thể nhầm lẫn truyền pagination
const stats = await api.get('/suppliers/aggregations/active-status', {
  params: {
    category: 'Fabric',
    page: 1,        // ← Vô dụng! Nhưng DTO vẫn cho phép
    limit: 20       // ← Vô dụng! Nhưng DTO vẫn cho phép
  }
});

// ✅ GOOD: DTO không cho phép truyền pagination
const stats = await api.get('/suppliers/aggregations/active-status', {
  params: {
    category: 'Fabric',
    // page, limit không tồn tại trong type → TypeScript error
  }
});
// Response: { total: 80, active: 70, inactive: 10 }
```

### Frontend gọi API filtering:

```typescript
// ✅ GOOD: DTO yêu cầu pagination
const suppliers = await api.get('/suppliers', {
  params: {
    category: 'Fabric',
    page: 1,
    limit: 20
  }
});
// Response: { data: [...], meta: { page: 1, limit: 20, total: 80 } }
```

---

## Kết luận

**Câu trả lời:** KHÔNG hợp lý khi `SupplierAggregationRequestDto` có thuộc tính phân trang.

**Giải pháp:** Tách thành 2 DTOs riêng biệt:
- `SupplierFilterDto` - Cho filtering (có pagination)
- `SupplierAggregationRequestDto` - Cho aggregation (KHÔNG có pagination)
- Both kế thừa từ `SupplierQuickFiltersDto` để share filters

**Nguyên tắc:** Aggregation trả về tổng hợp, không phải danh sách → không cần phân trang!
