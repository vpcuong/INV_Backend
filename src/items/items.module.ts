import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { ItemApplicationService } from './application/item.service';
import { ItemRepository } from './infrastructure/item.repository';
import { ItemsOOPController } from './items-oop.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    ItemsController, // Original controller
    ItemsOOPController, // OOP-based controller (demo)
  ],
  providers: [
    // Keep old service for backward compatibility
    ItemsService,
    // New OOP services
    ItemApplicationService,
    {
      provide: 'IItemRepository',
      useClass: ItemRepository,
    },
  ],
  exports: [ItemsService, ItemApplicationService],
})
export class ItemsModule {}
