# Supplier API Endpoints

## Tổng quan tất cả các endpoints

### Base URL
```
/suppliers
```

---

## 1. GET /suppliers
**Get all suppliers with filtering, sorting, and pagination**

### Description
Endpoint chính để lấy danh sách suppliers với đầy đủ tính năng filtering, sorting, và pagination.

### Query Parameters

#### Quick Filters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | enum | Filter by status (Active, Inactive, Blacklist) | `status=Active` |
| `category` | enum | Filter by category (Fabric, Accessories, Packaging, Yarn) | `category=Fabric` |
| `isActive` | boolean | Filter by active status | `isActive=true` |
| `city` | string | Filter by city | `city=Ho Chi Minh City` |
| `province` | string | Filter by province | `province=Ho Chi Minh` |
| `country` | string | Filter by country | `country=Vietnam` |
| `minRating` | number | Minimum rating (0-5) | `minRating=4` |
| `maxRating` | number | Maximum rating (0-5) | `maxRating=5` |
| `code` | string | Search by supplier code | `code=SUP001` |
| `name` | string | Search by supplier name | `name=ABC` |
| `includeItems` | boolean | Include supplier items | `includeItems=true` |
| `includeOrders` | boolean | Include purchase orders | `includeOrders=true` |

#### Base Filters (from FilterDto)
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Full-text search | `search=textile` |
| `page` | number | Page number (1-based) | `page=1` |
| `limit` | number | Items per page (max 100) | `limit=20` |
| `filters` | JSON | Advanced filters | `filters=[{"field":"rating","operator":"gte","value":4}]` |
| `sort` | JSON | Sort conditions | `sort=[{"field":"name","order":"asc"}]` |
| `fields` | string | Field selection | `fields=id,code,name` |

### Examples

#### Example 1: Simple pagination
```bash
GET /suppliers?page=1&limit=20
```

#### Example 2: Filter active fabric suppliers
```bash
GET /suppliers?isActive=true&category=Fabric
```

#### Example 3: Search with rating filter
```bash
GET /suppliers?search=Vietnam&minRating=4
```

#### Example 4: Complete query
```bash
GET /suppliers?status=Active&category=Fabric&country=Vietnam&minRating=4&includeItems=true&sort=[{"field":"rating","order":"desc"}]&page=1&limit=20
```

#### Example 5: Advanced filters
```bash
GET /suppliers?filters=[{"field":"createdAt","operator":"gte","value":"2024-01-01"}]&sort=[{"field":"createdAt","order":"desc"}]
```

### Response
```json
{
  "data": [
    {
      "id": 1,
      "code": "SUP001",
      "name": "ABC Textiles Co.",
      "email": "contact@abctextiles.com",
      "phone": "+84123456789",
      "website": "https://abctextiles.com",
      "address": "123 Main Street",
      "city": "Ho Chi Minh City",
      "province": "Ho Chi Minh",
      "country": "Vietnam",
      "postalCode": "700000",
      "taxId": "0123456789",
      "contactPerson": "John Doe",
      "paymentTerms": "NET30",
      "status": "Active",
      "category": "Fabric",
      "rating": 4.5,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "createdBy": "admin",
      "sortOrder": 0
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

---

## 2. GET /suppliers/filter/active
**Get active suppliers only**

### Description
Shortcut endpoint to get only active suppliers (isActive = true).

### Query Parameters
Accepts all parameters from GET /suppliers (except isActive is forced to true)

### Examples
```bash
GET /suppliers/filter/active?category=Fabric&page=1&limit=20
```

### Response
Same format as GET /suppliers

---

## 3. GET /suppliers/filter/category/:category
**Get suppliers by category**

### Description
Get suppliers filtered by specific category.

### Path Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `category` | string | Category name | `Fabric`, `Accessories`, `Packaging`, `Yarn` |

### Query Parameters
Accepts all parameters from GET /suppliers (except category is set from path)

### Examples
```bash
# Get all fabric suppliers
GET /suppliers/filter/category/Fabric

# Get active fabric suppliers in Vietnam
GET /suppliers/filter/category/Fabric?isActive=true&country=Vietnam

# Get fabric suppliers with high rating
GET /suppliers/filter/category/Fabric?minRating=4&sort=[{"field":"rating","order":"desc"}]
```

### Response
Same format as GET /suppliers

---

## 4. GET /suppliers/:id
**Get a supplier by ID**

### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Supplier ID |

### Examples
```bash
GET /suppliers/1
```

### Response
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Textiles Co.",
  "email": "contact@abctextiles.com",
  // ... all supplier fields
}
```

---

## 5. POST /suppliers
**Create a new supplier**

### Request Body
```json
{
  "code": "SUP001",
  "name": "ABC Textiles Co.",
  "phone": "+84123456789",
  "email": "contact@abctextiles.com",
  "website": "https://abctextiles.com",
  "address": "123 Main Street",
  "city": "Ho Chi Minh City",
  "province": "Ho Chi Minh",
  "country": "Vietnam",
  "postalCode": "700000",
  "taxId": "0123456789",
  "contactPerson": "John Doe",
  "paymentTerms": "NET30",
  "status": "Active",
  "category": "Fabric",
  "rating": 4.5,
  "isActive": true,
  "sortOrder": 0,
  "createdBy": "admin"
}
```

### Response
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Textiles Co.",
  // ... all fields including generated id, createdAt, updatedAt
}
```

---

## 6. PATCH /suppliers/:id
**Update a supplier**

### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Supplier ID |

### Request Body
All fields are optional (partial update):
```json
{
  "name": "ABC Textiles Co. Ltd.",
  "rating": 5.0,
  "status": "Active"
}
```

### Response
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Textiles Co. Ltd.",
  // ... all updated fields
}
```

---

## 7. DELETE /suppliers/:id
**Delete a supplier**

### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Supplier ID |

### Examples
```bash
DELETE /suppliers/1
```

### Response
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Textiles Co.",
  // ... deleted supplier data
}
```

---

## 8. PATCH /suppliers/:id/activate
**Activate a supplier**

### Description
Set isActive = true for a supplier

### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Supplier ID |

### Examples
```bash
PATCH /suppliers/1/activate
```

### Response
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Textiles Co.",
  "isActive": true,
  // ... all fields
}
```

---

## 9. PATCH /suppliers/:id/deactivate
**Deactivate a supplier**

### Description
Set isActive = false for a supplier

### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Supplier ID |

### Examples
```bash
PATCH /suppliers/1/deactivate
```

### Response
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Textiles Co.",
  "isActive": false,
  // ... all fields
}
```

---

## Filter Operators Reference

| Operator | Code | Description | Example |
|----------|------|-------------|---------|
| Equals | `eq` | Exact match | `{"field":"status","operator":"eq","value":"Active"}` |
| Not Equals | `neq` | Not equal | `{"field":"status","operator":"neq","value":"Inactive"}` |
| Greater Than | `gt` | Greater than | `{"field":"rating","operator":"gt","value":3}` |
| Greater Than or Equals | `gte` | Greater than or equal | `{"field":"rating","operator":"gte","value":4}` |
| Less Than | `lt` | Less than | `{"field":"rating","operator":"lt","value":5}` |
| Less Than or Equals | `lte` | Less than or equal | `{"field":"rating","operator":"lte","value":4}` |
| Contains | `contains` | String contains | `{"field":"name","operator":"contains","value":"Textile"}` |
| Starts With | `startsWith` | String starts with | `{"field":"code","operator":"startsWith","value":"SUP"}` |
| Ends With | `endsWith` | String ends with | `{"field":"email","operator":"endsWith","value":"@gmail.com"}` |
| In | `in` | Value in array | `{"field":"category","operator":"in","value":["Fabric","Yarn"]}` |
| Not In | `notIn` | Value not in array | `{"field":"status","operator":"notIn","value":["Blacklist"]}` |
| Is Null | `isNull` | Field is null | `{"field":"rating","operator":"isNull"}` |
| Is Not Null | `isNotNull` | Field is not null | `{"field":"email","operator":"isNotNull"}` |

---

## Common Use Cases

### Use Case 1: Get Active Fabric Suppliers in Vietnam
```bash
GET /suppliers?isActive=true&category=Fabric&country=Vietnam
```

### Use Case 2: Get Top Rated Suppliers
```bash
GET /suppliers?minRating=4.5&sort=[{"field":"rating","order":"desc"}]&limit=10
```

### Use Case 3: Search Suppliers by Name or Code
```bash
GET /suppliers?search=ABC
```

### Use Case 4: Get Suppliers Created This Year
```bash
GET /suppliers?filters=[{"field":"createdAt","operator":"gte","value":"2024-01-01"}]
```

### Use Case 5: Get Suppliers with Items and Orders
```bash
GET /suppliers?includeItems=true&includeOrders=true
```

### Use Case 6: Get Suppliers by Multiple Categories
```bash
GET /suppliers?filters=[{"field":"category","operator":"in","value":["Fabric","Accessories","Yarn"]}]
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "email must be a valid email"
    }
  ]
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Supplier with ID 999 not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Supplier with code SUP001 already exists"
}
```
