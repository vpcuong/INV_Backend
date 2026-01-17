# AGENTS.md - Development Guidelines for Agentic Coding

This file contains essential information for agentic coding agents working in this NestJS backend repository.

## 🚀 Build, Lint, and Test Commands

### Development Commands

```bash
npm run start:dev          # Start development server with watch mode
npm run start:debug        # Start with debug mode and watch
npm run start              # Regular start (production build)
npm run start:prod         # Start production build
```

### Build Commands

```bash
npm run build              # Build for production (cleans dist first)
```

### Code Quality Commands

```bash
npm run lint               # Run ESLint with auto-fix
npm run format             # Format code with Prettier
```

### Testing Commands

```bash
npm test                   # Run all unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage report
npm run test:e2e           # Run end-to-end tests
npm run test:debug         # Run tests in debug mode
```

### Running Single Tests

```bash
# Run a specific test file
npm test -- path/to/file.spec.ts

# Run tests matching a pattern
npm test -- --testNamePattern="specific test name"

# Run tests in watch mode for specific file
npm run test:watch -- path/to/file.spec.ts
```

## 🏗️ Architecture Overview

This is a **NestJS backend** following **Domain-Driven Design (DDD)** with **4-layer Clean Architecture**:

```
src/
├── {domain}/              # Business modules (item-skus, themes, colors, etc.)
│   ├── domain/           # Domain entities, business logic
│   ├── application/      # Application services, use cases
│   ├── infrastructure/   # Repository implementations
│   ├── dto/             # Data transfer objects, validation
│   ├── controllers/     # API endpoints
│   └── {module}.module.ts
├── common/              # Shared utilities, filtering, files
├── auth/               # Authentication & authorization
└── prisma/             # Database configuration
```

### Key Architectural Patterns

- **Repository Pattern**: Abstract data access behind interfaces
- **Dependency Injection**: Constructor-based DI throughout
- **Rich Domain Models**: Business logic encapsulated in entities
- **Clean Architecture**: Clear separation of concerns
- **CQRS-like Pattern**: Separate query and command services

## 📝 Code Style Guidelines

### TypeScript Configuration

- **Target**: ES2021
- **Module**: CommonJS
- **Strict Mode**: Enabled
- **Decorators**: Experimental decorators enabled
- **Path Aliases**: `@/*` mapped to `src/*`

### ESLint Rules (Relaxed)

- Most TypeScript ESLint rules disabled for flexibility
- Prettier integration enabled
- Auto-fix on lint command

### Prettier Configuration

```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "endOfLine": "lf"
}
```

## 🎯 Naming Conventions

### Files and Directories

- **Modules**: kebab-case (item-skus, customer-addresses)
- **Classes**: PascalCase (ItemSkuService, ItemSkuRepository)
- **Interfaces**: Prefix with 'I' (IItemSkuRepository)
- **DTOs**: PascalCase with 'Dto' suffix (CreateItemSkuDto)
- **Enums**: PascalCase (ItemSkuStatus)
- **Constants**: UPPER_SNAKE_CASE (ITEM_SKU_REPOSITORY)

### Methods and Properties

- **Methods**: camelCase with descriptive names (updatePrices, validateDimensions)
- **Private methods**: camelCase, often prefixed with verbs (validateRequiredFields)
- **Properties**: camelCode (skuCode, costPrice)
- **Getters**: camelCase with 'get' prefix (getSkuCode, getStatus)

## 🏛️ Domain Entity Guidelines

### Entity Structure

```typescript
export class ItemSku {
  private id?: number;
  private skuCode: string;
  // ... private fields

  constructor(data: ItemSkuConstructorData) {
    // Validation and initialization
  }

  // Business logic methods
  public updatePrices(costPrice?: number, sellingPrice?: number): void {
    // Validation and business rules
  }

  // Getters (no setters)
  public getSkuCode(): string {
    return this.skuCode;
  }

  // Persistence methods
  public toPersistence(): any {
    // Convert to Prisma model
  }

  public static fromPersistence(data: any): ItemSku {
    // Create from Prisma model
  }
}
```

### Business Rules

- Encapsulate business logic in domain entities
- Validate data in constructors and methods
- Use domain-specific exceptions
- Keep entities pure (no external dependencies)

## 🔧 Repository Pattern

### Interface Definition

```typescript
export interface IItemSkuRepository {
  create(entity: ItemSku): Promise<ItemSku>;
  findOne(id: number): Promise<ItemSku | null>;
  findAll(): Promise<ItemSku[]>;
  update(id: number, entity: ItemSku): Promise<ItemSku>;
  remove(id: number): Promise<ItemSku>;
  // Domain-specific methods
  findBySkuCode(skuCode: string): Promise<ItemSku | null>;
}
```

### Implementation

- Use Prisma for data access
- Convert between domain entities and persistence models
- Handle database-specific concerns
- Use dependency injection with tokens

## 📋 DTO Guidelines

### Validation and Documentation

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
}
```

### DTO Rules

- Use class-validator for validation
- Use class-transformer for type conversion
- Use @ApiProperty for Swagger documentation
- Make optional fields explicit with @IsOptional()
- Provide meaningful examples and descriptions

## 🛡️ Error Handling

### Domain Exceptions

```typescript
export class InvalidItemSkuException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidItemSkuException';
  }
}
```

### HTTP Exceptions

- Use NestJS HTTP exceptions (BadRequestException, NotFoundException, etc.)
- DomainExceptionFilter automatically converts domain exceptions
- Validate input and throw appropriate exceptions

## 🧪 Testing Guidelines

### Test Structure

- Test files: `*.spec.ts`
- Unit tests for domain entities, services, DTOs
- Integration tests for repositories
- E2E tests for API endpoints
- Use Jest with ts-jest

### Test Patterns

```typescript
describe('ItemSku', () => {
  describe('constructor', () => {
    it('should create entity with valid data', () => {
      // Test
    });

    it('should throw exception for invalid data', () => {
      // Test
    });
  });

  describe('updatePrices', () => {
    it('should update prices with valid data', () => {
      // Test
    });
  });
});
```

## 🔍 Dependency Injection

### Tokens

```typescript
export const ITEM_SKU_REPOSITORY = 'ITEM_SKU_REPOSITORY';
```

### Usage

```typescript
@Injectable()
export class ItemSkuService {
  constructor(
    @Inject(ITEM_SKU_REPOSITORY)
    private readonly skuRepository: IItemSkuRepository,
    private readonly prisma: PrismaService
  ) {}
}
```

## 📦 Module Structure

### Standard Module

```typescript
@Module({
  controllers: [ItemSkusController],
  providers: [
    ItemSkuService,
    ItemSkuQueryService,
    { provide: ITEM_SKU_REPOSITORY, useClass: ItemSkuRepository },
  ],
  exports: [ItemSkuService, ItemSkuQueryService],
})
export class ItemSkusModule {}
```

## 🎨 Swagger Documentation

- Use @ApiProperty decorators in DTOs
- Use @ApiOperation, @ApiResponse in controllers
- Auto-generated documentation at `/api`
- Include examples and descriptions

## 🗄️ Database Guidelines

### Prisma Usage

- Use PrismaService for database access
- Transactions for complex operations
- Include relations where needed
- Use proper types for database fields

### Migration

- Version-controlled schema changes
- Use Prisma migrations
- Test migrations before applying

## 🚀 Development Workflow

1. **Create Domain Entity**: Define business logic and validation
2. **Create Repository Interface**: Define data access contract
3. **Implement Repository**: Use Prisma for data access
4. **Create Application Service**: Orchestrate use cases
5. **Create DTOs**: Define input/output validation
6. **Create Controller**: Define API endpoints
7. **Write Tests**: Unit, integration, and E2E tests
8. **Run Quality Checks**: Lint, format, test

## 📊 Filtering System

This project includes an advanced filtering system:

- Dynamic query builder
- 13 filter operators (eq, contains, in, etc.)
- Pagination support
- Multi-field sorting
- Field selection

Use the QueryBuilderService for complex queries.

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control
- Use @Roles decorator for endpoints
- Use @CurrentUser decorator for user context

## 📁 File Management

- Secure file upload/download
- Authentication required for file access
- Use FilesService for file operations
- Support for various file types

## ⚡ Performance Guidelines

- Use database indexes
- Optimize queries with includes
- Implement pagination for large datasets
- Use caching where appropriate
- Monitor query performance

## 🔄 Environment Configuration

- Use .env files for configuration
- Use ConfigModule for global configuration
- Database URL from environment
- Different configs for development/production

## 📝 Important Notes

- Always run `npm run lint` and `npm test` before committing
- Follow the established patterns for consistency
- Use dependency injection with proper tokens
- Keep domain entities pure and business-focused
- Write comprehensive tests for new features
- Use proper error handling and validation
- Document APIs with Swagger decorators
