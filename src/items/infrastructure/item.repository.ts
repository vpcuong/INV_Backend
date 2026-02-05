import { Injectable } from '@nestjs/common';
import { ulid } from 'ulid';
import { PrismaService } from '../../prisma/prisma.service';
import { Item } from '../domain/aggregates/item.aggregate';
import { ItemModel } from '../domain/entities/item-model.entity';
import { ItemSku } from '../domain/entities/item-sku.entity';
import { ItemUom } from '../domain/entities/item-uom.entity';
import { RowMode } from '../domain/enums/row-mode.enum';
import {
  IItemRepository,
  ItemFilters,
} from '../domain/item.repository.interface';

import { ItemCategoryType } from '../../item-categories/enums/item-category-type.enum';

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

      let savedItem = undefined;
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

      // 2. Sync children using rowMode (only dirty rows)
      await this.syncModelsByRowMode(tx, savedItemId, item.getModels());
      await this.syncSkusByRowMode(tx, savedItemId, item.getSkus());
      await this.syncUomsByRowMode(tx, savedItemId, item.getItemUOMs());

      // 3. Return the complete aggregate
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

  private async syncModelsByRowMode(
    tx: any,
    itemId: number,
    models: ItemModel[],
  ): Promise<void> {
    const newModels = models.filter((m) => m.getRowMode() === RowMode.NEW);
    const updatedModels = models.filter((m) => m.getRowMode() === RowMode.UPDATED);
    const deletedModels = models.filter((m) => m.getRowMode() === RowMode.DELETED);

    // Delete
    const deletedIds = deletedModels.map((m) => m.getId()).filter(Boolean) as number[];
    if (deletedIds.length > 0) {
      await tx.itemModel.deleteMany({
        where: { id: { in: deletedIds } },
      });
    }

    // Create new
    for (const model of newModels) {
      const modelData = model.toPersistence();
      delete modelData.id;
      modelData.itemId = itemId;
      modelData.publicId = modelData.publicId || ulid();
      await tx.itemModel.create({ data: modelData });
    }

    // Update existing
    for (const model of updatedModels) {
      const modelData = model.toPersistence();
      delete modelData.id;
      delete modelData.publicId;
      modelData.itemId = itemId;
      await tx.itemModel.update({
        where: { id: model.getId() },
        data: modelData,
      });
    }
  }

  private async syncSkusByRowMode(
    tx: any,
    itemId: number,
    skus: ItemSku[],
  ): Promise<void> {
    const newSkus = skus.filter((s) => s.getRowMode() === RowMode.NEW);
    const updatedSkus = skus.filter((s) => s.getRowMode() === RowMode.UPDATED);
    const deletedSkus = skus.filter((s) => s.getRowMode() === RowMode.DELETED);

    // Delete
    const deletedIds = deletedSkus.map((s) => s.getId()).filter(Boolean) as number[];
    if (deletedIds.length > 0) {
      await tx.itemSKU.deleteMany({
        where: { id: { in: deletedIds } },
      });
    }

    // Create new
    for (const sku of newSkus) {
      const skuData = sku.toPersistence();
      delete skuData.id;
      delete skuData.skuUoms;
      skuData.itemId = itemId;
      skuData.publicId = skuData.publicId || ulid();
      await tx.itemSKU.create({ data: skuData });
    }

    // Update existing
    for (const sku of updatedSkus) {
      const skuData = sku.toPersistence();
      delete skuData.id;
      delete skuData.publicId;
      delete skuData.skuUoms;
      skuData.itemId = itemId;
      await tx.itemSKU.update({
        where: { id: sku.getId() },
        data: skuData,
      });
    }
  }

  private async syncUomsByRowMode(
    tx: any,
    itemId: number,
    uoms: ItemUom[],
  ): Promise<void> {
    const newUoms = uoms.filter((u) => u.getRowMode() === RowMode.NEW);
    const updatedUoms = uoms.filter((u) => u.getRowMode() === RowMode.UPDATED);
    const deletedUoms = uoms.filter((u) => u.getRowMode() === RowMode.DELETED);

    // Delete
    const deletedCodes = deletedUoms.map((u) => u.getUomCode());
    if (deletedCodes.length > 0) {
      await tx.itemUOM.deleteMany({
        where: {
          itemId,
          uomCode: { in: deletedCodes },
        },
      });
    }

    // Create new
    for (const uom of newUoms) {
      const uomData = uom.toPersistence();
      uomData.itemId = itemId;
      await tx.itemUOM.create({ data: uomData });
    }

    // Update existing
    for (const uom of updatedUoms) {
      const uomData = uom.toPersistence();
      uomData.itemId = itemId;
      await tx.itemUOM.update({
        where: {
          itemId_uomCode: {
            itemId,
            uomCode: uom.getUomCode(),
          },
        },
        data: uomData,
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

  async isFabricItem(itemId: number): Promise<boolean> {
    const data = await this.prisma.client.item.findUnique({
      where: { id: itemId },
      include: {
        category: true,
      }
    });

    if(!data) return false;

    if(data.category.type !== ItemCategoryType.FABRIC) return false;
    return true;
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

  async updateSkuById(skuId: number, data: Record<string, any>): Promise<ItemSku> {
    // Only allow safe, updatable fields - exclude identity, relation, and auto-managed fields
    const allowedFields = [
      'colorId', 'genderId', 'sizeId', 'supplierId', 'customerId',
      'fabricSKUId', 'pattern', 'lengthCm', 'widthCm', 'heightCm', 'weightG',
      'desc', 'status', 'costPrice', 'sellingPrice', 'uomCode',
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const updated = await this.prisma.client.itemSKU.update({
      where: { id: skuId },
      data: updateData,
    });
    return ItemSku.fromPersistence(updated);
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

  async isMappedSku(skuId: number): Promise<boolean> {
    const count = await this.prisma.client.itemSKU.count({
      where: {
        fabricSKUId: skuId
      },
    });
    return count > 0;
  }

  async getFabricsSku(colorId: number, materialId: number){
    const data = this.prisma.client.itemSKU.findMany({
      where: {
        colorId: colorId,
        item: {
          materialId
        }
      },
      include: {
        color: true,
        item: true
      }
    })

    return data;
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
