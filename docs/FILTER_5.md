┌────────────────────────────────────────────────────────────┐
│                  Repository Pattern                        │
└────────────────────────────────────────────────────────────┘
                            │
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
    ┌──────────────────┐        ┌──────────────────┐
    │  BaseRepository  │        │ IThemeRepository │
    │   (Abstract)     │        │   (Interface)    │
    │                  │        │                  │
    │ + findAll()      │        │ + findAll()      │
    │ + findPaginated()│        │ + findByFilters()│
    │ + count()        │        │ + search()       │
    └────────┬─────────┘        └────────┬─────────┘
             │                           │
             │ implements                │
             │                           │
             └──────────┬────────────────┘
                        │
                        ▼
            ┌───────────────────────────┐
            │   ThemeRepository         │
            │                           │
            │  Dependencies:            │
            │  ├─ PrismaService         │
            │  └─ ThemeFilterBuilder    │
            │                           │
            │  Methods:                 │
            │  ├─ findAllWithFilters()  │
            │  │   │                    │
            │  │   ├─> 1. Build WHERE   │
            │  │   ├─> 2. Build ORDER   │
            │  │   ├─> 3. Build INCLUDE │
            │  │   ├─> 4. Execute Query │
            │  │   └─> 5. Return Result │
            │  │                        │
            │  ├─ findOne()             │
            │  ├─ create()              │
            │  ├─ update()              │
            │  ├─ delete()              │
            │  └─ count()               │
            └───────────┬───────────────┘
                        │
                        │ executes on
                        │
                        ▼
            ┌───────────────────────────┐
            │      Prisma Client        │
            │                           │
            │  Methods:                 │
            │  ├─ findMany()            │
            │  ├─ findUnique()          │
            │  ├─ findFirst()           │
            │  ├─ count()               │
            │  ├─ create()              │
            │  ├─ update()              │
            │  └─ delete()              │
            └───────────┬───────────────┘
                        │
                        ▼
            ┌───────────────────────────┐
            │       Database            │
            │   (PostgreSQL/MySQL)      │
            └───────────────────────────┘