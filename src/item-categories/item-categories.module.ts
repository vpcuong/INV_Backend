import { Module } from '@nestjs/common';
import { ItemCategoriesController } from './item-categories.controller';
import { ItemCategoryService } from './application/item-category.service';
import { ItemCategoryQueryService } from './application/item-category-query.service';
import { ItemCategoryRepository } from './infrastructure/item-category.repository';
import { ITEM_CATEGORY_REPOSITORY } from './constant/item-category.token';

@Module({
  controllers: [ItemCategoriesController],
  providers: [
    ItemCategoryService,
    ItemCategoryQueryService,
    {
      provide: ITEM_CATEGORY_REPOSITORY,
      useClass: ItemCategoryRepository,
    },
  ],
  exports: [ItemCategoryService, ItemCategoryQueryService],
})
export class ItemCategoriesModule {}
