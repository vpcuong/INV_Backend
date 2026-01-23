import { Item } from './aggregates/item.aggregate';
import { ItemModel } from './entities/item-model.entity';
import { ItemSku } from './entities/item-sku.entity';

export interface ItemFilters {
  categoryId?: number;
  itemTypeId?: number;
  isPurchasable?: boolean;
  isSellable?: boolean;
  isManufactured?: boolean;
  status?: string;
  hasSku?: boolean;
}

export interface ModelFilters {
  itemId?: number;
  customerId?: number;
  status?: string;
  search?: string;
}

export interface SkuFilters {
  itemId?: number;
  modelId?: number;
  colorId?: number;
  genderId?: number;
  sizeId?: number;
  status?: string;
  search?: string;
}

/**
 * Repository interface for Item aggregate
 * Following Repository pattern - abstracts data access from domain logic
 */
export interface IItemRepository {
  // ==================== ITEM OPERATIONS ====================

  /**
   * Find item by ID (basic, without children)
   */
  findById(id: number): Promise<Item | null>;

  /**
   * Find item by ID with models loaded
   */
  findByIdWithModels(id: number): Promise<Item | null>;

  /**
   * Find item by ID with SKUs loaded
   */
  findByIdWithSkus(id: number): Promise<Item | null>;

  /**
   * Find item by ID with all children loaded (models, skus, uoms)
   */
  findByIdComplete(id: number): Promise<Item | null>;

  /**
   * Find all items with optional filters
   */
  findAll(filters?: ItemFilters): Promise<Item[]>;

  /**
   * Save new item
   */
  save(item: Item): Promise<Item>;

  /**
   * Update existing item
   */
  update(item: Item): Promise<Item>;

  /**
   * Save item with all children (models, skus, uoms) in a transaction
   */
  saveWithChildren(item: Item): Promise<Item>;

  /**
   * Delete item by ID
   */
  delete(id: number): Promise<void>;

  /**
   * Check if item exists by code
   */
  existsByCode(code: string, excludeId?: number): Promise<boolean>;

  /**
   * Count items matching filters
   */
  count(filters?: ItemFilters): Promise<number>;

  // ==================== MODEL OPERATIONS ====================

  /**
   * Find model by ID
   */
  findModelById(modelId: number): Promise<ItemModel | null>;

  /**
   * Find models by item ID
   */
  findModelsByItemId(itemId: number): Promise<ItemModel[]>;

  /**
   * Check if model code exists
   */
  existsModelByCode(code: string, excludeId?: number): Promise<boolean>;

  // ==================== SKU OPERATIONS ====================

  /**
   * Find SKU by ID
   */
  findSkuById(skuId: number): Promise<ItemSku | null>;

  /**
   * Find SKUs by item ID
   */
  findSkusByItemId(itemId: number): Promise<ItemSku[]>;

  /**
   * Find SKUs by model ID
   */
  findSkusByModelId(modelId: number): Promise<ItemSku[]>;

  /**
   * Check if SKU code exists
   */
  existsSkuByCode(code: string, excludeId?: number): Promise<boolean>;
}
