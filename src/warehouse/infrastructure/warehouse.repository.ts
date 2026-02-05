import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ulid } from 'ulid';
import {
  IWarehouseRepository,
  PrismaTransaction,
  WarehouseFilters,
} from '../domain/warehouse.repository.interface';
import { Warehouse } from '../domain/warehouse.entity';
import { WarehouseItem } from '../domain/warehouse-item.entity';

@Injectable()
export class WarehouseRepository implements IWarehouseRepository {
  constructor(private prisma: PrismaService) {}

  private getDb(transaction?: PrismaTransaction) {
    return transaction || this.prisma.client;
  }

  // Warehouse operations
  async findById(
    id: number,
    transaction?: PrismaTransaction,
  ): Promise<Warehouse | null> {
    const db = this.getDb(transaction);
    const data = await db.warehouse.findUnique({
      where: { id },
    });
    return data ? Warehouse.fromPersistence(data) : null;
  }

  async findByPublicId(
    publicId: string,
    transaction?: PrismaTransaction,
  ): Promise<Warehouse | null> {
    const db = this.getDb(transaction);
    const data = await db.warehouse.findUnique({
      where: { publicId },
    });
    return data ? Warehouse.fromPersistence(data) : null;
  }

  async findByCode(
    code: string,
    transaction?: PrismaTransaction,
  ): Promise<Warehouse | null> {
    const db = this.getDb(transaction);
    const data = await db.warehouse.findUnique({
      where: { code },
    });
    return data ? Warehouse.fromPersistence(data) : null;
  }

  async findAll(
    filters?: WarehouseFilters,
    transaction?: PrismaTransaction,
  ): Promise<Warehouse[]> {
    const db = this.getDb(transaction);

    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.code) {
      where.code = { contains: filters.code };
    }
    if (filters?.name) {
      where.name = { contains: filters.name };
    }

    const data = await db.warehouse.findMany({
      where,
      orderBy: { code: 'asc' },
    });

    return data.map((item: any) => Warehouse.fromPersistence(item));
  }

  async save(
    warehouse: Warehouse,
    transaction?: PrismaTransaction,
  ): Promise<Warehouse> {
    const db = this.getDb(transaction);
    const { id, publicId, createdAt, updatedAt, ...data } =
      warehouse.toPersistence();

    const created = await db.warehouse.create({
      data: {
        ...data,
        publicId: ulid(),
      },
    });

    return Warehouse.fromPersistence(created);
  }

  async update(
    warehouse: Warehouse,
    transaction?: PrismaTransaction,
  ): Promise<Warehouse> {
    const db = this.getDb(transaction);
    const { id, publicId, createdAt, updatedAt, ...data } =
      warehouse.toPersistence();

    const updated = await db.warehouse.update({
      where: { id: warehouse.getId() },
      data,
    });

    return Warehouse.fromPersistence(updated);
  }

  async delete(id: number, transaction?: PrismaTransaction): Promise<void> {
    const db = this.getDb(transaction);
    await db.warehouse.delete({
      where: { id },
    });
  }

  async existsByCode(
    code: string,
    excludeId?: number,
    transaction?: PrismaTransaction,
  ): Promise<boolean> {
    const db = this.getDb(transaction);

    const where: any = { code };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await db.warehouse.count({ where });
    return count > 0;
  }

  // Inventory operations
  async findInventory(
    warehouseId: number,
    itemSkuId: number,
    transaction?: PrismaTransaction,
  ): Promise<WarehouseItem | null> {
    const db = this.getDb(transaction);
    const data = await db.warehouseItem.findUnique({
      where: {
        warehouseId_itemSkuId: {
          warehouseId,
          itemSkuId,
        },
      },
    });
    return data ? WarehouseItem.fromPersistence(data) : null;
  }

  async findInventoryByWarehouse(
    warehouseId: number,
    transaction?: PrismaTransaction,
  ): Promise<WarehouseItem[]> {
    const db = this.getDb(transaction);
    const data = await db.warehouseItem.findMany({
      where: { warehouseId },
      orderBy: { itemSkuId: 'asc' },
    });

    return data.map((item: any) => WarehouseItem.fromPersistence(item));
  }

  async findInventoryBySku(
    itemSkuId: number,
    transaction?: PrismaTransaction,
  ): Promise<WarehouseItem[]> {
    const db = this.getDb(transaction);
    const data = await db.warehouseItem.findMany({
      where: { itemSkuId },
      orderBy: { warehouseId: 'asc' },
    });

    return data.map((item: any) => WarehouseItem.fromPersistence(item));
  }

  async saveInventory(
    item: WarehouseItem,
    transaction?: PrismaTransaction,
  ): Promise<WarehouseItem> {
    const db = this.getDb(transaction);
    const { id, createdAt, updatedAt, ...data } = item.toPersistence();

    const created = await db.warehouseItem.create({
      data,
    });

    return WarehouseItem.fromPersistence(created);
  }

  async updateInventory(
    item: WarehouseItem,
    transaction?: PrismaTransaction,
  ): Promise<WarehouseItem> {
    const db = this.getDb(transaction);
    const { id, warehouseId, itemSkuId, createdAt, updatedAt, ...data } =
      item.toPersistence();

    const updated = await db.warehouseItem.update({
      where: { id: item.getId() },
      data,
    });

    return WarehouseItem.fromPersistence(updated);
  }

  async upsertInventory(
    item: WarehouseItem,
    transaction?: PrismaTransaction,
  ): Promise<WarehouseItem> {
    const db = this.getDb(transaction);
    const persistence = item.toPersistence();

    const upserted = await db.warehouseItem.upsert({
      where: {
        warehouseId_itemSkuId: {
          warehouseId: persistence.warehouseId,
          itemSkuId: persistence.itemSkuId,
        },
      },
      create: {
        warehouseId: persistence.warehouseId,
        itemSkuId: persistence.itemSkuId,
        quantity: persistence.quantity,
        reservedQty: persistence.reservedQty,
      },
      update: {
        quantity: persistence.quantity,
        reservedQty: persistence.reservedQty,
      },
    });

    return WarehouseItem.fromPersistence(upserted);
  }

  // Transaction support
  async transaction<T>(
    callback: (repo: IWarehouseRepository) => Promise<T>,
  ): Promise<T> {
    return await this.prisma.client.$transaction(async (tx) => {
      const transactionalRepo = new WarehouseRepository({
        client: tx,
      } as PrismaService);
      return await callback(transactionalRepo);
    });
  }
}
