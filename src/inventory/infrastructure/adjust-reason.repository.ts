import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IAdjustReasonRepository } from '../domain/adjust-reason.repository.interface';
import { AdjustReason } from '../domain/adjust-reason.entity';

@Injectable()
export class AdjustReasonRepository implements IAdjustReasonRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<AdjustReason[]> {
    const data = await this.prisma.client.inventoryAdjustReason.findMany({
      orderBy: { code: 'asc' },
    });
    return data.map(d => AdjustReason.fromPersistence(d));
  }

  async findActive(): Promise<AdjustReason[]> {
    const data = await this.prisma.client.inventoryAdjustReason.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
    return data.map(d => AdjustReason.fromPersistence(d));
  }

  async findById(id: number): Promise<AdjustReason | null> {
    const data = await this.prisma.client.inventoryAdjustReason.findUnique({
      where: { id },
    });
    return data ? AdjustReason.fromPersistence(data) : null;
  }

  async findByCode(code: string): Promise<AdjustReason | null> {
    const data = await this.prisma.client.inventoryAdjustReason.findUnique({
      where: { code },
    });
    return data ? AdjustReason.fromPersistence(data) : null;
  }

  async save(reason: AdjustReason): Promise<AdjustReason> {
    const { id, ...persistData } = reason.toPersistence();
    const created = await this.prisma.client.inventoryAdjustReason.create({
      data: persistData,
    });
    return AdjustReason.fromPersistence(created);
  }

  async update(id: number, reason: AdjustReason): Promise<AdjustReason> {
    const { id: _, ...persistData } = reason.toPersistence();
    const updated = await this.prisma.client.inventoryAdjustReason.update({
      where: { id },
      data: persistData,
    });
    return AdjustReason.fromPersistence(updated);
  }

  async remove(id: number): Promise<void> {
    await this.prisma.client.inventoryAdjustReason.delete({
      where: { id },
    });
  }
}
