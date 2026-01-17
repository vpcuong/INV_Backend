import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Gender } from '../domain/gender.entity';
import { IGenderRepository } from '../domain/gender.repository.interface';

@Injectable()
export class GenderRepository implements IGenderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(gender: Gender): Promise<Gender> {
    const data = gender.toPersistence();
    const created = await this.prisma.client.gender.create({ data });
    return Gender.fromPersistence(created);
  }

  async findAll(): Promise<Gender[]> {
    const data = await this.prisma.client.gender.findMany({
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
    return data.map(Gender.fromPersistence);
  }

  async findOne(id: number): Promise<Gender | null> {
    const data = await this.prisma.client.gender.findUnique({
      where: { id },
    });
    return data ? Gender.fromPersistence(data) : null;
  }

  async findByCode(code: string): Promise<Gender | null> {
    const data = await this.prisma.client.gender.findUnique({
      where: { code },
    });
    return data ? Gender.fromPersistence(data) : null;
  }

  async update(id: number, gender: Gender): Promise<Gender> {
    const data = gender.toPersistence();
    const updated = await this.prisma.client.gender.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return Gender.fromPersistence(updated);
  }

  async remove(id: number): Promise<Gender> {
    const deleted = await this.prisma.client.gender.delete({
      where: { id },
    });
    return Gender.fromPersistence(deleted);
  }

  async activate(id: number): Promise<Gender> {
    const updated = await this.prisma.client.gender.update({
      where: { id },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });
    return Gender.fromPersistence(updated);
  }

  async deactivate(id: number): Promise<Gender> {
    const updated = await this.prisma.client.gender.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
    return Gender.fromPersistence(updated);
  }
}
