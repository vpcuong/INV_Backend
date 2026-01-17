import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Material } from '../domain/material.entity';
import { IMaterialRepository } from '../domain/material.repository.interface';

@Injectable()
export class MaterialRepository implements IMaterialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(material: Material): Promise<Material> {
    const data = material.toPersistence();
    const created = await this.prisma.client.material.create({ data });
    return Material.fromPersistence(created);
  }

  async findAll(): Promise<Material[]> {
    const data = await this.prisma.client.material.findMany({
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
    return data.map(Material.fromPersistence);
  }

  async findOne(id: number): Promise<Material | null> {
    const data = await this.prisma.client.material.findUnique({
      where: { id },
    });
    return data ? Material.fromPersistence(data) : null;
  }

  async findByCode(code: string): Promise<Material | null> {
    const data = await this.prisma.client.material.findUnique({
      where: { code },
    });
    return data ? Material.fromPersistence(data) : null;
  }

  async update(id: number, material: Material): Promise<Material> {
    const data = material.toPersistence();
    const updated = await this.prisma.client.material.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return Material.fromPersistence(updated);
  }

  async remove(id: number): Promise<Material> {
    const deleted = await this.prisma.client.material.delete({
      where: { id },
    });
    return Material.fromPersistence(deleted);
  }

  async activate(id: number): Promise<Material> {
    const updated = await this.prisma.client.material.update({
      where: { id },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });
    return Material.fromPersistence(updated);
  }

  async deactivate(id: number): Promise<Material> {
    const updated = await this.prisma.client.material.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
    return Material.fromPersistence(updated);
  }

  async isUsedByItems(id: number): Promise<boolean> {
    const count = await this.prisma.client.item.count({
      where: { materialId: id },
    });
    return count > 0;
  }
}
