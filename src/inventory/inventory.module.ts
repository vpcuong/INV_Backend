import { Module } from '@nestjs/common';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryService } from './application/inventory.service';
import { InventoryQueryService } from './application/inventory-query.service';
import { InvTransHeaderRepository } from './infrastructure/inventory.repository';
import { InvTransNumberGeneratorService } from './domain/services/inv-trans-number-generator.service';
import { StockService } from './domain/services/stock.service';
import { PrismaModule } from '../prisma/prisma.module';
import { QueryBuilderService } from '../common/filtering/query-builder.service';
import {
  INV_TRANS_HEADER_REPOSITORY,
  INV_TRANS_NUMBER_GENERATOR,
  STOCK_SERVICE,
} from './constant/inventory.token';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { SoModule } from '../so/so.module';
import { PoModule } from '../po/po.module';

@Module({
  imports: [PrismaModule, WarehouseModule, SoModule, PoModule],
  providers: [
    InventoryService,
    InventoryQueryService,
    QueryBuilderService,
    {
      provide: INV_TRANS_HEADER_REPOSITORY,
      useClass: InvTransHeaderRepository,
    },
    {
      provide: INV_TRANS_NUMBER_GENERATOR,
      useFactory: (repository: InvTransHeaderRepository) => {
        return new InvTransNumberGeneratorService(repository);
      },
      inject: [INV_TRANS_HEADER_REPOSITORY],
    },
    {
      provide: STOCK_SERVICE,
      useClass: StockService,
    },
  ],
  controllers: [InventoryController],
  exports: [InventoryService, InventoryQueryService],
})
export class InventoryModule {}
