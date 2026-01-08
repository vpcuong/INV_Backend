# Filtering System - Examples

## Ví dụ thực tế sử dụng Filtering System

### 1. Simple Search

**Request:**
```bash
GET /suppliers?search=ABC
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "code": "SUP001",
      "name": "ABC Textiles Co.",
      "email": "contact@abctextiles.com",
      "phone": "+84123456789",
      "isActive": true
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### 2. Filter Active Suppliers

**Request:**
```bash
GET /suppliers?filters=[{"field":"isActive","operator":"eq","value":true}]
```

### 3. Filter by Category and Status

**Request:**
```bash
GET /suppliers?filters=[
  {"field":"category","operator":"eq","value":"Fabric"},
  {"field":"status","operator":"eq","value":"Active"}
]
```

### 4. Search + Filter + Sort

**Request:**
```bash
GET /suppliers?search=Vietnam&filters=[{"field":"isActive","operator":"eq","value":true}]&sort=[{"field":"rating","order":"desc"}]
```

### 5. Pagination Example

**Request:**
```bash
GET /suppliers?page=2&limit=20
```

### 6. Filter by Rating Range

**Request:**
```bash
# Suppliers with rating >= 4
GET /suppliers?filters=[{"field":"rating","operator":"gte","value":4}]

# Suppliers with rating between 3 and 5
GET /suppliers?filters=[
  {"field":"rating","operator":"gte","value":3},
  {"field":"rating","operator":"lte","value":5}
]
```

### 7. Filter by Multiple Categories

**Request:**
```bash
GET /suppliers?filters=[{"field":"category","operator":"in","value":["Fabric","Accessories","Yarn"]}]
```

### 8. Search with Field Selection

**Request:**
```bash
GET /suppliers?search=ABC&fields=id,code,name,email
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "code": "SUP001",
      "name": "ABC Textiles Co.",
      "email": "contact@abctextiles.com"
    }
  ],
  "meta": { ... }
}
```

### 9. Complex Query

**Request:**
```bash
GET /suppliers?search=Vietnam&filters=[
  {"field":"isActive","operator":"eq","value":true},
  {"field":"category","operator":"in","value":["Fabric","Yarn"]},
  {"field":"rating","operator":"gte","value":4}
]&sort=[
  {"field":"rating","order":"desc"},
  {"field":"name","order":"asc"}
]&page=1&limit=20
```

**What this does:**
- Search for "Vietnam" in searchable fields (code, name, email, phone)
- Filter: Only active suppliers
- Filter: Category must be Fabric or Yarn
- Filter: Rating >= 4
- Sort: By rating descending, then by name ascending
- Pagination: Page 1, 20 items per page

### 10. Find Suppliers by City

**Request:**
```bash
GET /suppliers?filters=[{"field":"city","operator":"eq","value":"Ho Chi Minh City"}]
```

### 11. String Pattern Matching

**Request:**
```bash
# Suppliers with name containing "Textile"
GET /suppliers?filters=[{"field":"name","operator":"contains","value":"Textile"}]

# Suppliers with code starting with "SUP"
GET /suppliers?filters=[{"field":"code","operator":"startsWith","value":"SUP"}]

# Suppliers with email ending with "@gmail.com"
GET /suppliers?filters=[{"field":"email","operator":"endsWith","value":"@gmail.com"}]
```

### 12. Null Checks

**Request:**
```bash
# Suppliers with rating
GET /suppliers?filters=[{"field":"rating","operator":"isNotNull"}]

# Suppliers without rating
GET /suppliers?filters=[{"field":"rating","operator":"isNull"}]
```

## Frontend Integration Examples

### React/TypeScript Example

```typescript
import axios from 'axios';

interface FilterParams {
  search?: string;
  page?: number;
  limit?: number;
  filters?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  sort?: Array<{
    field: string;
    order: 'asc' | 'desc';
  }>;
}

async function fetchSuppliers(params: FilterParams) {
  const queryParams = new URLSearchParams();

  if (params.search) {
    queryParams.append('search', params.search);
  }

  if (params.page) {
    queryParams.append('page', params.page.toString());
  }

  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  if (params.filters && params.filters.length > 0) {
    queryParams.append('filters', JSON.stringify(params.filters));
  }

  if (params.sort && params.sort.length > 0) {
    queryParams.append('sort', JSON.stringify(params.sort));
  }

  const response = await axios.get(`/suppliers?${queryParams.toString()}`);
  return response.data;
}

// Usage
const suppliers = await fetchSuppliers({
  search: 'Vietnam',
  filters: [
    { field: 'isActive', operator: 'eq', value: true },
    { field: 'category', operator: 'in', value: ['Fabric', 'Yarn'] },
  ],
  sort: [
    { field: 'rating', order: 'desc' },
  ],
  page: 1,
  limit: 20,
});
```

### Angular Example

```typescript
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  constructor(private http: HttpClient) {}

  getSuppliers(filterParams: any) {
    let params = new HttpParams();

    if (filterParams.search) {
      params = params.set('search', filterParams.search);
    }

    if (filterParams.filters) {
      params = params.set('filters', JSON.stringify(filterParams.filters));
    }

    if (filterParams.sort) {
      params = params.set('sort', JSON.stringify(filterParams.sort));
    }

    params = params.set('page', filterParams.page || 1);
    params = params.set('limit', filterParams.limit || 10);

    return this.http.get('/suppliers', { params });
  }
}
```

### Vue.js Example

```typescript
import axios from 'axios';

export default {
  data() {
    return {
      suppliers: [],
      meta: {},
      filters: {
        search: '',
        page: 1,
        limit: 10,
        filterConditions: [],
        sortConditions: [],
      },
    };
  },
  methods: {
    async loadSuppliers() {
      const params = {
        search: this.filters.search,
        page: this.filters.page,
        limit: this.filters.limit,
        filters: JSON.stringify(this.filters.filterConditions),
        sort: JSON.stringify(this.filters.sortConditions),
      };

      const response = await axios.get('/suppliers', { params });
      this.suppliers = response.data.data;
      this.meta = response.data.meta;
    },

    applyFilter(field, operator, value) {
      this.filters.filterConditions.push({ field, operator, value });
      this.loadSuppliers();
    },

    applySort(field, order) {
      this.filters.sortConditions = [{ field, order }];
      this.loadSuppliers();
    },
  },
};
```

## Testing Examples

### Postman Collection

```json
{
  "name": "Supplier Filtering Tests",
  "item": [
    {
      "name": "Get All Suppliers",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/suppliers"
      }
    },
    {
      "name": "Search Suppliers",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/suppliers?search=ABC",
          "query": [
            { "key": "search", "value": "ABC" }
          ]
        }
      }
    },
    {
      "name": "Filter Active Suppliers",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/suppliers?filters=[{\"field\":\"isActive\",\"operator\":\"eq\",\"value\":true}]",
          "query": [
            {
              "key": "filters",
              "value": "[{\"field\":\"isActive\",\"operator\":\"eq\",\"value\":true}]"
            }
          ]
        }
      }
    },
    {
      "name": "Complex Query",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/suppliers?search=Vietnam&filters=[{\"field\":\"isActive\",\"operator\":\"eq\",\"value\":true},{\"field\":\"rating\",\"operator\":\"gte\",\"value\":4}]&sort=[{\"field\":\"rating\",\"order\":\"desc\"}]&page=1&limit=20",
          "query": [
            { "key": "search", "value": "Vietnam" },
            {
              "key": "filters",
              "value": "[{\"field\":\"isActive\",\"operator\":\"eq\",\"value\":true},{\"field\":\"rating\",\"operator\":\"gte\",\"value\":4}]"
            },
            {
              "key": "sort",
              "value": "[{\"field\":\"rating\",\"order\":\"desc\"}]"
            },
            { "key": "page", "value": "1" },
            { "key": "limit", "value": "20" }
          ]
        }
      }
    }
  ]
}
```

## Performance Tips

1. **Use Field Selection** - Chỉ lấy fields cần thiết
```bash
GET /suppliers?fields=id,code,name
```

2. **Limit Result Set** - Đặt limit hợp lý
```bash
GET /suppliers?limit=20
```

3. **Index Database Fields** - Đảm bảo các fields thường được filter/sort có index

4. **Avoid Deep Relations** - Chỉ include relations khi thực sự cần

5. **Cache Results** - Cache kết quả cho các query phổ biến