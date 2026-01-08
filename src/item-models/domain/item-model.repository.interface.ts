import { ItemModel } from './item-model.entity';

export interface IItemModelRepository {
  create(itemModel: ItemModel): Promise<ItemModel>;
  findAll(): Promise<ItemModel[]>;
  findOne(id: number): Promise<ItemModel | null>;
  findByCode(code: string): Promise<ItemModel | null>;
  findByItemId(itemId: number): Promise<ItemModel[]>;
  update(id: number, itemModel: ItemModel): Promise<ItemModel>;
  remove(id: number): Promise<ItemModel>;
}
