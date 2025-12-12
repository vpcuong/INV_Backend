# Customer Modules Implementation Guide

## ✅ Completed Modules

1. **Customer Module** (`src/customers/`)
   - ✅ DTOs: CreateCustomerDto, UpdateCustomerDto
   - ✅ Enum: CustomerStatus
   - ✅ Service with CRUD + activate/deactivate/blacklist
   - ✅ Controller with 9 endpoints
   - ✅ Module configuration

2. **CustomerAddress Module** (`src/customer-addresses/`)
   - ✅ DTOs: CreateCustomerAddressDto, UpdateCustomerAddressDto
   - ✅ Enum: AddressType
   - ✅ Service with smart default handling
   - ✅ Controller with 6 endpoints
   - ✅ Module configuration

## 📋 Remaining Tasks

### 1. CustomerContact Module (`src/customer-contacts/`)

**Enum needed:**
```typescript
// No enum - all fields are simple types
```

**CreateCustomerContactDto:**
```typescript
{
  customerId: number (required)
  fullName: string (required, max 200)
  position?: string (max 100)
  department?: string (max 100)
  phone?: string (max 50)
  email?: string (max 255, email validation)
  zalo?: string (max 50)
  wechat?: string (max 50)
  isPrimary?: boolean (default: false)
  isActive?: boolean (default: true)
}
```

**Service Logic:**
- When setting `isPrimary=true`, unset other isPrimary for same customer
- Find by customer
- Filter by isActive

**Controller Endpoints:**
- POST /customer-contacts
- GET /customer-contacts
- GET /customer-contacts/customer/:customerId
- GET /customer-contacts/:id
- PATCH /customer-contacts/:id
- DELETE /customer-contacts/:id
- PATCH /customer-contacts/:id/set-primary (helper endpoint)

---

### 2. CustomerPaymentTerm Module (`src/customer-payment-terms/`)

**Enum needed:**
```typescript
export enum PaymentTermCode {
  COD = 'COD',
  PREPAID = 'PREPAID',
  NET7 = 'NET7',
  NET15 = 'NET15',
  NET30 = 'NET30',
  NET45 = 'NET45',
  NET60 = 'NET60',
  NET90 = 'NET90',
  EOM = 'EOM',
  CUSTOM = 'CUSTOM',
}
```

**CreateCustomerPaymentTermDto:**
```typescript
{
  customerId: number (required)
  paymentTerm: PaymentTermCode (enum, required)
  creditLimit?: Decimal
  currency?: string (default: 'VND', max 10)
  effectiveFrom: DateTime (required)
  effectiveTo?: DateTime
  isActive?: boolean (default: true)
  createdBy?: string (max 50)
}
```

**Service Logic:**
- Find by customer
- Find active payment terms
- Get current payment term (effectiveFrom <= NOW <= effectiveTo, isActive=true)

**Controller Endpoints:**
- POST /customer-payment-terms
- GET /customer-payment-terms
- GET /customer-payment-terms/customer/:customerId
- GET /customer-payment-terms/customer/:customerId/current (get active term for today)
- GET /customer-payment-terms/:id
- PATCH /customer-payment-terms/:id
- DELETE /customer-payment-terms/:id
- PATCH /customer-payment-terms/:id/activate
- PATCH /customer-payment-terms/:id/deactivate

---

## 🔧 Next Steps

### 3. Update AppModule

Add to `src/app.module.ts`:
```typescript
import { CustomersModule } from './customers/customers.module';
import { CustomerAddressesModule } from './customer-addresses/customer-addresses.module';
import { CustomerContactsModule } from './customer-contacts/customer-contacts.module';
import { CustomerPaymentTermsModule } from './customer-payment-terms/customer-payment-terms.module';

@Module({
  imports: [
    // ... existing modules
    CustomersModule,
    CustomerAddressesModule,
    CustomerContactsModule,
    CustomerPaymentTermsModule,
  ],
})
```

### 4. Update Swagger Tags in main.ts

```typescript
.addTag('customers', 'Customer management')
.addTag('customer-addresses', 'Customer address management')
.addTag('customer-contacts', 'Customer contact management')
.addTag('customer-payment-terms', 'Customer payment term management')
```

### 5. Run Migration

```bash
npx prisma migrate dev --name add_customer_models
npx prisma generate
```

### 6. Test Build

```bash
npm run build
```

---

## 📄 Module Template

Use this template for remaining modules:

### Service Template

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class XxxService {
  constructor(private prisma: PrismaService) {}

  async create(createDto) {
    return this.prisma.client.xxx.create({
      data: createDto,
    });
  }

  async findAll() {
    return this.prisma.client.xxx.findMany({
      include: { customer: true },
      orderBy: { id: 'asc' },
    });
  }

  async findByCustomer(customerId: number) {
    return this.prisma.client.xxx.findMany({
      where: { customerId },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.client.xxx.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!item) {
      throw new NotFoundException(\`Item with ID \${id} not found\`);
    }

    return item;
  }

  async update(id: number, updateDto) {
    await this.findOne(id);
    return this.prisma.client.xxx.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.client.xxx.delete({
      where: { id },
    });
  }
}
```

---

## 📊 Expected API Structure

After completion, you will have:

**Customer APIs:**
- 9 endpoints for Customer management

**CustomerAddress APIs:**
- 6 endpoints for Address management

**CustomerContact APIs:**
- 7 endpoints for Contact management

**CustomerPaymentTerm APIs:**
- 9 endpoints for Payment Term management

**Total: ~31 endpoints**

---

## 🎯 Business Rules Implemented

1. **Customer:**
   - Unique customerCode
   - Status management (ACTIVE/INACTIVE/BLACKLIST)
   - Soft delete support with isActive

2. **CustomerAddress:**
   - Only one default address per (customer + addressType)
   - Cascade delete when customer is deleted

3. **CustomerContact:**
   - Only one primary contact per customer
   - Filter by isActive
   - Cascade delete when customer is deleted

4. **CustomerPaymentTerm:**
   - Date range validation (effectiveFrom to effectiveTo)
   - Support for active/inactive terms
   - Get current active term
   - Cascade delete when customer is deleted

---

## ⚠️ Important Notes

1. **Foreign Keys:** All child tables use `Int` to match Customer.id
2. **Cascade Delete:** All relations use `onDelete: Cascade`
3. **Indexes:** Added for performance on foreign keys and search fields
4. **Validation:** Full validation with class-validator decorators
5. **Swagger:** Complete API documentation with @ApiTags, @ApiOperation

---

## 🚀 Quick Start Command

After creating all files:

```bash
# Run migration
npx prisma migrate dev --name add_customer_models

# Generate Prisma Client
npx prisma generate

# Build
npm run build

# Run
npm run start:dev

# Visit Swagger
http://localhost:3000/api/docs
```
