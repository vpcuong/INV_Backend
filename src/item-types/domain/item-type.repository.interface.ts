import { ItemType } from './item-type.entity';

export interface IItemTypeRepository {
  create(itemType: ItemType): Promise<ItemType>;
  findAll(): Promise<ItemType[]>;
  findOne(id: number): Promise<ItemType | null>;
  findByCode(code: string): Promise<ItemType | null>;
  update(id: number, itemType: ItemType): Promise<ItemType>;
  remove(id: number): Promise<ItemType>;
  activate(id: number): Promise<ItemType>;
  deactivate(id: number): Promise<ItemType>;
}