┌─────────────────────────────────────────────────────────────┐
│                      ThemeService                           │
│                                                             │
│  Constructor Dependencies:                                  │
│  └─ ThemeRepository                                         │
│                                                             │
│  Public Methods:                                            │
│  ├─ findAll(filters, pagination)                            │
│  │   │                                                      │
│  │   ├─> Call: repository.findAllWithFilters()             │
│  │   │          ├─ Input: ThemeFilterDto                   │
│  │   │          ├─ Input: PaginationParams                 │
│  │   │          └─ Output: { data, total }                 │
│  │   │                                                      │
│  │   └─> Transform: new PaginatedResponseDto()             │
│  │                                                          │
│  ├─ findOne(id, filters?)                                   │
│  │   │                                                      │
│  │   ├─> Call: repository.findOne()                        │
│  │   └─> Validate: throw NotFoundException if null         │
│  │                                                          │
│  ├─ create(dto)                                             │
│  ├─ update(id, dto)                                         │
│  ├─ delete(id)                                              │
│  └─ getStatistics(filters)                                  │
│      │                                                      │
│      ├─> Call: repository.count(filters)                   │
│      └─> Call: repository.count(filters + status)          │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ delegates to
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    ThemeRepository                          │
│                                                             │
│  Constructor Dependencies:                                  │
│  ├─ PrismaService                                           │
│  └─ ThemeFilterBuilder                                      │
│                                                             │
│  Methods:                                                   │
│  └─ findAllWithFilters(filters, pagination)                 │
│      │                                                      │
│      ├─> Step 1: Build WHERE                               │
│      │    const where = filterBuilder.buildWhereClause()   │
│      │                                                      │
│      ├─> Step 2: Build ORDER BY                            │
│      │    const orderBy = filterBuilder.buildOrderBy()     │
│      │                                                      │
│      ├─> Step 3: Build INCLUDE                             │
│      │    const include = filterBuilder.buildInclude()     │
│      │                                                      │
│      ├─> Step 4: Calculate SKIP/TAKE                       │
│      │    const skip = (page - 1) * limit                  │
│      │                                                      │
│      └─> Step 5: Execute in Parallel                       │
│           ├─ prisma.theme.findMany({ where, ... })         │
│           └─ prisma.theme.count({ where })                 │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ uses
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 ThemeFilterBuilder                          │
│                                                             │
│  buildWhereClause(filters: ThemeFilterDto)                  │
│  │                                                          │
│  ├─> Process Basic Filters                                 │
│  │    if (filters.categoryId)                              │
│  │      where.categoryId = filters.categoryId              │
│  │                                                          │
│  ├─> Process Search Filters                                │
│  │    if (filters.search)                                  │
│  │      where.OR = [name.contains, desc.contains]          │
│  │                                                          │
│  ├─> Process Range Filters                                 │
│  │    if (filters.minPrice)                                │
│  │      where.price.gte = filters.minPrice                 │
│  │                                                          │
│  └─> Return Prisma.ThemeWhereInput                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘