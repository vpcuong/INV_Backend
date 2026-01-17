import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Size } from '../domain/size.entity';
import { ISizeRepository } from '../domain/size.repository.interface';

@Injectable()
export class SizeRepository implements ISizeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(size: Size): Promise<Size> {
    const data = size.toPersistence();
    const created = await this.prisma.client.size.create({ data });
    return Size.fromPersistence(created);
  }

  async findAll(): Promise<Size[]> {
    const data = await this.prisma.client.size.findMany({
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
    return data.map(Size.fromPersistence);
  }

  async findOne(id: number): Promise<Size | null> {
    const data = await this.prisma.client.size.findUnique({
      where: { id },
    });
    return data ? Size.fromPersistence(data) : null;
  }

  async findByCode(code: string): Promise<Size | null> {
    const data = await this.prisma.client.size.findUnique({
      where: { code },
    });
    return data ? Size.fromPersistence(data) : null;
  }

  async update(id: number, size: Size): Promise<Size> {
    const data = size.toPersistence();
    const updated = await this.prisma.client.size.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return Size.fromPersistence(updated);
  }

  async remove(id: number): Promise<Size> {
    const deleted = await this.prisma.client.size.delete({
      where: { id },
    });
    return Size.fromPersistence(deleted);
  }

  async activate(id: number): Promise<Size> {
    const updated = await this.prisma.client.size.update({
      where: { id },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });
    return Size.fromPersistence(updated);
  }

  async deactivate(id: number): Promise<Size> {
    const updated = await this.prisma.client.size.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
    return Size.fromPersistence(updated);
  }
}
