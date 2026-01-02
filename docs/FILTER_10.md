Request
   │
   ▼
┌──────────────────────────────────────┐
│    Validation Layer                  │
│                                      │
│  Class-Validator checks:             │
│  ├─ Type validation                  │
│  ├─ Format validation                │
│  ├─ Range validation                 │
│  └─ Custom validation                │
│                                      │
└────────┬─────────────────────────────┘
         │
         │ ✓ Valid
         │
         ▼
┌──────────────────────────────────────┐
│    Business Logic Layer              │
│                                      │
│  Service checks:                     │
│  ├─ Resource exists                  │
│  ├─ Permission check                 │
│  ├─ Business rules                   │
│  └─ Data integrity                   │
│                                      │
└────────┬─────────────────────────────┘
         │
         │ ✓ Valid
         │
         ▼
┌──────────────────────────────────────┐
│    Database Layer                    │
│                                      │
│  Database checks:                    │
│  ├─ Connection                       │
│  ├─ Query execution                  │
│  ├─ Constraint validation            │
│  └─ Transaction                      │
│                                      │
└────────┬─────────────────────────────┘
         │
         │ ✓ Success
         │
         ▼
      Response


ERROR FLOW:
═══════════

┌──────────────┐
│ Validation   │──> ValidationException
│    Error     │    (400 Bad Request)
└──────────────┘
       │
       ▼
┌──────────────────────────────┐
│ HttpExceptionFilter          │
│                              │
│ Response:                    │
│ {                            │
│   statusCode: 400,           │
│   message: "Validation...",  │
│   errors: [{...}]            │
│ }                            │
└──────────────────────────────┘

┌──────────────┐
│  Business    │──> NotFoundException
│    Error     │    ResourceNotFound
└──────────────┘    (404 Not Found)
       │
       ▼
┌──────────────────────────────┐
│ HttpExceptionFilter          │
│                              │
│ Response:                    │
│ {                            │
│   statusCode: 404,           │
│   message: "Theme not...",   │
│ }                            │
└──────────────────────────────┘

┌──────────────┐
│  Database    │──> DatabaseException
│    Error     │    (500 Internal Error)
└──────────────┘
       │
       ▼
┌──────────────────────────────┐
│ AllExceptionsFilter          │
│                              │
│ 1. Log error                 │
│ 2. Mask sensitive data       │
│ 3. Return generic message    │
│                              │
│ Response:                    │
│ {                            │
│   statusCode: 500,           │
│   message: "Internal..."     │
│ }                            │
└──────────────────────────────┘