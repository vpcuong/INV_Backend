REQUEST
   │
   │  Query String: ?categoryId=123&minPrice=100&page=1
   │
   ▼
┌─────────────────────────────────────────────┐
│         Class Validator Pipeline            │
│  ┌───────────────────────────────────────┐  │
│  │ ThemeFilterDto                        │  │
│  │  - categoryId: "123" ✓               │  │
│  │  - minPrice: 100 ✓                   │  │
│  │  - page: 1 ✓                         │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ Class Transformer                     │  │
│  │  - Transform query strings            │  │
│  │  - Convert types                      │  │
│  │  - Apply defaults                     │  │
│  └───────────────────────────────────────┘  │
└──────────────────┬──────────────────────────┘
                   │
                   │  Validated & Transformed DTO
                   │
                   ▼
┌─────────────────────────────────────────────┐
│          Controller Layer                   │
│  ┌───────────────────────────────────────┐  │
│  │ ThemeController.findAll()             │  │
│  │                                       │  │
│  │ Parameters:                           │  │
│  │  - filterDto: ThemeFilterDto          │  │
│  │  - pagination: PaginationParams       │  │
│  └───────────────────────────────────────┘  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           Service Layer                     │
│  ┌───────────────────────────────────────┐  │
│  │ ThemeService.findAll()                │  │
│  │                                       │  │
│  │ 1. Validate business rules            │  │
│  │ 2. Call repository                    │  │
│  │ 3. Transform response                 │  │
│  └───────────────────────────────────────┘  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│        Repository Layer                     │
│  ┌───────────────────────────────────────┐  │
│  │ ThemeRepository                       │  │
│  │                                       │  │
│  │ Step 1: Build WHERE clause            │  │
│  │    ├─> FilterBuilder                  │  │
│  │    │    ├─> categoryId: { eq: 123 }   │  │
│  │    │    └─> price: { gte: 100 }       │  │
│  │    │                                   │  │
│  │ Step 2: Build ORDER BY                │  │
│  │    └─> orderBy: { createdAt: 'desc' } │  │
│  │                                       │  │
│  │ Step 3: Execute Query                 │  │
│  │    ├─> prisma.theme.findMany()        │  │
│  │    └─> prisma.theme.count()           │  │
│  └───────────────────────────────────────┘  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│          Database Query                     │
│  ┌───────────────────────────────────────┐  │
│  │ SELECT * FROM themes                  │  │
│  │ WHERE category_id = '123'             │  │
│  │   AND price >= 100                    │  │
│  │   AND deleted_at IS NULL              │  │
│  │ ORDER BY created_at DESC              │  │
│  │ LIMIT 10 OFFSET 0                     │  │
│  └───────────────────────────────────────┘  │
└──────────────────┬──────────────────────────┘
                   │
                   │  Raw Data
                   │
                   ▼
┌─────────────────────────────────────────────┐
│       Response Transformation               │
│  ┌───────────────────────────────────────┐  │
│  │ PaginatedResponseDto                  │  │
│  │  {                                    │  │
│  │    data: Theme[],                     │  │
│  │    meta: {                            │  │
│  │      page: 1,                         │  │
│  │      limit: 10,                       │  │
│  │      total: 100,                      │  │
│  │      totalPages: 10                   │  │
│  │    }                                  │  │
│  │  }                                    │  │
│  └───────────────────────────────────────┘  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
                RESPONSE