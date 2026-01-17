# Soft Delete Implementation Guide for SO Module

## Overview
Soft delete has been prepared in the Prisma schema but requires database migration to activate.

## Changes Made

### 1. Prisma Schema Updates (✅ Done)
File: `prisma/schema/sales-orders.prisma`

Added to SOHeader model:
```prisma
deletedAt    DateTime?
deletedBy    String?   @db.VarChar(100)
@@index([deletedAt])
```

### 2. Implementation Steps (TODO)

#### Step 1: Generate and Run Migration
```bash
npx prisma migrate dev --name add_soft_delete_to_so
npx prisma generate
```

#### Step 2: Update Repository Methods

**File**: `src/so/infrastructure/so-header.repository.ts`

##### findAll() - Exclude soft-deleted
```typescript
async findAll(transaction?: PrismaTransaction): Promise<SOHeader[]> {
  const db = this.getDb(transaction);
  const headers = await db.sOHeader.findMany({
    where: {
      deletedAt: null, // ← Add this
    },
    include: { lines: { orderBy: { lineNum: 'asc' } } },
    orderBy: [{ orderDate: 'desc' }, { soNum: 'desc' }],
  });
  return headers.map((header) => SOHeader.fromPersistence(header));
}
```

##### findOne() - Check deletedAt
```typescript
async findOne(id: number, transaction?: PrismaTransaction): Promise<SOHeader | null> {
  const db = this.getDb(transaction);
  const header = await db.sOHeader.findFirst({
    where: {
      id,
      deletedAt: null // ← Change findUnique to findFirst and add this
    },
    include: { lines: { orderBy: { lineNum: 'asc' } } },
  });
  if (!header) return null;
  return SOHeader.fromPersistence(header);
}
```

##### findBySONum() - Check deletedAt
```typescript
async findBySONum(soNum: string, transaction?: PrismaTransaction): Promise<SOHeader | null> {
  const db = this.getDb(transaction);
  const header = await db.sOHeader.findFirst({
    where: {
      soNum,
      deletedAt: null // ← Change findUnique to findFirst and add this
    },
    include: { lines: { orderBy: { lineNum: 'asc' } } },
  });
  if (!header) return null;
  return SOHeader.fromPersistence(header);
}
```

##### delete() - Soft delete instead of hard delete
```typescript
async delete(id: number, transaction?: PrismaTransaction): Promise<SOHeader> {
  const db = this.getDb(transaction);

  // Soft delete: update deletedAt field
  const deleted = await db.sOHeader.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: 'system', // TODO: Get from auth context
    },
    include: {
      lines: { orderBy: { lineNum: 'asc' } },
    },
  });

  return SOHeader.fromPersistence(deleted);
}
```

##### Add new method: hardDelete (for admin)
```typescript
async hardDelete(id: number, transaction?: PrismaTransaction): Promise<SOHeader> {
  const db = this.getDb(transaction);
  const deleted = await db.sOHeader.delete({
    where: { id },
    include: { lines: { orderBy: { lineNum: 'asc' } } },
  });
  return SOHeader.fromPersistence(deleted);
}
```

##### Add new method: restore
```typescript
async restore(id: number, transaction?: PrismaTransaction): Promise<SOHeader> {
  const db = this.getDb(transaction);
  const restored = await db.sOHeader.update({
    where: { id },
    data: {
      deletedAt: null,
      deletedBy: null,
    },
    include: { lines: { orderBy: { lineNum: 'asc' } } },
  });
  return SOHeader.fromPersistence(restored);
}
```

#### Step 3: Update Repository Interface

**File**: `src/so/domain/so-header.repository.interface.ts`

Add new methods:
```typescript
export interface ISOHeaderRepository {
  // ... existing methods ...
  hardDelete(id: number, transaction?: PrismaTransaction): Promise<SOHeader>;
  restore(id: number, transaction?: PrismaTransaction): Promise<SOHeader>;
}
```

#### Step 4: Update SOQueryService

**File**: `src/so/application/so-query.service.ts`

Add `deletedAt: null` filter to all findMany operations:

```typescript
// In findAllWithFilters()
const query = this.queryBuilder.buildQuery(filterDto, config);
// Add soft delete filter
query.where = {
  ...query.where,
  deletedAt: null,
};
```

```typescript
// In search()
const where: any = {
  deletedAt: null, // Add this
  OR: [ /* ... */ ],
};
```

#### Step 5: Add Restore Endpoint

**File**: `src/so/sales-orders.controller.ts`

```typescript
@Patch(':id/restore')
@ApiOperation({ summary: 'Restore a soft-deleted sales order' })
@ApiResponse({ status: 200, description: 'Sales order restored successfully' })
@ApiResponse({ status: 404, description: 'Sales order not found' })
async restore(@Param('id', ParseIntPipe) id: number) {
  const result = await this.soService.restore(id);
  if (result.isFailure()) {
    throw new NotFoundException(result.getError()?.message);
  }
  return result.getValue();
}
```

#### Step 6: Add Service Methods

**File**: `src/so/application/so.service.ts`

```typescript
/**
 * Use Case: Restore soft-deleted Sales Order
 */
async restore(id: number): Promise<any> {
  const restored = await this.soHeaderRepository.restore(id);

  // Audit log
  this.auditLogger.log({
    entity: 'SOHeader',
    entityId: restored.getId()!,
    action: 'RESTORE',
    metadata: { soNum: restored.getSONum() },
    timestamp: new Date(),
  });

  return this.findOneWithRelations(restored.getId()!);
}

/**
 * Use Case: Permanently delete Sales Order (admin only)
 */
async hardDelete(id: number): Promise<any> {
  const soHeader = await this.soHeaderRepository.findOne(id);
  if (!soHeader) {
    throw new NotFoundException(`Sales Order with ID ${id} not found`);
  }

  const soNum = soHeader.getSONum();
  const deleted = await this.soHeaderRepository.hardDelete(id);

  // Audit log
  this.auditLogger.log({
    entity: 'SOHeader',
    entityId: id,
    action: 'HARD_DELETE',
    metadata: { soNum },
    timestamp: new Date(),
  });

  return this.toDto(deleted);
}
```

#### Step 7: Update Audit Logger

**File**: `src/so/common/audit-logger.service.ts`

Add new methods:
```typescript
logSORestored(soId: number, soNum: string, userId?: string): void {
  this.log({
    entity: 'SOHeader',
    entityId: soId,
    action: 'RESTORE',
    userId,
    metadata: { soNum },
    timestamp: new Date(),
  });
}

logSOHardDeleted(soId: number, soNum: string, userId?: string): void {
  this.log({
    entity: 'SOHeader',
    entityId: soId,
    action: 'HARD_DELETE',
    userId,
    metadata: { soNum },
    timestamp: new Date(),
  });
}
```

## Benefits of Soft Delete

1. **Data Recovery**: Accidentally deleted orders can be restored
2. **Audit Trail**: Maintain complete history of all orders
3. **Reporting**: Historical data remains available for reports
4. **Compliance**: Meet regulatory requirements for data retention
5. **Business Intelligence**: Analyze deleted orders for insights

## Testing Checklist

After implementing soft delete:

- [ ] Create an SO and verify it appears in list
- [ ] Soft delete the SO and verify it doesn't appear in list
- [ ] Verify soft-deleted SO still exists in database (deletedAt is set)
- [ ] Restore the SO and verify it reappears in list
- [ ] Hard delete an SO and verify it's permanently removed
- [ ] Test filters don't return soft-deleted records
- [ ] Test search doesn't return soft-deleted records
- [ ] Verify audit logs for delete/restore operations

## Security Considerations

1. **Permissions**: Only admins should access hard delete and restore
2. **User Tracking**: Always capture who deleted/restored (use auth context)
3. **Soft Delete Visibility**: Consider adding a "Show Deleted" filter for admins
4. **Retention Policy**: Consider auto-purging soft-deleted records after X days

## Migration SQL (Reference)

If you need to manually add the columns:

```sql
ALTER TABLE "SOHeader"
ADD COLUMN "deletedAt" TIMESTAMP,
ADD COLUMN "deletedBy" VARCHAR(100);

CREATE INDEX "SOHeader_deletedAt_idx" ON "SOHeader"("deletedAt");
```

## Notes

- Current implementation uses hard delete
- To activate soft delete, run the migration and update repository methods as shown above
- Consider adding a scheduled job to purge old soft-deleted records
- Add admin endpoints to view and manage soft-deleted records
