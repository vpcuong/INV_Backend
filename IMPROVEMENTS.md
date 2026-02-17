# Improvements and Technical Debt Tracker

This document consolidates identified gaps and suggested enhancements for the Inv_Backend project. It aligns with the architectural and coding guidelines defined in AGENTS.md and best_practices.md.

## Summary
- Overall architecture and tooling are solid (NestJS 10, Prisma 7, DDD/Clean Architecture, Filtering, Auth, Jest).
- Main theme: enforce consistency with Clean Architecture/DDD across modules (Repository pattern, CQRS-like split, domain-centric business logic).
- Improve validation, Swagger documentation, tests, and gradually raise type/lint strictness.

---

## High Priority

### 1) Enforce Repository Pattern and Layered Architecture
- Problem: Some services (e.g., `src/colors/colors.service.ts`) call `PrismaService` directly instead of going through repository interfaces and infrastructure implementations.
- Actions:
  - [ ] Create DI token (e.g., `COLOR_REPOSITORY`) under `src/colors/constant/`.
  - [ ] Implement `ColorRepository` in `src/colors/infrastructure/` using Prisma, mapping `Color` entity to persistence via `toPersistence`/`fromPersistence`.
  - [ ] Update `ColorsModule` providers to `{ provide: COLOR_REPOSITORY, useClass: ColorRepository }`.
  - [ ] Refactor `ColorsService` (application layer) to depend on `IColorRepository` (constructor injection), removing `PrismaService` usage.
  - [ ] Repeat this pattern for other modules where services use `prisma.client.*` directly.
- Notes: This improves testability and respects Clean Architecture boundaries.

### 2) Move Business Rules into Domain Entities
- Problem: Domain entities exist (e.g., `Color`) but have minimal validation and behavior; application services mutate state or fields directly.
- Actions:
  - [ ] Add constructor validation in domain entities (non-empty codes, allowed status, non-negative sort order, etc.).
  - [ ] Implement domain methods for state changes (e.g., `activate()`, `deactivate()`), avoid direct field updates in services.
  - [ ] Throw domain-specific exceptions for invalid states (handled by `DomainExceptionFilter`).
  - [ ] Ensure all persistence mapping stays in the entity or a mapper (keep entities pure and consistent).

### 3) Introduce Query Services (CQRS-like) for Read/Filtering
- Problem: Read concerns and filtering are often mixed with command logic in services.
- Actions:
  - [ ] Create `{Module}QueryService` in `application/` to encapsulate reads, filtering, sorting, pagination via `QueryBuilderService` from `common/filtering`.
  - [ ] Controllers should delegate queries to `QueryService`, and commands (create/update/delete) to `Service`.
  - [ ] Export both services in each module where applicable.

### 4) Validation and Swagger Documentation Consistency
- Problem: DTOs/Controllers may be missing full validation decorators and Swagger docs.
- Actions:
  - [ ] Ensure all DTOs have `class-validator` + `class-transformer` decorators and `@ApiProperty/@ApiPropertyOptional` with examples.
  - [ ] Ensure every controller handler has `@ApiOperation`, `@ApiResponse` (with examples), and security decorators where needed.
  - [ ] Standardize null vs undefined semantics in DTOs/entities.

---

## Medium Priority

### 5) Strengthen Type Safety and Lint Rules (Gradual Rollout)
- Current: `strict` and most TS rules are disabled for flexibility. AGENTS.md vs best_practices.md mentions different strictness. The repo follows relaxed rules.
- Actions:
  - [ ] Align documentation on strictness policy (pick relaxed or strict-by-default + gradual opt-in).
  - [ ] Raise strictness incrementally per module (e.g., enable `noImplicitAny`, `strictNullChecks` for domain/application).
  - [ ] Re-enable targeted ESLint rules: `@typescript-eslint/no-unused-vars` (warn), `@typescript-eslint/explicit-function-return-type` (on for domain/app), `@typescript-eslint/ban-types` (warn). Consider `eslint-plugin-promise` for `no-floating-promises`.

### 6) Expand Automated Tests
- Actions:
  - [ ] Domain entity unit tests: constructor validation, domain methods.
  - [ ] Application services: mock repositories (not Prisma) and assert behavior.
  - [ ] Repository integration tests with a test database or Prisma in-memory strategy where applicable.
  - [ ] E2E tests for critical endpoints; maintain coverage goal (>= 80% for domain/services).

### 7) Authorization Coverage and Security Checks
- Actions:
  - [ ] Ensure all sensitive endpoints use guards/decorators (`@Roles`, `@UseGuards`, `@CurrentUser`).
  - [ ] Validate file upload/download endpoints: authentication, MIME whitelist, max size, and secure paths.
  - [ ] Review error messages for clarity but avoid leaking internals.

---

## Low Priority

### 8) Observability & Logging
- Actions:
  - [ ] Enable Prisma client query logging in development (timings, slow queries).
  - [ ] Unify error logging format and optionally add correlation IDs.
  - [ ] Consider basic metrics (request counts, latency) if deployment target supports it.

### 9) Dependencies Hygiene
- Actions:
  - [ ] Review `opencode-ai` usage; if not required at runtime, move to `devDependencies` or remove.
  - [ ] Periodically run dependency updates and security audits.

### 10) Prisma & Migrations Governance
- Actions:
  - [ ] Ensure multi-schema configuration is correct in `prisma.config.ts` and run `npx prisma generate` after schema changes.
  - [ ] Keep migrations atomic and reversible; document rollback strategy (see `scripts/`).
  - [ ] Add indexes for frequently filtered/sorted fields (e.g., codes, foreign keys) per performance guidelines.

---

## Module Refactor Playbook (Example: colors)
1. Domain
   - [ ] Add validations to `Color` constructor (non-empty `code`, allowed `status`, `sortOrder >= 0`).
   - [ ] Add getters and domain methods: `activate()`, `deactivate()`; update timestamps when mutating state.
   - [ ] Define/extend domain exceptions as needed.

2. Repository
   - [ ] `IColorRepository` already exists — validate method contracts include domain-specific queries (e.g., `findByCode`).
   - [ ] Implement `ColorRepository` (Prisma). Map `Color <-> Prisma` data models.

3. Application
   - [ ] Refactor `ColorsService` to inject `IColorRepository` via token. No direct `PrismaService` in services.
   - [ ] Implement `ColorsQueryService` for read/filter/list endpoints via `QueryBuilderService`.

4. Module
   - [ ] Provide DI token mapping: `{ provide: COLOR_REPOSITORY, useClass: ColorRepository }`.
   - [ ] Export both `ColorsService` and `ColorsQueryService` as needed.

5. Controller
   - [ ] Use application service for commands and query service for reads.
   - [ ] Add full Swagger annotations; ensure security decorators are in place.

6. Tests
   - [ ] Unit tests for `Color` entity and `ColorsService` (mock repository).
   - [ ] Optional integration tests for `ColorRepository` with Prisma test DB.

---

## Search Patterns for Refactor Candidates
- Find services directly using Prisma (should be via repositories):
  - Windows PowerShell: `Get-ChildItem -Recurse src | Select-String -Pattern "prisma\.client\." -CaseSensitive`
  - VSCode/IDE: search for `prisma.client.` in `src/**/*.service.ts`

---

## Suggested Roadmap
- Phase 1 (Quick Wins)
  - [ ] Refactor `colors` as reference implementation.
  - [ ] Add/normalize DTO validations and Swagger on key controllers.
  - [ ] Introduce `QueryService` for 1–2 read-heavy modules.

- Phase 2 (Propagation)
  - [ ] Apply repository refactor across remaining modules found by search.
  - [ ] Write/expand domain unit tests and service tests with mocked repositories.
  - [ ] Start enabling stricter TS/ESLint rules in domain/application directories.

- Phase 3 (Quality & Performance)
  - [ ] E2E coverage for major flows.
  - [ ] Prisma query logging in dev + add indexes for hot queries.
  - [ ] Security hardening on auth/file endpoints.

---

## Acceptance Criteria Examples
- No application service imports `PrismaService`; only repositories do.
- All domain entities validate invariant(s) in constructors and expose update methods for mutations.
- Controllers are fully documented via Swagger with examples.
- DTOs validate inputs with `class-validator` and `class-transformer`.
- Query services handle filtering/sorting/pagination via `QueryBuilderService`.
- Unit tests cover domain and services; target >= 80% coverage on critical business logic.

---

## Housekeeping
- Commands to run regularly:
  - `npm run lint`
  - `npm run format`
  - `npm run build`
  - `npm run test:cov`
  - `npx prisma generate` (after schema updates)

- Documentation alignment:
  - Ensure AGENTS.md and best_practices.md reflect the same strictness policy and patterns in use.

