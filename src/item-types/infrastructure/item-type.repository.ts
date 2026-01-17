import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ItemType } from '../domain/item-type.entity';
import { IItemTypeRepository } from '../domain/item-type.repository.interface';

@Injectable()
export class ItemTypeRepository implements IItemTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(itemType: ItemType): Promise<ItemType> {
    const data = itemType.toPersistence();
    const created = await this.prisma.client.itemType.create({ data });
    return ItemType.fromPersistence(created);
  }

  async findAll(): Promise<ItemType[]> {
    const data = await this.prisma.client.itemType.findMany({
      orderBy: { code: 'asc' },
    });
    return data.map(ItemType.fromPersistence);
  }

  async findOne(id: number): Promise<ItemType | null> {
    const data = await this.prisma.client.itemType.findUnique({
      where: { id },
    });
    return data ? ItemType.fromPersistence(data) : null;
  }

  async findByCode(code: string): Promise<ItemType | null> {
    const data = await this.prisma.client.itemType.findFirst({
      where: { code },
    });
    return data ? ItemType.fromPersistence(data) : null;
  }

  async update(id: number, itemType: ItemType): Promise<ItemType> {
    const data = itemType.toPersistence();
    const updated = await this.prisma.client.itemType.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return ItemType.fromPersistence(updated);
  }

  async remove(id: number): Promise<ItemType> {
    const deleted = await this.prisma.client.itemType.delete({
      where: { id },
    });
    return ItemType.fromPersistence(deleted);
  }

  async activate(id: number): Promise<ItemType> {
    const updated = await this.prisma.client.itemType.update({
      where: { id },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });
    return ItemType.fromPersistence(updated);
  }

  async deactivate(id: number): Promise<ItemType> {
    const updated = await this.prisma.client.itemType.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
    return ItemType.fromPersistence(updated);
  }
}
