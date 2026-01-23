# 📘 Project Best Practices

## 1. Project Purpose

This is a **NestJS backend application** for an **Inventory Management System** (Inv_Backend). It manages items, SKUs, suppliers, customers, sales orders, and purchase orders with a focus on product variants, pricing, and supply chain operations. The system uses Domain-Driven Design (DDD) with Clean Architecture principles to maintain separation of concerns and business logic encapsulation.

## 2. Project Structure

```
src/
├── {domain}/                    # Business modules (item-skus, suppliers, customers, etc.)
│   ├── domain/                 # Domain entities, business logic, exceptions
│   │   ├── {entity}.entity.ts
│   │   ├── {entity}.repository.interface.ts
│   │   ├── exceptions/
│   │   └── {entity}.entity.spec.ts
│   ├── application/            # Application services, use cases, query services
│   │   ├── {entity}.service.ts
│   │   └── {entity}-query.service.ts
│   ├── infrastructure/         # Repository implementations (Prisma)
│   │   └── {entity}.repository.ts
│   ├── dto/                    # Data transfer objects with validation
│   │   ├── create-{entity}.dto.ts
│   │   ├── update-{entity}.dto.ts
│   │   └── {entity}-filter.dto.ts
│   ├── enums/                  # Domain enums (status, types)
│   ├── constant/               # DI tokens and constants
│   ├── {entity}.controller.ts  # API endpoints
│   ├── {entity}.controller.spec.ts
│   └── {entity}.module.ts      # NestJS module definition
├── common/
│   ├── exception-filters/      # Global exception handling
│   ├── filtering/              # Advanced query builder system
│   ├── files/                  # File upload/download utilities
│   ├── middleware/             # Request logging, etc.
│   ├── pipes/                  # Custom validation pipes
│   └── result/                 # Response formatting utilities
├── auth/                       # Authentication & authorization
├── prisma/                     # Database service
├── app.module.ts               # Root module
├── app.controller.ts           # Root controller
├── app.service.ts              # Root service
└── main.ts                     # Application entry point
```

### Key Directory Roles

- **domain/**: Pure business logic, entities, validation rules, domain exceptions
- **application/**: Use case orchestration, service layer, query services
- **infrastructure/**: Data access layer, Prisma repository implementations
- **dto/**: Input validation, API documentation, type safety
- **common/**: Shared utilities, filters, middleware, reusable services
- **auth/**: JWT authentication, role-based access control

## 3. Test Strategy

### Framework & Setup

- **Test Framework**: Jest with ts-jest
- **Test Configuration**: `jest.config.json` in project root
- **Test Files**: `*.spec.ts` pattern
- **Coverage**: Run with `npm run test:cov`

### Test Organization

```
src/
├── {domain}/
│   ├── domain/
│   │   └── {entity}.entity.spec.ts          # Unit tests for domain logic
│   ├── application/
│   │   └── {entity}.service.spec.ts         # Unit tests for services
│   └── {entity}.controller.spec.ts          # Unit tests for controllers
└── common/
    └── filtering/
        └── query-builder.service.spec.ts    # Unit tests for utilities
```

### Testing Philosophy

- **Unit Tests**: Test domain entities, services, and utilities in isolation
- **Integration Tests**: Test repositories with Prisma (when needed)
- **E2E Tests**: Test API endpoints end-to-end (in `test/` directory)
- **Mocking Strategy**: Mock external dependencies (repositories, services)
- **Coverage Expectations**: Aim for >80% coverage on critical business logic

### Test Patterns

```typescript
describe('ItemSku', () => {
  describe('constructor', () => {
    it('should create entity with valid data', () => {
      // Arrange
      const data: ItemSkuConstructorData = { skuCode: 'TEST001', colorId: 1 };

      // Act
      const itemSku = new ItemSku(data);

      // Assert
      expect(itemSku.getSkuCode()).toBe('TEST001');
    });

    it('should throw exception for invalid data', () => {
      // Arrange
      const data: ItemSkuConstructorData = { skuCode: '', colorId: 1 };

      // Act & Assert
      expect(() => new ItemSku(data)).toThrow(InvalidItemSkuException);
    });
  });

  describe('updatePrices', () => {
    it('should update prices with valid data', () => {
      // Arrange
      const itemSku = new ItemSku({ skuCode: 'TEST001', colorId: 1 });

      // Act
      itemSku.updatePrices(10, 20);

      // Assert
      expect(itemSku.getCostPrice()).toBe(10);
      expect(itemSku.getSellingPrice()).toBe(20);
    });
  });
});
```

### Running Tests

```bash
npm test                                    # Run all tests
npm run test:watch                          # Watch mode
npm run test:cov                            # With coverage
npm test -- path/to/file.spec.ts           # Specific file
npm test -- --testNamePattern="pattern"    # Pattern matching
npm run test:debug                          # Debug mode
```

## 4. Code Style

### TypeScript Configuration

- **Target**: ES2021
- **Module**: CommonJS
- **Strict Mode**: Disabled (relaxed for flexibility)
- **Decorators**: Experimental decorators enabled
- **Path Aliases**: `@/*` mapped to `src/*`

### Naming Conventions

#### Files and Directories

- **Modules**: kebab-case (`item-skus`, `customer-addresses`, `uom-conversions`)
- **Classes**: PascalCase (`ItemSkuService`, `ItemSkuRepository`, `CreateItemSkuDto`)
- **Interfaces**: Prefix with 'I' (`IItemSkuRepository`, `IFilterConfig`)
- **DTOs**: PascalCase with 'Dto' suffix (`CreateItemSkuDto`, `UpdateItemSkuDto`, `ItemSkuFilterDto`)
- **Enums**: PascalCase (`ItemSkuStatus`, `UserRole`)
- **Constants**: UPPER_SNAKE_CASE (`ITEM_SKU_REPOSITORY`, `MAX_FILE_SIZE`)
- **Test Files**: `{name}.spec.ts` (e.g., `item-sku.entity.spec.ts`)

#### Methods and Properties

- **Methods**: camelCase with descriptive verbs (`updatePrices`, `validateDimensions`, `findBySkuCode`)
- **Private Methods**: camelCase, often prefixed with verbs (`validateRequiredFields`, `buildFilterConditions`)
- **Properties**: camelCase (`skuCode`, `costPrice`, `createdAt`)
- **Getters**: camelCase with 'get' prefix (`getSkuCode`, `getStatus`, `getCostPrice`)
- **Setters**: Avoid setters; use update methods instead (`updatePrices`, `updateDimensions`)
- **Boolean Properties**: Prefix with 'is' or 'has' (`isActive`, `hasRelations`)

### Code Formatting

- **Prettier Configuration**:
  - Print Width: 80
  - Tab Width: 2
  - Use Spaces: true
  - Semicolons: true
  - Single Quotes: true
  - Trailing Comma: es5
  - Line Ending: lf

- **ESLint**: Relaxed rules for flexibility; auto-fix enabled
- **Format Command**: `npm run format`
- **Lint Command**: `npm run lint`

### Commenting and Documentation

- **JSDoc Comments**: Use for public methods and complex logic
- **Inline Comments**: Explain "why", not "what" (code should be self-documenting)
- **Business Rule Comments**: Mark with `// Business rule:` prefix
- **TODO Comments**: Use sparingly; prefer issues/tickets
- **Swagger Decorators**: Document all API endpoints with `@ApiOperation`, `@ApiResponse`, `@ApiProperty`

```typescript
/**
 * Business rule: Validate prices cannot be negative
 */
private validatePrices(costPrice?: number, sellingPrice?: number): void {
  if (costPrice !== undefined && costPrice !== null && costPrice < 0) {
    throw new InvalidPriceException('Cost price', costPrice);
  }
}

/**
 * Update prices with validation
 * @param costPrice - Purchase price (optional)
 * @param sellingPrice - Retail price (optional)
 * @throws InvalidPriceException if prices are negative
 */
public updatePrices(costPrice?: number, sellingPrice?: number): void {
  // Implementation
}
```

### Error Handling

- **Domain Exceptions**: Extend `DomainException` for business logic errors
- **HTTP Exceptions**: Use NestJS exceptions (`BadRequestException`, `NotFoundException`, `ConflictException`)
- **Exception Filter**: `DomainExceptionFilter` automatically converts domain exceptions to HTTP 400
- **Validation**: Use class-validator decorators in DTOs
- **Error Messages**: Clear, actionable messages for API consumers

```typescript
// Domain exception
export class InvalidItemSkuException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidItemSkuException';
  }
}

// Usage in entity
if (!data.skuCode || data.skuCode.trim() === '') {
  throw new InvalidItemSkuException('SKU code is required');
}

// HTTP exception in service
if (!sku) {
  throw new NotFoundException(`Item SKU with ID ${id} not found`);
}
```

## 5. Common Patterns

### Domain Entity Pattern

Domain entities encapsulate business logic and validation:

```typescript
export interface ItemSkuConstructorData {
  id?: number;
  skuCode: string;
  colorId: number;
  costPrice?: number | null;
  sellingPrice?: number | null;
  // ... other fields
}

export class ItemSku {
  private id?: number;
  private skuCode: string;
  private costPrice?: number | null;
  private sellingPrice?: number | null;
  // ... private fields

  constructor(data: ItemSkuConstructorData) {
    this.validateRequiredFields(data);
    this.validatePrices(data.costPrice, data.sellingPrice);
    // ... initialization
  }

  // Business logic methods
  public updatePrices(costPrice?: number, sellingPrice?: number): void {
    this.validatePrices(costPrice, sellingPrice);
    if (costPrice !== undefined) this.costPrice = costPrice;
    if (sellingPrice !== undefined) this.sellingPrice = sellingPrice;
    this.updatedAt = new Date();
  }

  // Getters only (no setters)
  public getSkuCode(): string { return this.skuCode; }
  public getCostPrice(): number | null | undefined { return this.costPrice; }

  // Persistence methods
  public toPersistence(): any { /* Convert to Prisma model */ }
  public static fromPersistence(data: any): ItemSku { /* Create from Prisma */ }
}
```

### Repository Pattern

Repositories abstract data access behind interfaces:

```typescript
// Interface (domain layer)
export interface IItemSkuRepository {
  create(entity: ItemSku): Promise<ItemSku>;
  findOne(id: number): Promise<ItemSku | null>;
  findAll(): Promise<ItemSku[]>;
  update(id: number, entity: ItemSku): Promise<ItemSku>;
  remove(id: number): Promise<ItemSku>;
  findBySkuCode(skuCode: string): Promise<ItemSku | null>;
}

// Implementation (infrastructure layer)
@Injectable()
export class ItemSkuRepository implements IItemSkuRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(itemSku: ItemSku): Promise<ItemSku> {
    const data = itemSku.toPersistence();
    const created = await this.prisma.client.itemSKU.create({ data });
    return ItemSku.fromPersistence(created);
  }

  async findOne(id: number): Promise<ItemSku | null> {
    const sku = await this.prisma.client.itemSKU.findUnique({ where: { id } });
    return sku ? ItemSku.fromPersistence(sku) : null;
  }
}
```

### Application Service Pattern

Services orchestrate use cases and coordinate between layers:

```typescript
@Injectable()
export class ItemSkuService {
  constructor(
    @Inject(ITEM_SKU_REPOSITORY)
    private readonly skuRepository: IItemSkuRepository,
    private readonly prisma: PrismaService
  ) {}

  async create(createDto: CreateItemSkuDto): Promise<any> {
    // Validate input
    const existing = await this.skuRepository.findBySkuCode(createDto.skuCode);
    if (existing) {
      throw new ConflictException(`SKU code already exists`);
    }

    // Create domain entity
    const itemSku = new ItemSku({
      skuCode: createDto.skuCode,
      colorId: createDto.colorId,
      costPrice: createDto.costPrice,
      // ... other fields
    });

    // Persist
    const saved = await this.skuRepository.create(itemSku);

    // Return with relations
    return this.findOneWithRelations(saved.getId()!);
  }

  async update(id: number, updateDto: UpdateItemSkuDto): Promise<any> {
    const sku = await this.skuRepository.findOne(id);
    if (!sku) throw new NotFoundException(`SKU with ID ${id} not found`);

    // Update via domain methods
    if (updateDto.costPrice !== undefined || updateDto.sellingPrice !== undefined) {
      sku.updatePrices(updateDto.costPrice, updateDto.sellingPrice);
    }

    // Persist changes
    const updated = await this.skuRepository.update(id, sku);
    return this.findOneWithRelations(updated.getId()!);
  }
}
```

### Query Service Pattern

Separate query logic from command logic (CQRS-like):

```typescript
@Injectable()
export class ItemSkuQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService
  ) {}

  async findAllWithFilters(filterDto: ItemSkuFilterDto): Promise<any> {
    const query = this.queryBuilder.buildQuery(filterDto, {
      searchableFields: ['skuCode', 'desc'],
      filterableFields: ['status', 'colorId', 'genderId'],
      sortableFields: ['skuCode', 'costPrice', 'createdAt'],
      relations: ['color', 'gender', 'size'],
    });

    const [data, total] = await Promise.all([
      this.prisma.client.itemSKU.findMany(query),
      this.prisma.client.itemSKU.count({ where: query.where }),
    ]);

    return this.queryBuilder.buildPaginatedResponse(
      data,
      total,
      filterDto.page || 1,
      filterDto.limit
    );
  }
}
```

### Dependency Injection Pattern

Use tokens for dependency injection:

```typescript
// Constant (constant/item-sku.token.ts)
export const ITEM_SKU_REPOSITORY = 'ITEM_SKU_REPOSITORY';

// Module
@Module({
  providers: [
    ItemSkuService,
    ItemSkuQueryService,
    {
      provide: ITEM_SKU_REPOSITORY,
      useClass: ItemSkuRepository,
    },
  ],
  exports: [ItemSkuService, ItemSkuQueryService],
})
export class ItemSkusModule {}

// Service
@Injectable()
export class ItemSkuService {
  constructor(
    @Inject(ITEM_SKU_REPOSITORY)
    private readonly skuRepository: IItemSkuRepository
  ) {}
}
```

### DTO with Validation Pattern

DTOs provide input validation and API documentation:

```typescript
export class CreateItemSkuDto {
  @ApiPropertyOptional({
    description: 'SKU code (auto-generated if not provided)',
    example: 'GRE-UNI-M',
  })
  @IsOptional()
  @IsString()
  skuCode?: string;

  @ApiProperty({
    description: 'Color ID',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  colorId: number;

  @ApiPropertyOptional({
    description: 'Cost price (purchase price)',
    example: 12.5,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({
    description: 'Status',
    example: 'active',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;
}
```

### Advanced Filtering Pattern

Use QueryBuilderService for complex queries:

```typescript
// In query service
const query = this.queryBuilder.buildQuery(filterDto, {
  searchableFields: ['skuCode', 'desc'],
  filterableFields: ['status', 'colorId', 'genderId', 'costPrice'],
  sortableFields: ['skuCode', 'costPrice', 'createdAt'],
  defaultSort: [{ field: 'createdAt', order: 'desc' }],
  relations: ['color', 'gender', 'size', 'uom'],
  maxLimit: 100,
});

// Supports 13 filter operators:
// EQUALS, NOT_EQUALS, GREATER_THAN, GREATER_THAN_OR_EQUALS,
// LESS_THAN, LESS_THAN_OR_EQUALS, CONTAINS, STARTS_WITH,
// ENDS_WITH, IN, NOT_IN, IS_NULL, IS_NOT_NULL
```

## 6. Do's and Don'ts

### ✅ Do's

- **Encapsulate business logic in domain entities** - Keep entities pure with no external dependencies
- **Use repository pattern** - Abstract data access behind interfaces for testability
- **Validate in constructors and methods** - Fail fast with clear error messages
- **Use dependency injection** - Inject dependencies via constructor with tokens
- **Separate concerns** - Keep domain, application, and infrastructure layers distinct
- **Document APIs with Swagger** - Use `@ApiProperty`, `@ApiOperation`, `@ApiResponse` decorators
- **Use class-validator for DTOs** - Validate input at the boundary
- **Write tests for domain logic** - Unit test entities and services thoroughly
- **Use meaningful names** - Self-documenting code reduces need for comments
- **Handle errors explicitly** - Throw domain exceptions for business logic errors
- **Use transactions for complex operations** - Ensure data consistency
- **Implement pagination for large datasets** - Use QueryBuilderService for filtering
- **Keep entities immutable** - Use update methods instead of setters
- **Document business rules** - Mark with `// Business rule:` comments

### ❌ Don'ts

- **Don't put business logic in controllers** - Controllers should only handle HTTP concerns
- **Don't access database directly in services** - Use repositories
- **Don't use setters in entities** - Use update methods that validate
- **Don't throw generic exceptions** - Use domain-specific exceptions
- **Don't skip validation** - Validate at DTOs and in domain entities
- **Don't mix concerns** - Keep domain, application, and infrastructure separate
- **Don't hardcode values** - Use constants or configuration
- **Don't ignore error handling** - Always handle and log errors appropriately
- **Don't create circular dependencies** - Use dependency injection tokens
- **Don't skip tests for domain logic** - Test entities and services thoroughly
- **Don't use `any` type excessively** - Use proper TypeScript types
- **Don't mutate input parameters** - Create new objects instead
- **Don't forget to update timestamps** - Set `updatedAt` when modifying entities
- **Don't expose internal entity structure** - Use DTOs for API responses
- **Don't skip Swagger documentation** - Document all endpoints and DTOs

## 7. Tools & Dependencies

### Core Framework

- **NestJS** (^10.3.0): Backend framework with dependency injection
- **TypeScript** (^5.3.3): Type-safe JavaScript
- **Express** (via @nestjs/platform-express): HTTP server

### Database & ORM

- **Prisma** (^7.0.1): Type-safe ORM with migrations
- **PostgreSQL** (pg ^8.16.3): Primary database
- **@prisma/adapter-pg**: PostgreSQL adapter for Prisma

### Authentication & Security

- **@nestjs/jwt** (^11.0.1): JWT token generation and verification
- **@nestjs/passport** (^11.0.5): Passport integration
- **passport-jwt** (^4.0.1): JWT strategy
- **bcrypt** (^6.0.0): Password hashing

### Validation & Transformation

- **class-validator** (^0.14.3): DTO validation decorators
- **class-transformer** (^0.5.1): DTO transformation and type conversion

### API Documentation

- **@nestjs/swagger** (^11.2.3): Swagger/OpenAPI documentation
- **Swagger UI**: Auto-generated at `/api`

### Development Tools

- **Jest** (^29.7.0): Testing framework
- **ts-jest** (^29.1.1): TypeScript support for Jest
- **ESLint** (^8.56.0): Code linting
- **Prettier** (^3.1.1): Code formatting
- **@nestjs/cli** (^10.3.0): NestJS CLI for scaffolding

### Configuration

- **@nestjs/config** (^4.0.2): Environment configuration management
- **morgan** (^1.10.1): HTTP request logging

### Project Setup

```bash
# Install dependencies
npm install

# Development
npm run start:dev          # Watch mode
npm run start:debug        # Debug mode

# Production
npm run build              # Build
npm run start:prod         # Run production build

# Code Quality
npm run lint               # Lint with auto-fix
npm run format             # Format with Prettier

# Testing
npm test                   # Run tests
npm run test:watch        # Watch mode
npm run test:cov          # Coverage report

# Database
npx prisma migrate dev    # Create migration
npx prisma db push        # Push schema to database
npx prisma studio        # Open Prisma Studio
```

## 8. Other Notes

### Important Considerations for LLM Code Generation

1. **Always use the 4-layer architecture** - Domain → Application → Infrastructure → Controller
2. **Validate in domain entities** - Business rules belong in entities, not services
3. **Use repository pattern** - Never access Prisma directly in services
4. **Implement both service and query service** - Separate commands from queries
5. **Create comprehensive DTOs** - Include validation and Swagger documentation
6. **Write tests for domain logic** - At least 80% coverage for entities
7. **Use dependency injection tokens** - Avoid hardcoding class references
8. **Document with Swagger** - All endpoints must have `@ApiOperation` and `@ApiResponse`
9. **Handle errors explicitly** - Create domain exceptions for business logic errors
10. **Use QueryBuilderService** - For any filtering, sorting, or pagination needs

### Special Edge Cases

- **SKU Code Generation**: Currently returns empty string; implement based on item attributes
- **Selling Price < Cost Price**: Logged as warning but allowed (business decision)
- **Null vs Undefined**: Carefully distinguish in DTOs and entities
- **Pagination**: If `limit` is not provided, fetches all results (no pagination)
- **Relations**: Use `include` in Prisma queries to fetch related data
- **Transactions**: Use `prisma.$transaction()` for multi-step operations
- **Soft Deletes**: Not currently implemented; consider for audit trails
- **Timestamps**: Always update `updatedAt` when modifying entities

### Database Considerations

- **Prisma Multi-Schema**: Project uses multiple schema files in `prisma/schema/`
- **Migrations**: Version-controlled in `prisma/migrations/`
- **UOM System**: Complex unit of measure conversions with base factors
- **SKU-UOM Mapping**: Many-to-many relationship for SKU variants
- **Indexes**: Ensure indexes on frequently queried fields (skuCode, colorId, etc.)

### Performance Guidelines

- **Query Optimization**: Use `include` for relations, avoid N+1 queries
- **Pagination**: Always paginate large result sets
- **Caching**: Consider caching for read-heavy operations
- **Batch Operations**: Use transactions for bulk updates
- **Database Indexes**: Add indexes on filter and sort fields
- **Query Monitoring**: Use Prisma logging in development

### Authentication & Authorization

- **JWT Strategy**: Implemented in `auth/strategies/jwt.strategy.ts`
- **Role-Based Access**: Use `@Roles()` decorator on endpoints
- **Current User**: Use `@CurrentUser()` decorator to get authenticated user
- **Token Refresh**: Implement refresh token rotation for security

### File Management

- **Upload Directory**: `uploads/` folder for file storage
- **File Service**: Use `FilesService` for upload/download operations
- **Authentication**: File access requires authentication
- **Supported Types**: Configure in file service

### Monitoring & Logging

- **Request Logging**: `RequestLoggerMiddleware` logs all HTTP requests
- **Debug Logging**: Console logs in QueryBuilderService and exception filter
- **Error Logging**: All exceptions logged before response
- **Performance**: Monitor query execution times in development

### Common Patterns to Follow

1. **Create → Read → Update → Delete (CRUD)** - Standard pattern for all entities
2. **Filtering + Sorting + Pagination** - Use QueryBuilderService for all list endpoints
3. **Validation at Boundary** - DTOs validate input before reaching domain
4. **Domain Exceptions** - Business logic errors throw domain exceptions
5. **HTTP Exceptions** - Service layer throws HTTP exceptions for API responses
6. **Swagger Documentation** - All endpoints documented with examples
7. **Test Coverage** - Domain entities and services have comprehensive tests
8. **Dependency Injection** - All dependencies injected via constructor

### Useful Commands

```bash
# Development
npm run start:dev                    # Start with watch
npm run start:debug                  # Start with debugger

# Code Quality
npm run lint                         # Lint and auto-fix
npm run format                       # Format code

# Testing
npm test                             # Run all tests
npm run test:watch                   # Watch mode
npm run test:cov                     # Coverage report
npm test -- path/to/file.spec.ts    # Specific file

# Database
npx prisma migrate dev               # Create and apply migration
npx prisma db push                   # Push schema changes
npx prisma studio                    # Open Prisma Studio UI
npx prisma generate                  # Generate Prisma client

# Build & Deploy
npm run build                        # Build for production
npm run start:prod                   # Run production build
```

### Troubleshooting

- **Circular Dependencies**: Use dependency injection tokens instead of direct imports
- **Type Errors**: Ensure DTOs match entity interfaces
- **Validation Failures**: Check DTO decorators and class-validator rules
- **Database Errors**: Check Prisma schema and migrations
- **Test Failures**: Mock external dependencies properly
- **Performance Issues**: Check query optimization and pagination
