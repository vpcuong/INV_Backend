┌─────────────────────────────────────────────────────────────┐
│                     Common DTOs                             │
└─────────────────────────────────────────────────────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │ Pagination  │   │ BaseFilter  │   │ DateRange   │
    │    DTO      │   │    DTO      │   │ FilterDTO   │
    │             │   │             │   │             │
    │ - page      │   │ - search    │   │ - fromDate  │
    │ - limit     │   │ - ids       │   │ - toDate    │
    │ - sortBy    │   │             │   │             │
    │ - sortOrder │   │             │   │             │
    └─────────────┘   └──────┬──────┘   └─────────────┘
                             │
                             │ extends
                             │
                             ▼
                    ┌─────────────────┐
                    │  ThemeFilter    │
                    │     DTO         │
                    │                 │
                    │ - categoryId    │
                    │ - status        │
                    │ - isActive      │
                    │ - minPrice      │
                    │ - maxPrice      │
                    │ - tags          │
                    │ - hasReviews    │
                    └────────┬────────┘
                             │
                             │ used in
                             │
                             ▼
                    ┌─────────────────┐
                    │  ThemeQuery     │
                    │     DTO         │
                    │                 │
                    │ + Pagination    │
                    │ + ThemeFilter   │
                    └─────────────────┘