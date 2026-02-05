import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WarehouseController } from './controllers/warehouse.controller';
import {
  WarehouseInventoryController,
  InventoryController,
} from './controllers/warehouse-inventory.controller';
import { WarehouseService } from './application/warehouse.service';
import { WarehouseQueryService } from './application/warehouse-query.service';
import { WarehouseRepository } from './infrastructure/warehouse.repository';
import { WAREHOUSE_REPOSITORY } from './constant/warehouse.token';

@Module({
  imports: [PrismaModule],
  controllers: [
    WarehouseController,
    WarehouseInventoryController,
    InventoryController,
  ],
  providers: [
    WarehouseService,
    WarehouseQueryService,
    {
      provide: WAREHOUSE_REPOSITORY,
      useClass: WarehouseRepository,
    },
  ],
  exports: [WarehouseService, WarehouseQueryService],
})
export class WarehouseModule {}
