import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CustomerService } from './application/customer.service';
import { CustomerQueryService } from './application/customer-query.service';
import { CustomerRepository } from './infrastructure/customer.repository';
import { CUSTOMER_REPOSITORY } from './constant/customer.token';

@Module({
  imports: [PrismaModule],
  controllers: [CustomersController],
  providers: [
    CustomerService,
    CustomerQueryService,
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerRepository,
    },
  ],
  exports: [CustomerService],
})
export class CustomersModule {}
