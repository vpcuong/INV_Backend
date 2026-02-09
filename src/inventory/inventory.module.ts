import { Module } from '@nestjs/common';
import { InventoryController } from './controllers/inventory.controller';
import { AdjustReasonController } from './controllers/adjust-reason.controller';
import { InventoryService } from './application/inventory.service';
import { InventoryQueryService } from './application/inventory-query.service';
import { AdjustReasonService } from './application/adjust-reason.service';
import { InvTransHeaderRepository } from './infrastructure/inventory.repository';
import { AdjustReasonRepository } from './infrastructure/adjust-reason.repository';
import { InvTransNumberGeneratorService } from './domain/services/inv-trans-number-generator.service';
import { StockRepository } from './infrastructure/stock.repository';
import { StockService } from './domain/services/stock.service';
import { PrismaModule } from '../prisma/prisma.module';
import { QueryBuilderService } from '../common/filtering/query-builder.service';
import {
  INV_TRANS_HEADER_REPOSITORY,
  INV_TRANS_NUMBER_GENERATOR,
  STOCK_SERVICE,
  ADJUST_REASON_REPOSITORY,
  STOCK_REPOSITORY
} from './constant/inventory.token';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { SoModule } from '../so/so.module';
import { PoModule } from '../po/po.module';
import { ItemsModule } from '../items/items.module';
import { UomModule } from '../uom/uom.module';

@Module({
  imports: [PrismaModule, WarehouseModule, SoModule, PoModule, ItemsModule, UomModule],
  providers: [
    InventoryService,
    InventoryQueryService,
    AdjustReasonService,
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
    {
      provide: ADJUST_REASON_REPOSITORY,
      useClass: AdjustReasonRepository,
    },
    {
      provide: STOCK_REPOSITORY,
      useClass: StockRepository,
    }
  ],
  controllers: [InventoryController, AdjustReasonController],
  exports: [InventoryService, InventoryQueryService, AdjustReasonService],
})
export class InventoryModule {}
