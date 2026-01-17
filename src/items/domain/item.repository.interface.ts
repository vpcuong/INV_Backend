import { Item } from './item.entity';

export interface ItemFilters {
  categoryId?: number;
  itemTypeId?: number;
  isPurchasable?: boolean;
  isSellable?: boolean;
  isManufactured?: boolean;
  status?: string;
  hasSku?: boolean;
}

/**
 * Repository interface for Item aggregate
 * Following Repository pattern - abstracts data access from domain logic
 */
export interface IItemRepository {
  /**
   * Find item by ID
   */
  findById(id: number): Promise<Item | null>;

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
}
