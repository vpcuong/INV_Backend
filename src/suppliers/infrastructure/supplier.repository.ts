import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Supplier } from '../domain/supplier.entity';
import { ISupplierRepository } from '../domain/supplier.repository.interface';

@Injectable()
export class SupplierRepository implements ISupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(supplier: Supplier): Promise<Supplier> {
    const data = supplier.toPersistence();
    const created = await this.prisma.client.supplier.create({ data });
    return Supplier.fromPersistence(created);
  }

  async findAll(): Promise<Supplier[]> {
    const data = await this.prisma.client.supplier.findMany({
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
    return data.map(Supplier.fromPersistence);
  }

  async findOne(id: number): Promise<Supplier | null> {
    const data = await this.prisma.client.supplier.findUnique({
      where: { id },
    });
    return data ? Supplier.fromPersistence(data) : null;
  }

  async findByCode(code: string): Promise<Supplier | null> {
    const data = await this.prisma.client.supplier.findUnique({
      where: { code },
    });
    return data ? Supplier.fromPersistence(data) : null;
  }

  async update(id: number, supplier: Supplier): Promise<Supplier> {
    const data = supplier.toPersistence();
    const updated = await this.prisma.client.supplier.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return Supplier.fromPersistence(updated);
  }

  async remove(id: number): Promise<Supplier> {
    const deleted = await this.prisma.client.supplier.delete({
      where: { id },
    });
    return Supplier.fromPersistence(deleted);
  }

  async activate(id: number): Promise<Supplier> {
    const updated = await this.prisma.client.supplier.update({
      where: { id },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });
    return Supplier.fromPersistence(updated);
  }

  async deactivate(id: number): Promise<Supplier> {
    const updated = await this.prisma.client.supplier.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
    return Supplier.fromPersistence(updated);
  }
}
