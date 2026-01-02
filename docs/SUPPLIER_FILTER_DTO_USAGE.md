# SupplierFilterDto - Usage Guide

## Tổng quan

`SupplierFilterDto` là một custom DTO extend từ `FilterDto` base class, được thiết kế riêng cho Supplier API với các quick filters thường dùng.

## Lợi ích của SupplierFilterDto

### 1. **Type-safe & Auto-complete**
- IDE hỗ trợ auto-complete
- Type checking tại compile time
- Validation tự động với class-validator

### 2. **Swagger Documentation**
- Tự động tạo API docs
- Hiển thị rõ ràng các filter options
- Có enums cho status và category

### 3. **Easier to Use**
- Quick filters không cần JSON stringify
- Tích hợp sẵn các filter phổ biến
- URL query params đơn giản hơn

## Controller Implementation

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SupplierFilterDto } from './dto/supplier-filter.dto';
import { SupplierQueryService } from './application/supplier-query.service';

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(
    private readonly supplierQueryService: SupplierQueryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all suppliers with filtering' })
  findAll(@Query() filterDto: SupplierFilterDto) {
    return this.supplierQueryService.findAllWithFilters(filterDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active suppliers only' })
  findActive(@Query() filterDto: SupplierFilterDto) {
    // Override isActive to true
    filterDto.isActive = true;
    return this.supplierQueryService.findAllWithFilters(filterDto);
  }
}
```

## API Usage Examples

### 1. Quick Filters (Simple Query Params)

#### Filter by Status
```bash
GET /suppliers?status=Active
```

#### Filter by Category
```bash
GET /suppliers?category=Fabric
```

#### Filter Active Suppliers
```bash
GET /suppliers?isActive=true
```

#### Filter by Location
```bash
GET /suppliers?city=Ho%20Chi%20Minh%20City
GET /suppliers?province=Ho%20Chi%20Minh
GET /suppliers?country=Vietnam
```

#### Filter by Rating Range
```bash
# Suppliers with rating >= 4
GET /suppliers?minRating=4

# Suppliers with rating between 3 and 5
GET /suppliers?minRating=3&maxRating=5
```

#### Quick Search by Code or Name
```bash
GET /suppliers?code=SUP001
GET /suppliers?name=ABC
```

### 2. Combined Quick Filters
```bash
# Active Fabric suppliers in Vietnam with rating >= 4
GET /suppliers?isActive=true&category=Fabric&country=Vietnam&minRating=4
```

### 3. Include Relations
```bash
# Include supplier items
GET /suppliers?includeItems=true

# Include purchase orders
GET /suppliers?includeOrders=true

# Include both
GET /suppliers?includeItems=true&includeOrders=true
```

### 4. Pagination
```bash
GET /suppliers?page=1&limit=20
```

### 5. Full-text Search
```bash
# Search across code, name, email, phone, contactPerson, taxId
GET /suppliers?search=ABC
```

### 6. Sorting
```bash
# Sort by name ascending
GET /suppliers?sort=[{"field":"name","order":"asc"}]

# Sort by rating descending, then by name
GET /suppliers?sort=[{"field":"rating","order":"desc"},{"field":"name","order":"asc"}]
```

### 7. Advanced Filters (JSON-based)
```bash
# Still supports advanced filters từ base FilterDto
GET /suppliers?filters=[{"field":"taxId","operator":"isNotNull"}]
```

### 8. Complete Example
```bash
GET /suppliers?status=Active&category=Fabric&country=Vietnam&minRating=4&search=textile&includeItems=true&sort=[{"field":"rating","order":"desc"}]&page=1&limit=20
```

**Breakdown:**
- `status=Active` - Only active status suppliers
- `category=Fabric` - Only fabric category
- `country=Vietnam` - Only in Vietnam
- `minRating=4` - Rating >= 4
- `search=textile` - Search "textile" in searchable fields
- `includeItems=true` - Include supplier items relation
- `sort=[...]` - Sort by rating descending
- `page=1&limit=20` - First page, 20 items

## Response Format

```json
{
  "data": [
    {
      "id": 1,
      "code": "SUP001",
      "name": "ABC Textiles Co.",
      "email": "contact@abctextiles.com",
      "phone": "+84123456789",
      "status": "Active",
      "category": "Fabric",
      "country": "Vietnam",
      "city": "Ho Chi Minh City",
      "rating": 4.5,
      "isActive": true,
      "supplierItems": [
        // Included when includeItems=true
        {
          "id": 1,
          "itemId": 10,
          "supplierId": 1
        }
      ]
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Quick Filters vs Advanced Filters

### Quick Filters (SupplierFilterDto)
**Pros:**
- ✅ Easier to use (simple query params)
- ✅ No JSON encoding needed
- ✅ Better Swagger docs
- ✅ Type-safe enums

**Example:**
```bash
GET /suppliers?status=Active&category=Fabric&minRating=4
```

### Advanced Filters (Base FilterDto)
**Pros:**
- ✅ More flexible operators
- ✅ Complex conditions
- ✅ Multiple conditions on same field

**Example:**
```bash
GET /suppliers?filters=[{"field":"rating","operator":"gte","value":4},{"field":"email","operator":"endsWith","value":"@gmail.com"}]
```

## Best Practices

### 1. Use Quick Filters for Common Cases
```bash
# Good - Simple and readable
GET /suppliers?status=Active&category=Fabric

# Also works, but more complex
GET /suppliers?filters=[{"field":"status","operator":"eq","value":"Active"},{"field":"category","operator":"eq","value":"Fabric"}]
```

### 2. Combine Quick Filters + Advanced Filters
```bash
# Quick filter for status, advanced filter for complex conditions
GET /suppliers?status=Active&filters=[{"field":"createdAt","operator":"gte","value":"2024-01-01"}]
```

### 3. Use Enums for Validation
```typescript
// SupplierFilterDto already defines enums
export enum SupplierStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  BLACKLIST = 'Blacklist',
}

export enum SupplierCategory {
  FABRIC = 'Fabric',
  ACCESSORIES = 'Accessories',
  PACKAGING = 'Packaging',
  YARN = 'Yarn',
}
```

## Frontend Integration

### TypeScript/React Example

```typescript
interface SupplierFilterParams {
  // Quick filters
  status?: 'Active' | 'Inactive' | 'Blacklist';
  category?: 'Fabric' | 'Accessories' | 'Packaging' | 'Yarn';
  isActive?: boolean;
  city?: string;
  country?: string;
  minRating?: number;
  maxRating?: number;
  code?: string;
  name?: string;

  // Relations
  includeItems?: boolean;
  includeOrders?: boolean;

  // Pagination
  page?: number;
  limit?: number;

  // Search & Sort
  search?: string;
  sort?: Array<{ field: string; order: 'asc' | 'desc' }>;
}

async function fetchSuppliers(params: SupplierFilterParams) {
  const queryParams = new URLSearchParams();

  // Add quick filters
  if (params.status) queryParams.append('status', params.status);
  if (params.category) queryParams.append('category', params.category);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
  if (params.city) queryParams.append('city', params.city);
  if (params.country) queryParams.append('country', params.country);
  if (params.minRating !== undefined) queryParams.append('minRating', params.minRating.toString());
  if (params.maxRating !== undefined) queryParams.append('maxRating', params.maxRating.toString());
  if (params.code) queryParams.append('code', params.code);
  if (params.name) queryParams.append('name', params.name);

  // Relations
  if (params.includeItems) queryParams.append('includeItems', 'true');
  if (params.includeOrders) queryParams.append('includeOrders', 'true');

  // Pagination
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  // Search
  if (params.search) queryParams.append('search', params.search);

  // Sort
  if (params.sort) queryParams.append('sort', JSON.stringify(params.sort));

  const response = await fetch(`/suppliers?${queryParams.toString()}`);
  return response.json();
}

// Usage
const suppliers = await fetchSuppliers({
  status: 'Active',
  category: 'Fabric',
  country: 'Vietnam',
  minRating: 4,
  includeItems: true,
  page: 1,
  limit: 20,
});
```

## Extending SupplierFilterDto

Bạn có thể thêm các quick filters khác nếu cần:

```typescript
export class SupplierFilterDto extends FilterDto {
  // Existing quick filters...

  @ApiPropertyOptional({ description: 'Filter by payment terms' })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Filter suppliers created after date' })
  @IsOptional()
  @Type(() => Date)
  createdAfter?: Date;

  @ApiPropertyOptional({ description: 'Filter suppliers created before date' })
  @IsOptional()
  @Type(() => Date)
  createdBefore?: Date;
}
```

Sau đó update `applyQuickFilters()` trong `SupplierQueryService` để xử lý các filters mới.