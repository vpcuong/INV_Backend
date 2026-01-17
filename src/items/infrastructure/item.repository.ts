import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Item } from '../domain/item.entity';
import {
  IItemRepository,
  ItemFilters,
} from '../domain/item.repository.interface';

/**
 * Prisma implementation of IItemRepository
 * Handles data persistence and retrieval
 */
@Injectable()
export class ItemRepository implements IItemRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: number): Promise<Item | null> {
    const data = await this.prisma.client.item.findUnique({
      where: { id },
      include: {
        itemUoms: {
          include: {
            uom: true,
          },
        },
        category: true,
        itemType: true,
        material: true,
        uom: true,
      },
    });

    return data ? Item.fromPersistence(data) : null;
  }

  async findAll(filters?: ItemFilters): Promise<Item[]> {
    const data = await this.prisma.client.item.findMany({
      where: this.buildWhereClause(filters),
      include: {
        itemUoms: {
          include: {
            uom: true,
          },
        },
        category: true,
        itemType: true,
        uom: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return data.map((d) => Item.fromPersistence(d));
  }

  async save(item: Item): Promise<Item> {
    const data = await this.prisma.client.item.create({
      data: item.toPersistence(),
      include: {
        itemUoms: {
          include: {
            uom: true,
          },
        },
      },
    });

    return Item.fromPersistence(data);
  }

  async update(item: Item): Promise<Item> {
    const data = await this.prisma.client.item.update({
      where: { id: item.getId() },
      data: item.toPersistence(),
      include: {
        itemUoms: {
          include: {
            uom: true,
          },
        },
        category: true,
        itemType: true,
        material: true,
        uom: true,
      },
    });

    return Item.fromPersistence(data);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.client.item.delete({
      where: { id },
    });
  }

  async existsByCode(code: string, excludeId?: number): Promise<boolean> {
    const count = await this.prisma.client.item.count({
      where: {
        code,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return count > 0;
  }

  async count(filters?: ItemFilters): Promise<number> {
    return this.prisma.client.item.count({
      where: this.buildWhereClause(filters),
    });
  }

  /**
   * Build Prisma where clause from filters
   */
  private buildWhereClause(filters?: ItemFilters): any {
    if (!filters) return {};

    return {
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.itemTypeId && { itemTypeId: filters.itemTypeId }),
      ...(filters.isPurchasable !== undefined && {
        isPurchasable: filters.isPurchasable,
      }),
      ...(filters.isSellable !== undefined && {
        isSellable: filters.isSellable,
      }),
      ...(filters.isManufactured !== undefined && {
        isManufactured: filters.isManufactured,
      }),
      ...(filters.status && { status: filters.status }),
      ...(filters.hasSku !== undefined && { hasSku: filters.hasSku }),
    };
  }
}
