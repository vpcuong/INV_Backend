import { ItemSku } from './item-sku.entity';

export interface IItemSkuRepository {
  create(itemSku: ItemSku): Promise<ItemSku>;
  findAll(): Promise<ItemSku[]>;
  findOne(id: number): Promise<ItemSku | null>;
  findByItemId(itemId: number): Promise<ItemSku[]>;
  findByModelId(modelId: number): Promise<ItemSku[]>;
  findBySkuCode(skuCode: string): Promise<ItemSku | null>;
  update(id: number, itemSku: ItemSku): Promise<ItemSku>;
  remove(id: number): Promise<ItemSku>;
}
