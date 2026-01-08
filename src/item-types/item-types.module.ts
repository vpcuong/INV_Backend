import { Module } from '@nestjs/common';
import { ItemTypesController } from './item-types.controller';
import { ItemTypeService } from './application/item-type.service';
import { ItemTypeRepository } from './infrastructure/item-type.repository';
import { ITEM_TYPE_REPOSITORY } from './constant/item-type.token';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ItemTypesController],
  providers: [
    ItemTypeService,
    {
      provide: ITEM_TYPE_REPOSITORY,
      useClass: ItemTypeRepository,
    },
  ],
  exports: [ItemTypeService],
})
export class ItemTypesModule {}
