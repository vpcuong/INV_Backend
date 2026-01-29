import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  ItemsController,
  ItemModelsController,
  ItemSkusController,
  ItemUomsController,
  SkusController,
  ModelsController,
  SkuUomController,
} from './controllers';
import { ItemAggregateService } from './application/item-aggregate.service';
import { ItemQueryService } from './application/item-query.service';
import { SkuUomService } from './application/sku-uom.service';
import { ItemRepository } from './infrastructure/item.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { FilteringModule } from '@/common/filtering';

@Module({
  imports: [
    PrismaModule,
    FilteringModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [
    ItemsController,
    ItemModelsController,
    ItemSkusController,
    ItemUomsController,
    SkusController,
    ModelsController,
    SkuUomController,
  ],
  providers: [
    ItemAggregateService,
    ItemQueryService,
    SkuUomService,
    {
      provide: 'IItemRepository',
      useClass: ItemRepository,
    },
  ],
  exports: [ItemAggregateService, ItemQueryService, SkuUomService],
})
export class ItemsModule {}
