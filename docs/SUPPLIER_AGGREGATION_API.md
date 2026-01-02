# Supplier Aggregation API Documentation

## Overview

The Supplier Aggregation API provides powerful statistical and analytical capabilities for supplier data. It includes two main endpoints:

1. **Statistics Endpoint** - Comprehensive pre-defined statistics
2. **Custom Aggregation Endpoint** - Flexible grouping and metrics

Both endpoints support all quick filters from `SupplierFilterDto` to narrow down the data before aggregation.

---

## Base URL
```
/suppliers/aggregations
```

---

## 1. GET /suppliers/aggregations/statistics

### Description
Returns comprehensive pre-defined statistics about suppliers including:
- Overall counts (total, active, inactive, blacklisted)
- Rating statistics (average, min, max, distribution)
- Distribution by category, status, country, province, city
- Time-based metrics (created this month/year)

### Query Parameters
Accepts all parameters from `SupplierFilterDto`:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | enum | Filter by status | `status=Active` |
| `category` | enum | Filter by category | `category=Fabric` |
| `isActive` | boolean | Filter by active status | `isActive=true` |
| `city` | string | Filter by city | `city=Ho Chi Minh City` |
| `province` | string | Filter by province | `province=Ho Chi Minh` |
| `country` | string | Filter by country | `country=Vietnam` |
| `minRating` | number | Minimum rating (0-5) | `minRating=4` |
| `maxRating` | number | Maximum rating (0-5) | `maxRating=5` |
| `code` | string | Search by supplier code | `code=SUP001` |
| `name` | string | Search by supplier name | `name=ABC` |
| `search` | string | Full-text search | `search=textile` |

### Examples

#### Example 1: Get all supplier statistics
```bash
GET /suppliers/aggregations/statistics
```

#### Example 2: Get statistics for active suppliers only
```bash
GET /suppliers/aggregations/statistics?isActive=true
```

#### Example 3: Get statistics for fabric suppliers in Vietnam
```bash
GET /suppliers/aggregations/statistics?category=Fabric&country=Vietnam
```

#### Example 4: Get statistics for high-rated suppliers
```bash
GET /suppliers/aggregations/statistics?minRating=4.5
```

### Response
```json
{
  "total": 150,
  "active": 120,
  "inactive": 25,
  "blacklisted": 5,

  "averageRating": 4.2,
  "minRating": 2.5,
  "maxRating": 5.0,
  "suppliersWithRating": 140,
  "suppliersWithoutRating": 10,

  "byCategory": [
    {
      "category": "Fabric",
      "count": 80,
      "percentage": 53.33
    },
    {
      "category": "Accessories",
      "count": 40,
      "percentage": 26.67
    },
    {
      "category": "Yarn",
      "count": 30,
      "percentage": 20.0
    }
  ],

  "byStatus": [
    {
      "status": "Active",
      "count": 120,
      "percentage": 80.0
    },
    {
      "status": "Inactive",
      "count": 25,
      "percentage": 16.67
    },
    {
      "status": "Blacklist",
      "count": 5,
      "percentage": 3.33
    }
  ],

  "byCountry": [
    {
      "country": "Vietnam",
      "count": 100,
      "percentage": 66.67
    },
    {
      "country": "China",
      "count": 30,
      "percentage": 20.0
    },
    {
      "country": "Thailand",
      "count": 20,
      "percentage": 13.33
    }
  ],

  "byProvince": [
    {
      "province": "Ho Chi Minh",
      "count": 60,
      "percentage": 40.0
    },
    {
      "province": "Hanoi",
      "count": 30,
      "percentage": 20.0
    }
  ],

  "byCity": [
    {
      "city": "Ho Chi Minh City",
      "count": 55,
      "percentage": 36.67
    },
    {
      "city": "Hanoi",
      "count": 28,
      "percentage": 18.67
    }
  ],

  "ratingDistribution": [
    {
      "range": "4-5",
      "count": 90,
      "percentage": 60.0
    },
    {
      "range": "3-4",
      "count": 40,
      "percentage": 26.67
    },
    {
      "range": "2-3",
      "count": 10,
      "percentage": 6.67
    },
    {
      "range": "1-2",
      "count": 0,
      "percentage": 0
    },
    {
      "range": "0-1",
      "count": 0,
      "percentage": 0
    }
  ],

  "createdThisMonth": 5,
  "createdThisYear": 45,
  "createdLastMonth": 8,
  "createdLastYear": 95
}
```

---

## 2. GET /suppliers/aggregations/custom

### Description
Flexible aggregation endpoint that allows you to:
- Group suppliers by one or more fields
- Apply various metrics (count, avg, sum, min, max)
- Combine with quick filters

This is useful for custom reporting and analytics.

### Query Parameters

#### Aggregation Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `groupBy` | string[] | Fields to group by (JSON array) | `groupBy=["category","status"]` |
| `metrics` | string[] | Metrics to calculate (JSON array) | `metrics=["count","avg"]` |

#### Available Group By Fields
- `rating` - Group by rating value
- `status` - Group by status (Active, Inactive, Blacklist)
- `category` - Group by category (Fabric, Accessories, etc.)
- `country` - Group by country
- `province` - Group by province
- `city` - Group by city
- `isActive` - Group by active status
- `createdAt` - Group by creation date

#### Available Metrics
- `count` - Count of suppliers in each group
- `avg` - Average rating
- `sum` - Sum of ratings
- `min` - Minimum rating
- `max` - Maximum rating

#### Plus All Quick Filters
All parameters from `SupplierFilterDto` are supported (status, category, isActive, city, province, country, minRating, maxRating, code, name, search)

### Examples

#### Example 1: Count suppliers by category
```bash
GET /suppliers/aggregations/custom?groupBy=["category"]&metrics=["count"]
```

**Response:**
```json
{
  "groups": [
    {
      "groupBy": { "category": "Fabric" },
      "count": 80
    },
    {
      "groupBy": { "category": "Accessories" },
      "count": 40
    },
    {
      "groupBy": { "category": "Yarn" },
      "count": 30
    }
  ],
  "total": 150,
  "appliedFilters": {
    "groupBy": ["category"],
    "metrics": ["count"]
  }
}
```

#### Example 2: Average rating by category and status
```bash
GET /suppliers/aggregations/custom?groupBy=["category","status"]&metrics=["count","avg","min","max"]
```

**Response:**
```json
{
  "groups": [
    {
      "groupBy": { "category": "Fabric", "status": "Active" },
      "count": 70,
      "avg": { "rating": 4.5 },
      "min": { "rating": 3.0 },
      "max": { "rating": 5.0 }
    },
    {
      "groupBy": { "category": "Fabric", "status": "Inactive" },
      "count": 10,
      "avg": { "rating": 3.8 },
      "min": { "rating": 2.5 },
      "max": { "rating": 4.5 }
    },
    {
      "groupBy": { "category": "Accessories", "status": "Active" },
      "count": 35,
      "avg": { "rating": 4.2 },
      "min": { "rating": 3.5 },
      "max": { "rating": 5.0 }
    }
  ],
  "total": 150,
  "appliedFilters": {
    "groupBy": ["category", "status"],
    "metrics": ["count", "avg", "min", "max"]
  }
}
```

#### Example 3: Suppliers by country (filtered by active only)
```bash
GET /suppliers/aggregations/custom?groupBy=["country"]&metrics=["count","avg"]&isActive=true
```

**Response:**
```json
{
  "groups": [
    {
      "groupBy": { "country": "Vietnam" },
      "count": 85,
      "avg": { "rating": 4.3 }
    },
    {
      "groupBy": { "country": "China" },
      "count": 25,
      "avg": { "rating": 4.0 }
    },
    {
      "groupBy": { "country": "Thailand" },
      "count": 10,
      "avg": { "rating": 4.1 }
    }
  ],
  "total": 120,
  "appliedFilters": {
    "groupBy": ["country"],
    "metrics": ["count", "avg"]
  }
}
```

#### Example 4: Overall aggregation (no grouping)
```bash
GET /suppliers/aggregations/custom?metrics=["count","avg","min","max","sum"]
```

**Response:**
```json
{
  "groups": [
    {
      "groupBy": { "overall": "all" },
      "count": 150,
      "avg": { "rating": 4.2 },
      "min": { "rating": 2.5 },
      "max": { "rating": 5.0 },
      "sum": { "rating": 630.0 }
    }
  ],
  "total": 150,
  "appliedFilters": {
    "groupBy": [],
    "metrics": ["count", "avg", "min", "max", "sum"]
  }
}
```

#### Example 5: Complex multi-field grouping with filters
```bash
GET /suppliers/aggregations/custom?groupBy=["category","country","status"]&metrics=["count","avg"]&minRating=4&isActive=true
```

**Response:**
```json
{
  "groups": [
    {
      "groupBy": { "category": "Fabric", "country": "Vietnam", "status": "Active" },
      "count": 45,
      "avg": { "rating": 4.6 }
    },
    {
      "groupBy": { "category": "Fabric", "country": "China", "status": "Active" },
      "count": 15,
      "avg": { "rating": 4.3 }
    },
    {
      "groupBy": { "category": "Accessories", "country": "Vietnam", "status": "Active" },
      "count": 25,
      "avg": { "rating": 4.4 }
    }
  ],
  "total": 85,
  "appliedFilters": {
    "groupBy": ["category", "country", "status"],
    "metrics": ["count", "avg"]
  }
}
```

---

## Common Use Cases

### Use Case 1: Dashboard Statistics
**Requirement:** Show overall supplier statistics on dashboard

```bash
GET /suppliers/aggregations/statistics
```

### Use Case 2: Category Performance Report
**Requirement:** Compare average ratings across categories

```bash
GET /suppliers/aggregations/custom?groupBy=["category"]&metrics=["count","avg","min","max"]
```

### Use Case 3: Geographic Distribution
**Requirement:** See supplier distribution by country and province

```bash
# Using statistics endpoint (top 10 provinces/cities)
GET /suppliers/aggregations/statistics

# Or using custom aggregation (all provinces)
GET /suppliers/aggregations/custom?groupBy=["country","province"]&metrics=["count"]
```

### Use Case 4: Active vs Inactive Comparison
**Requirement:** Compare active vs inactive suppliers by category

```bash
GET /suppliers/aggregations/custom?groupBy=["category","isActive"]&metrics=["count","avg"]
```

### Use Case 5: Quality Analysis
**Requirement:** Analyze supplier quality (rating) by category and country

```bash
GET /suppliers/aggregations/custom?groupBy=["category","country"]&metrics=["count","avg","min","max"]&isActive=true&minRating=3
```

### Use Case 6: Trend Analysis
**Requirement:** New suppliers created this month by category

```bash
# Get statistics for suppliers created this month
GET /suppliers/aggregations/statistics?createdAt={"gte":"2024-01-01"}

# Then use custom aggregation for breakdown
GET /suppliers/aggregations/custom?groupBy=["category"]&metrics=["count"]
```

### Use Case 7: Regional Analysis
**Requirement:** Analyze fabric suppliers in Vietnam by province

```bash
GET /suppliers/aggregations/custom?groupBy=["province"]&metrics=["count","avg"]&category=Fabric&country=Vietnam&isActive=true
```

---

## Performance Considerations

1. **Parallel Execution**: All statistics are computed in parallel using `Promise.all()` for optimal performance

2. **Indexing**: Ensure database indexes on:
   - `category`
   - `status`
   - `country`
   - `province`
   - `city`
   - `rating`
   - `isActive`
   - `createdAt`

3. **Caching**: Consider caching statistics results for:
   - Overall statistics (cache for 5-15 minutes)
   - Category/Status distributions (cache for 10-30 minutes)
   - Country distributions (cache for 30-60 minutes)

4. **Filtering**: Apply filters BEFORE aggregation to reduce dataset size

---

## Comparison: Statistics vs Custom Aggregation

| Feature | Statistics Endpoint | Custom Aggregation |
|---------|-------------------|-------------------|
| **Purpose** | Pre-defined comprehensive stats | Flexible custom grouping |
| **Complexity** | Simple, no configuration needed | Requires groupBy/metrics config |
| **Use Case** | Dashboards, overview reports | Custom reports, analytics |
| **Response Size** | Large (all statistics) | Small (only requested data) |
| **Performance** | Slower (many queries) | Faster (single query) |
| **Flexibility** | Fixed structure | Highly flexible |
| **Best For** | General overview | Specific analysis |

**Recommendation:**
- Use **Statistics** for dashboards and overview pages
- Use **Custom Aggregation** for specific reports and charts

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "groupBy",
      "message": "each value in groupBy must be a valid enum value"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## TypeScript Types

### SupplierAggregationRequestDto
```typescript
export class SupplierAggregationRequestDto extends SupplierFilterDto {
  groupBy?: AggregationField[];  // Fields to group by
  metrics?: AggregationType[];   // Metrics to calculate
}

export enum AggregationField {
  RATING = 'rating',
  STATUS = 'status',
  CATEGORY = 'category',
  COUNTRY = 'country',
  PROVINCE = 'province',
  CITY = 'city',
  IS_ACTIVE = 'isActive',
  CREATED_AT = 'createdAt',
}

export enum AggregationType {
  COUNT = 'count',
  SUM = 'sum',
  AVG = 'avg',
  MIN = 'min',
  MAX = 'max',
}
```

### SupplierStatisticsResponse
```typescript
export interface SupplierStatisticsResponse {
  total: number;
  active: number;
  inactive: number;
  blacklisted: number;

  averageRating: number;
  minRating: number;
  maxRating: number;
  suppliersWithRating: number;
  suppliersWithoutRating: number;

  byCategory: { category: string; count: number; percentage: number; }[];
  byStatus: { status: string; count: number; percentage: number; }[];
  byCountry: { country: string; count: number; percentage: number; }[];
  byProvince: { province: string; count: number; percentage: number; }[];
  byCity: { city: string; count: number; percentage: number; }[];

  ratingDistribution: { range: string; count: number; percentage: number; }[];

  createdThisMonth: number;
  createdThisYear: number;
  createdLastMonth: number;
  createdLastYear: number;
}
```

### SupplierAggregationResponse
```typescript
export interface SupplierAggregationResponse {
  groups: AggregationGroup[];
  total: number;
  appliedFilters: {
    groupBy?: string[];
    metrics?: string[];
  };
}

export interface AggregationGroup {
  groupBy: Record<string, any>;
  count: number;
  sum?: Record<string, number>;
  avg?: Record<string, number>;
  min?: Record<string, number>;
  max?: Record<string, number>;
}
```

---

## Summary

The Supplier Aggregation API provides two complementary endpoints:

1. **GET /suppliers/aggregations/statistics**
   - Comprehensive pre-defined statistics
   - Perfect for dashboards and overview pages
   - No configuration needed

2. **GET /suppliers/aggregations/custom**
   - Flexible grouping and metrics
   - Perfect for custom reports and charts
   - Highly configurable

Both endpoints support all quick filters from `SupplierFilterDto` for targeted analysis.
