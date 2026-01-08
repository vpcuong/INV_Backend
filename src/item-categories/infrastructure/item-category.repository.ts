import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IItemCategoryRepository } from '../domain/item-category.repository.interface';
import { ItemCategory } from '../domain/item-category.entity';

@Injectable()
export class ItemCategoryRepository implements IItemCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(category: ItemCategory): Promise<ItemCategory> {
    const data = category.toPersistence();
    const created = await this.prisma.client.itemCategory.create({
      data: {
        code: data.code,
        desc: data.desc,
        isActive: data.isActive ?? true,
        isOutsourced: data.isOutsourced ?? false,
        isFinishedGood: data.isFinishedGood ?? false,
        isFabric: data.isFabric ?? false,
      },
    });
    return ItemCategory.fromPersistence(created);
  }

  async findById(id: number): Promise<ItemCategory | null> {
    const category = await this.prisma.client.itemCategory.findUnique({
      where: { id },
    });
    return category ? ItemCategory.fromPersistence(category) : null;
  }

  async findByCode(code: string): Promise<ItemCategory | null> {
    const category = await this.prisma.client.itemCategory.findUnique({
      where: { code },
    });
    return category ? ItemCategory.fromPersistence(category) : null;
  }

  async findAll(): Promise<ItemCategory[]> {
    const categories = await this.prisma.client.itemCategory.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return categories.map(cat => ItemCategory.fromPersistence(cat));
  }

  async update(category: ItemCategory): Promise<ItemCategory> {
    const data = category.toPersistence();
    const updated = await this.prisma.client.itemCategory.update({
      where: { id: data.id },
      data: {
        desc: data.desc,
        isActive: data.isActive,
        isOutsourced: data.isOutsourced,
        isFinishedGood: data.isFinishedGood,
        isFabric: data.isFabric,
        updatedAt: data.updatedAt,
      },
    });
    return ItemCategory.fromPersistence(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.client.itemCategory.delete({
      where: { id },
    });
  }
}
