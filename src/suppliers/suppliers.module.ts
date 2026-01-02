import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SupplierService } from './application/supplier.service';
import { SupplierQueryService } from './application/supplier-query.service';
import { SupplierAggregationService } from './application/supplier-aggregation.service';
import { SupplierRepository } from './infrastructure/supplier.repository';
import { INJECTION_TOKENS } from './constant/supplier.token';

@Module({
  imports: [PrismaModule],
  controllers: [SuppliersController],
  providers: [
    SupplierService,
    SupplierQueryService,
    SupplierAggregationService,
    {
      provide: INJECTION_TOKENS.SUPPLIER_REPOSITORY,
      useClass: SupplierRepository,
    },
  ],
  exports: [SupplierService, SupplierQueryService, SupplierAggregationService],
})
export class SuppliersModule {}
