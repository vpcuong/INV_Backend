import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IItemSkuRepository } from '../domain/item-sku.repository.interface';
import { ItemSku } from '../domain/item-sku.entity';

@Injectable()
export class ItemSkuRepository implements IItemSkuRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(itemSku: ItemSku): Promise<ItemSku> {
    const data = itemSku.toPersistence();

    const created = await this.prisma.client.itemSKU.create({
      data,
    });

    return ItemSku.fromPersistence(created);
  }

  async findAll(): Promise<ItemSku[]> {
    const skus = await this.prisma.client.itemSKU.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return skus.map((sku) => ItemSku.fromPersistence(sku));
  }

  async findOne(id: number): Promise<ItemSku | null> {
    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { id },
    });

    return sku ? ItemSku.fromPersistence(sku) : null;
  }

  async findByItemId(itemId: number): Promise<ItemSku[]> {
    const skus = await this.prisma.client.itemSKU.findMany({
      where: { itemId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return skus.map((sku) => ItemSku.fromPersistence(sku));
  }

  async findByModelId(modelId: number): Promise<ItemSku[]> {
    const skus = await this.prisma.client.itemSKU.findMany({
      where: { modelId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return skus.map((sku) => ItemSku.fromPersistence(sku));
  }

  async findBySkuCode(skuCode: string): Promise<ItemSku | null> {
    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { skuCode },
    });

    return sku ? ItemSku.fromPersistence(sku) : null;
  }

  async update(id: number, itemSku: ItemSku): Promise<ItemSku> {
    const data = itemSku.toPersistence();
    delete data.id;

    const updated = await this.prisma.client.itemSKU.update({
      where: { id },
      data,
    });

    return ItemSku.fromPersistence(updated);
  }

  async remove(id: number): Promise<ItemSku> {
    const deleted = await this.prisma.client.itemSKU.delete({
      where: { id },
    });

    return ItemSku.fromPersistence(deleted);
  }
}
