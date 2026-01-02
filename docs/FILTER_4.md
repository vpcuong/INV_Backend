┌────────────────────────────────────────────────────────────────┐
│                    FilterBuilder System                        │
└────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌─────────────────┐ ┌─────────────┐ ┌──────────────┐
    │ FilterBuilder   │ │QueryBuilder │ │UtilityHelper │
    │   (Generic)     │ │  (Generic)  │ │              │
    │                 │ │             │ │              │
    │ - equals()      │ │ - build()   │ │ - normalize()│
    │ - in()          │ │ - reset()   │ │ - validate() │
    │ - like()        │ │ - execute() │ │ - transform()│
    │ - between()     │ │             │ │              │
    │ - greaterThan() │ │             │ │              │
    └────────┬────────┘ └──────┬──────┘ └──────┬───────┘
             │                 │                │
             │ implements      │                │
             │                 │                │
             ▼                 ▼                ▼
    ┌──────────────────────────────────────────────┐
    │       ThemeFilterBuilder                     │
    │    (Domain-specific implementation)          │
    │                                              │
    │  buildWhereClause(filters: ThemeFilterDto)   │
    │    │                                         │
    │    ├─> Basic Filters                         │
    │    │   ├─ categoryId                         │
    │    │   ├─ status                             │
    │    │   └─ isActive                           │
    │    │                                         │
    │    ├─> Search Filters                        │
    │    │   ├─ name (ILIKE)                       │
    │    │   ├─ description (ILIKE)                │
    │    │   └─ tags (array contains)              │
    │    │                                         │
    │    ├─> Range Filters                         │
    │    │   ├─ price (gte/lte)                    │
    │    │   └─ date (gte/lte)                     │
    │    │                                         │
    │    ├─> Relationship Filters                  │
    │    │   ├─ hasReviews (exists)                │
    │    │   └─ minRating (comparison)             │
    │    │                                         │
    │    └─> Soft Delete Filter                    │
    │        └─ deletedAt (IS NULL)                │
    │                                              │
    │  buildOrderBy(sortBy, sortOrder)             │
    │  buildInclude(relations)                     │
    └──────────────────┬───────────────────────────┘
                       │
                       │ used by
                       │
                       ▼
              ┌─────────────────┐
              │ ThemeRepository │
              └─────────────────┘