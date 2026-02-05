import { Warehouse } from './warehouse.entity';
import { WarehouseItem } from './warehouse-item.entity';

export type PrismaTransaction = any;

export interface WarehouseFilters {
  status?: string;
  code?: string;
  name?: string;
}

export interface IWarehouseRepository {
  // Warehouse operations
  findById(
    id: number,
    transaction?: PrismaTransaction,
  ): Promise<Warehouse | null>;

  findByPublicId(
    publicId: string,
    transaction?: PrismaTransaction,
  ): Promise<Warehouse | null>;

  findByCode(
    code: string,
    transaction?: PrismaTransaction,
  ): Promise<Warehouse | null>;

  findAll(
    filters?: WarehouseFilters,
    transaction?: PrismaTransaction,
  ): Promise<Warehouse[]>;

  save(
    warehouse: Warehouse,
    transaction?: PrismaTransaction,
  ): Promise<Warehouse>;

  update(
    warehouse: Warehouse,
    transaction?: PrismaTransaction,
  ): Promise<Warehouse>;

  delete(id: number, transaction?: PrismaTransaction): Promise<void>;

  existsByCode(
    code: string,
    excludeId?: number,
    transaction?: PrismaTransaction,
  ): Promise<boolean>;

  // Inventory operations
  findInventory(
    warehouseId: number,
    itemSkuId: number,
    transaction?: PrismaTransaction,
  ): Promise<WarehouseItem | null>;

  findInventoryByWarehouse(
    warehouseId: number,
    transaction?: PrismaTransaction,
  ): Promise<WarehouseItem[]>;

  findInventoryBySku(
    itemSkuId: number,
    transaction?: PrismaTransaction,
  ): Promise<WarehouseItem[]>;

  saveInventory(
    item: WarehouseItem,
    transaction?: PrismaTransaction,
  ): Promise<WarehouseItem>;

  updateInventory(
    item: WarehouseItem,
    transaction?: PrismaTransaction,
  ): Promise<WarehouseItem>;

  upsertInventory(
    item: WarehouseItem,
    transaction?: PrismaTransaction,
  ): Promise<WarehouseItem>;

  // Transaction support
  transaction<T>(
    callback: (repo: IWarehouseRepository) => Promise<T>,
  ): Promise<T>;
}
