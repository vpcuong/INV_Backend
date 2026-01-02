# Filtering System Documentation

## Tổng quan

Filtering System cung cấp một giải pháp toàn diện cho việc search, filter, sort và pagination cho tất cả các API endpoints.

## Cấu trúc

```
src/common/filtering/
├── dto/
│   └── filter.dto.ts           # DTOs cho filtering
├── interfaces/
│   └── filter-config.interface.ts  # Interface config
├── query-builder.service.ts    # Service build Prisma queries
├── filtering.module.ts         # Module definition
└── index.ts                    # Exports
```

## Cài đặt

### 1. Import FilteringModule vào AppModule

```typescript
import { FilteringModule } from './common/filtering';

@Module({
  imports: [
    FilteringModule,  // Add this
    // ... other modules
  ],
})
export class AppModule {}
```

### 2. Sử dụng trong Service

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { QueryBuilderService, FilterDto } from '@/common/filtering';

@Injectable()
export class SupplierService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
  ) {}

  async findAll(filterDto: FilterDto) {
    // Config cho filtering
    const config = {
      searchableFields: ['code', 'name', 'email', 'phone'],
      filterableFields: ['status', 'category', 'isActive', 'city', 'country'],
      sortableFields: ['code', 'name', 'createdAt', 'sortOrder'],
      defaultSort: [
        { field: 'sortOrder', order: 'asc' as const },
        { field: 'code', order: 'asc' as const },
      ],
    };

    // Build query từ FilterDto
    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Execute queries
    const [data, total] = await Promise.all([
      this.prisma.client.supplier.findMany(query),
      this.prisma.client.supplier.count({ where: query.where }),
    ]);

    // Return paginated response
    return this.queryBuilder.buildPaginatedResponse(
      data,
      total,
      filterDto.page || 1,
      filterDto.limit || 10,
    );
  }
}
```

### 3. Sử dụng trong Controller

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FilterDto } from '@/common/filtering';

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  @ApiOperation({ summary: 'Get all suppliers with filtering' })
  findAll(@Query() filterDto: FilterDto) {
    return this.supplierService.findAll(filterDto);
  }
}
```

## API Usage Examples

### 1. Pagination

```bash
# Page 1, 10 items per page (default)
GET /suppliers

# Page 2, 20 items per page
GET /suppliers?page=2&limit=20
```

### 2. Search

Search across multiple fields (code, name, email, phone):

```bash
GET /suppliers?search=ABC
```

### 3. Filtering

Filter by specific fields:

```bash
# Single filter: Active suppliers only
GET /suppliers?filters=[{"field":"isActive","operator":"eq","value":true}]

# Multiple filters: Active suppliers in Vietnam
GET /suppliers?filters=[
  {"field":"isActive","operator":"eq","value":true},
  {"field":"country","operator":"eq","value":"Vietnam"}
]

# String contains
GET /suppliers?filters=[{"field":"name","operator":"contains","value":"Textile"}]

# Numeric comparisons
GET /suppliers?filters=[{"field":"rating","operator":"gte","value":4}]

# IN operator
GET /suppliers?filters=[{"field":"category","operator":"in","value":["Fabric","Accessories"]}]
```

### 4. Sorting

```bash
# Single sort: by name ascending
GET /suppliers?sort=[{"field":"name","order":"asc"}]

# Multiple sort: by sortOrder asc, then name desc
GET /suppliers?sort=[
  {"field":"sortOrder","order":"asc"},
  {"field":"name","order":"desc"}
]
```

### 5. Field Selection

Select specific fields to return:

```bash
GET /suppliers?fields=id,code,name,email
```

### 6. Combined Example

```bash
GET /suppliers?search=Vietnam&filters=[{"field":"isActive","operator":"eq","value":true}]&sort=[{"field":"rating","order":"desc"}]&page=1&limit=20
```

## Filter Operators

| Operator | Code | Description | Example |
|----------|------|-------------|---------|
| Equals | `eq` | Exact match | `{"field":"status","operator":"eq","value":"Active"}` |
| Not Equals | `neq` | Not equal | `{"field":"status","operator":"neq","value":"Inactive"}` |
| Greater Than | `gt` | Greater than | `{"field":"rating","operator":"gt","value":3}` |
| Greater Than or Equals | `gte` | Greater than or equal | `{"field":"rating","operator":"gte","value":4}` |
| Less Than | `lt` | Less than | `{"field":"rating","operator":"lt","value":5}` |
| Less Than or Equals | `lte` | Less than or equal | `{"field":"rating","operator":"lte","value":4}` |
| Contains | `contains` | String contains (case-insensitive) | `{"field":"name","operator":"contains","value":"Textile"}` |
| Starts With | `startsWith` | String starts with | `{"field":"code","operator":"startsWith","value":"SUP"}` |
| Ends With | `endsWith` | String ends with | `{"field":"email","operator":"endsWith","value":"@gmail.com"}` |
| In | `in` | Value in array | `{"field":"category","operator":"in","value":["Fabric","Yarn"]}` |
| Not In | `notIn` | Value not in array | `{"field":"status","operator":"notIn","value":["Blacklist"]}` |
| Is Null | `isNull` | Field is null | `{"field":"rating","operator":"isNull"}` |
| Is Not Null | `isNotNull` | Field is not null | `{"field":"email","operator":"isNotNull"}` |

## Response Format

```json
{
  "data": [
    {
      "id": 1,
      "code": "SUP001",
      "name": "ABC Textiles Co.",
      "email": "contact@abctextiles.com",
      // ... other fields
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## FilterConfig Options

```typescript
interface FilterConfig {
  // Fields that can be searched (for search query)
  searchableFields?: string[];

  // Fields that can be filtered
  filterableFields?: string[];

  // Fields that can be sorted
  sortableFields?: string[];

  // Default sort configuration
  defaultSort?: Array<{ field: string; order: 'asc' | 'desc' }>;

  // Relations to include
  relations?: string[];

  // Maximum items per page (default: 100)
  maxLimit?: number;
}
```

## Best Practices

1. **Luôn định nghĩa config rõ ràng** - Chỉ cho phép filter/sort trên các fields an toàn
2. **Sử dụng searchableFields** - Cho phép search trên các text fields quan trọng
3. **Set maxLimit hợp lý** - Tránh query quá nhiều data
4. **Sử dụng relations cẩn thận** - Chỉ include relations khi cần thiết
5. **Default sort** - Luôn có default sort để kết quả nhất quán

## Advanced Examples

### With Relations

```typescript
const config = {
  searchableFields: ['code', 'name'],
  filterableFields: ['isActive'],
  sortableFields: ['code', 'createdAt'],
  relations: ['supplierItems', 'poHeader'],  // Include relations
};
```

### Custom Query Building

```typescript
async findAll(filterDto: FilterDto) {
  const config = { /* ... */ };
  const query = this.queryBuilder.buildQuery(filterDto, config);

  // Add custom conditions
  query.where.AND = query.where.AND || [];
  query.where.AND.push({ deletedAt: null });  // Soft delete

  const [data, total] = await Promise.all([
    this.prisma.client.supplier.findMany(query),
    this.prisma.client.supplier.count({ where: query.where }),
  ]);

  return this.queryBuilder.buildPaginatedResponse(
    data,
    total,
    filterDto.page || 1,
    filterDto.limit || 10,
  );
}
```

## Migration Guide

### Before (Old way)

```typescript
async findAll() {
  return this.prisma.client.supplier.findMany({
    orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
  });
}
```

### After (With Filtering System)

```typescript
async findAll(filterDto: FilterDto) {
  const config = {
    searchableFields: ['code', 'name', 'email'],
    filterableFields: ['status', 'isActive', 'category'],
    sortableFields: ['code', 'name', 'createdAt', 'sortOrder'],
    defaultSort: [
      { field: 'sortOrder', order: 'asc' as const },
      { field: 'code', order: 'asc' as const },
    ],
  };

  const query = this.queryBuilder.buildQuery(filterDto, config);
  const [data, total] = await Promise.all([
    this.prisma.client.supplier.findMany(query),
    this.prisma.client.supplier.count({ where: query.where }),
  ]);

  return this.queryBuilder.buildPaginatedResponse(
    data,
    total,
    filterDto.page || 1,
    filterDto.limit || 10,
  );
}
```