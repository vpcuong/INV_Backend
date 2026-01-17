import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
// import { ItemsService } from './items.service'; // Deprecated - use ItemApplicationService
import { ItemApplicationService } from './application/item.service';
import { ItemQueryService } from './application/item-query.service';
import { ItemRepository } from './infrastructure/item.repository';
// import { ItemsOOPController } from './items-oop.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    ItemsController, // Using Repository pattern with ItemApplicationService
  ],
  providers: [
    // Repository pattern services
    ItemApplicationService,
    ItemQueryService,
    {
      provide: 'IItemRepository',
      useClass: ItemRepository,
    },
  ],
  exports: [ItemApplicationService, ItemQueryService],
})
export class ItemsModule {}
