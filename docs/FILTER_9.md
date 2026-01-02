Filter DTO
   │
   │  { categoryId: "123", minPrice: 100, search: "modern" }
   │
   ▼
┌─────────────────────────────────────────────────────────┐
│              FilterBuilder                              │
│                                                         │
│  Processing Steps:                                      │
│                                                         │
│  1. Initialize WHERE object                             │
│     where = {}                                          │
│                                                         │
│  2. Apply categoryId filter                             │
│     where.categoryId = "123"                            │
│                                                         │
│  3. Apply price range filter                            │
│     where.price = { gte: 100 }                          │
│                                                         │
│  4. Apply search filter                                 │
│     where.OR = [                                        │
│       { name: { contains: "modern" } },                 │
│       { description: { contains: "modern" } }           │
│     ]                                                   │
│                                                         │
│  5. Apply soft delete filter (default)                  │
│     where.deletedAt = null                              │
│                                                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ WHERE Clause Object
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Prisma Query Builder                       │
│                                                         │
│  Build Final Query:                                     │
│                                                         │
│  prisma.theme.findMany({                                │
│    where: {                                             │
│      categoryId: "123",                                 │
│      price: { gte: 100 },                               │
│      OR: [                                              │
│        { name: { contains: "modern" } },                │
│        { description: { contains: "modern" } }          │
│      ],                                                 │
│      deletedAt: null                                    │
│    },                                                   │
│    skip: 0,                                             │
│    take: 10,                                            │
│    orderBy: { createdAt: 'desc' },                      │
│    include: { category: true, author: true }            │
│  })                                                     │
│                                                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ SQL Query
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Database Engine                        │
│                                                         │
│  Generated SQL:                                         │
│                                                         │
│  SELECT t.*, c.*, a.*                                   │
│  FROM themes t                                          │
│  LEFT JOIN categories c ON t.category_id = c.id        │
│  LEFT JOIN users a ON t.author_id = a.id               │
│  WHERE t.category_id = '123'                            │
│    AND t.price >= 100                                   │
│    AND (                                                │
│      t.name ILIKE '%modern%'                            │
│      OR t.description ILIKE '%modern%'                  │
│    )                                                    │
│    AND t.deleted_at IS NULL                             │
│  ORDER BY t.created_at DESC                             │
│  LIMIT 10 OFFSET 0;                                     │
│                                                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Result Set
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Response Transformation                    │
│                                                         │
│  {                                                      │
│    data: [                                              │
│      {                                                  │
│        id: "1",                                         │
│        name: "Modern Business Theme",                   │
│        price: 299,                                      │
│        category: { id: "123", name: "Business" },       │
│        author: { id: "456", name: "John" }              │
│      }                                                  │
│    ],                                                   │
│    meta: {                                              │
│      page: 1,                                           │
│      limit: 10,                                         │
│      total: 45,                                         │
│      totalPages: 5                                      │
│    }                                                    │
│  }                                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘