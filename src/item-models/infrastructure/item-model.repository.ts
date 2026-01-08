import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IItemModelRepository } from '../domain/item-model.repository.interface';
import { ItemModel } from '../domain/item-model.entity';

@Injectable()
export class ItemModelRepository implements IItemModelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(itemModel: ItemModel): Promise<ItemModel> {
    const data = itemModel.toPersistence();
    delete data.id;

    const created = await this.prisma.client.itemModel.create({
      data,
    });

    return ItemModel.fromPersistence(created);
  }

  async findAll(): Promise<ItemModel[]> {
    const models = await this.prisma.client.itemModel.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return models.map((model) => ItemModel.fromPersistence(model));
  }

  async findOne(id: number): Promise<ItemModel | null> {
    const model = await this.prisma.client.itemModel.findUnique({
      where: { id },
    });

    return model ? ItemModel.fromPersistence(model) : null;
  }

  async findByCode(code: string): Promise<ItemModel | null> {
    const model = await this.prisma.client.itemModel.findUnique({
      where: { code },
    });

    return model ? ItemModel.fromPersistence(model) : null;
  }

  async findByItemId(itemId: number): Promise<ItemModel[]> {
    const models = await this.prisma.client.itemModel.findMany({
      where: { itemId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return models.map((model) => ItemModel.fromPersistence(model));
  }

  async update(id: number, itemModel: ItemModel): Promise<ItemModel> {
    const data = itemModel.toPersistence();
    delete data.id;

    const updated = await this.prisma.client.itemModel.update({
      where: { id },
      data,
    });

    return ItemModel.fromPersistence(updated);
  }

  async remove(id: number): Promise<ItemModel> {
    const deleted = await this.prisma.client.itemModel.delete({
      where: { id },
    });

    return ItemModel.fromPersistence(deleted);
  }
}
