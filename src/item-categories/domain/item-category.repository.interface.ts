import { ItemCategory } from './item-category.entity';

export interface IItemCategoryRepository {
  create(category: ItemCategory): Promise<ItemCategory>;
  findById(id: number): Promise<ItemCategory | null>;
  findByCode(code: string): Promise<ItemCategory | null>;
  findAll(): Promise<ItemCategory[]>;
  update(category: ItemCategory): Promise<ItemCategory>;
  delete(id: number): Promise<void>;
}
