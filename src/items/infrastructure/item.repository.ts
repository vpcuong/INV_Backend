import { Injectable } from '@nestjs/common';
import { ulid } from 'ulid';
import { PrismaService } from '../../prisma/prisma.service';
import { Item } from '../domain/aggregates/item.aggregate';
import { ItemModel } from '../domain/entities/item-model.entity';
import { ItemSku } from '../domain/entities/item-sku.entity';
import {
  IItemRepository,
  ItemFilters,
} from '../domain/item.repository.interface';

@Injectable()
export class ItemRepository implements IItemRepository {
  constructor(private prisma: PrismaService) {}

  // ==================== ITEM OPERATIONS ====================

  async findById(id: number): Promise<Item | null> {
    const data = await this.prisma.client.item.findUnique({
      where: { id },
      include: {
        itemUoms: true,
        category: true,
        itemType: true,
        material: true,
        uom: true,
      },
    });

    return data ? Item.fromPersistence(data) : null;
  }

  async findByPublicId(publicId: string): Promise<Item | null> {
    const data = await this.prisma.client.item.findUnique({
      where: { publicId },
      include: {
        itemUoms: true,
        category: true,
        itemType: true,
        material: true,
        uom: true,
      },
    });

    return data ? Item.fromPersistence(data) : null;
  }

  async findByPublicIdComplete(publicId: string): Promise<Item | null> {
    const data = await this.prisma.client.item.findUnique({
      where: { publicId },
      include: {
        itemUoms: true,
        models: {
          include: {
            customer: true,
          },
        },
        skus: {
          include: {
            color: true,
            gender: true,
            size: true,
            skuUoms: true,
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

  async findByIdWithModels(id: number): Promise<Item | null> {
    const data = await this.prisma.client.item.findUnique({
      where: { id },
      include: {
        itemUoms: true,
        models: true,
        category: true,
        itemType: true,
        uom: true,
      },
    });

    return data ? Item.fromPersistence(data) : null;
  }

  async findByIdWithSkus(id: number): Promise<Item | null> {
    const data = await this.prisma.client.item.findUnique({
      where: { id },
      include: {
        itemUoms: true,
        skus: {
          include: {
            color: true,
            gender: true,
            size: true,
          },
        },
        category: true,
        itemType: true,
        uom: true,
      },
    });

    return data ? Item.fromPersistence(data) : null;
  }

  async findByIdComplete(id: number): Promise<Item | null> {
    const data = await this.prisma.client.item.findUnique({
      where: { id },
      include: {
        itemUoms: true,
        models: {
          include: {
            customer: true,
          },
        },
        skus: {
          include: {
            color: true,
            gender: true,
            size: true,
            skuUoms: true,
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
        itemUoms: true,
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
    const itemData = item.toPersistence();
    delete itemData.id;
    delete itemData.createdAt;
    delete itemData.updatedAt;

    // Generate ULID for new items
    itemData.publicId = itemData.publicId || ulid();

    const data = await this.prisma.client.item.create({
      data: itemData,
      include: {
        itemUoms: true,
      },
    });

    return Item.fromPersistence(data);
  }

  async update(item: Item): Promise<Item> {
    const data = await this.prisma.client.item.update({
      where: { id: item.getId() },
      data: item.toPersistence(),
      include: {
        itemUoms: true,
        category: true,
        itemType: true,
        material: true,
        uom: true,
      },
    });

    return Item.fromPersistence(data);
  }

  async updatePartial(id: number, data: Record<string, any>): Promise<any> {
    const result = await this.prisma.client.item.update({
      where: { id },
      data,
      include: {
        itemUoms: true,
        category: true,
        itemType: true,
        material: true,
        uom: true,
      },
    });

    return result;
  }

  async saveWithChildren(item: Item): Promise<Item> {
    const itemId = item.getId();

    return this.prisma.client.$transaction(async (tx) => {
      // 1. Update or create the Item
      const itemData = item.toPersistence();
      delete itemData.id;

      let savedItem;
      if (itemId) {
        // Don't update publicId on existing items
        delete itemData.publicId;
        savedItem = await tx.item.update({
          where: { id: itemId },
          data: itemData,
        });
      } else {
        // Generate ULID for new items
        itemData.publicId = itemData.publicId || ulid();
        savedItem = await tx.item.create({
          data: itemData,
        });
      }

      const savedItemId = savedItem.id;

      // 2. Sync ItemModels
      await this.syncModels(tx, savedItemId, item.getModels());

      // 3. Sync ItemSkus
      await this.syncSkus(tx, savedItemId, item.getSkus());

      // 4. Sync ItemUOMs
      await this.syncUoms(tx, savedItemId, item.getItemUOMs());

      // 5. Return the complete aggregate
      const result = await tx.item.findUnique({
        where: { id: savedItemId },
        include: {
          itemUoms: true,
          models: true,
          skus: true,
          category: true,
          itemType: true,
          uom: true,
        },
      });

      return Item.fromPersistence(result);
    });
  }

  private async syncModels(
    tx: any,
    itemId: number,
    models: ItemModel[],
  ): Promise<void> {
    // Get existing model IDs
    const existingModels = await tx.itemModel.findMany({
      where: { itemId },
      select: { id: true },
    });
    const existingIds = new Set(existingModels.map((m: any) => m.id));

    // Get model IDs from domain
    const domainModelIds = new Set(
      models.filter((m) => m.getId()).map((m) => m.getId()),
    );

    // Delete models that are no longer in the aggregate
    const toDelete = ([...existingIds] as number[]).filter((id) => !domainModelIds.has(id));
    if (toDelete.length > 0) {
      await tx.itemModel.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    // Upsert models
    for (const model of models) {
      const modelData = model.toPersistence();
      delete modelData.id;
      modelData.itemId = itemId;

      if (model.getId()) {
        // Don't update publicId on existing models
        delete modelData.publicId;
        await tx.itemModel.update({
          where: { id: model.getId() },
          data: modelData,
        });
      } else {
        // Generate ULID for new models
        modelData.publicId = modelData.publicId || ulid();
        await tx.itemModel.create({
          data: modelData,
        });
      }
    }
  }

  private async syncSkus(
    tx: any,
    itemId: number,
    skus: ItemSku[],
  ): Promise<void> {
    // Get existing SKU IDs
    const existingSkus = await tx.itemSKU.findMany({
      where: { itemId },
      select: { id: true },
    });
    const existingIds = new Set(existingSkus.map((s: any) => s.id));

    // Get SKU IDs from domain
    const domainSkuIds = new Set(
      skus.filter((s) => s.getId()).map((s) => s.getId()),
    );

    // Delete SKUs that are no longer in the aggregate
    const toDelete = ([...existingIds] as number[]).filter((id) => !domainSkuIds.has(id));
    if (toDelete.length > 0) {
      await tx.itemSKU.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    // Upsert SKUs
    for (const sku of skus) {
      const skuData = sku.toPersistence();
      delete skuData.id;
      skuData.itemId = itemId;

      if (sku.getId()) {
        // Don't update publicId on existing SKUs
        delete skuData.publicId;
        await tx.itemSKU.update({
          where: { id: sku.getId() },
          data: skuData,
        });
      } else {
        // Generate ULID for new SKUs
        skuData.publicId = skuData.publicId || ulid();
        await tx.itemSKU.create({
          data: skuData,
        });
      }
    }
  }

  private async syncUoms(
    tx: any,
    itemId: number,
    uoms: any[],
  ): Promise<void> {
    // Get existing UOM codes
    const existingUoms = await tx.itemUOM.findMany({
      where: { itemId },
      select: { uomCode: true },
    });
    const existingCodes = new Set(existingUoms.map((u: any) => u.uomCode));

    // Get UOM codes from domain
    const domainUomCodes = new Set(uoms.map((u) => u.getUomCode()));

    // Delete UOMs that are no longer in the aggregate
    const toDelete = [...existingCodes].filter(
      (code) => !domainUomCodes.has(code),
    );
    if (toDelete.length > 0) {
      await tx.itemUOM.deleteMany({
        where: {
          itemId,
          uomCode: { in: toDelete },
        },
      });
    }

    // Upsert UOMs
    for (const uom of uoms) {
      const uomData = uom.toPersistence();
      uomData.itemId = itemId;

      await tx.itemUOM.upsert({
        where: {
          itemId_uomCode: {
            itemId,
            uomCode: uom.getUomCode(),
          },
        },
        create: uomData,
        update: uomData,
      });
    }
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

  // ==================== MODEL OPERATIONS ====================

  async findModelById(modelId: number): Promise<ItemModel | null> {
    const data = await this.prisma.client.itemModel.findUnique({
      where: { id: modelId },
    });

    return data ? ItemModel.fromPersistence(data) : null;
  }

  async findModelByPublicId(publicId: string): Promise<{ model: ItemModel; itemId: number } | null> {
    const data = await this.prisma.client.itemModel.findUnique({
      where: { publicId },
    });

    if (!data) return null;

    return {
      model: ItemModel.fromPersistence(data),
      itemId: data.itemId,
    };
  }

  async findModelsByItemId(itemId: number): Promise<ItemModel[]> {
    const data = await this.prisma.client.itemModel.findMany({
      where: { itemId },
      orderBy: { id: 'desc' },
    });

    return data.map((d) => ItemModel.fromPersistence(d));
  }

  async existsModelByCode(code: string, excludeId?: number): Promise<boolean> {
    const count = await this.prisma.client.itemModel.count({
      where: {
        code,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return count > 0;
  }

  // ==================== SKU OPERATIONS ====================

  async findSkuById(skuId: number): Promise<ItemSku | null> {
    const data = await this.prisma.client.itemSKU.findUnique({
      where: { id: skuId },
    });

    return data ? ItemSku.fromPersistence(data) : null;
  }

  async findSkuByPublicId(publicId: string): Promise<{ sku: ItemSku; itemId: number } | null> {
    const data = await this.prisma.client.itemSKU.findUnique({
      where: { publicId },
    });

    if (!data) return null;

    return {
      sku: ItemSku.fromPersistence(data),
      itemId: data.itemId,
    };
  }

  async findSkusByItemId(itemId: number): Promise<ItemSku[]> {
    const data = await this.prisma.client.itemSKU.findMany({
      where: { itemId },
      orderBy: { id: 'desc' },
    });

    return data.map((d) => ItemSku.fromPersistence(d));
  }

  async findSkusByModelId(modelId: number): Promise<ItemSku[]> {
    const data = await this.prisma.client.itemSKU.findMany({
      where: { modelId },
      orderBy: { id: 'desc' },
    });

    return data.map((d) => ItemSku.fromPersistence(d));
  }

  async existsSkuByCode(code: string, excludeId?: number): Promise<boolean> {
    const count = await this.prisma.client.itemSKU.count({
      where: {
        skuCode: code,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return count > 0;
  }

  // ==================== PRIVATE HELPERS ====================

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
