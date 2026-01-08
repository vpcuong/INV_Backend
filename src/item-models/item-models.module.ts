import { Module } from '@nestjs/common';
import { ItemModelsController } from './item-models.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ItemModelService } from './application/item-model.service';
import { ItemModelRepository } from './infrastructure/item-model.repository';
import { ITEM_MODEL_REPOSITORY } from './constant/item-model.token';

@Module({
  imports: [PrismaModule],
  controllers: [ItemModelsController],
  providers: [
    ItemModelService,
    {
      provide: ITEM_MODEL_REPOSITORY,
      useClass: ItemModelRepository,
    },
  ],
  exports: [ItemModelService],
})
export class ItemModelsModule {}
