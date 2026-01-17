import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Theme } from '../domain/theme.entity';
import { IThemeRepository } from '../domain/theme.repository.interface';

@Injectable()
export class ThemeRepository implements IThemeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(theme: Theme): Promise<Theme> {
    const data = theme.toPersistence();
    return Theme.fromPersistence(
      await this.prisma.client.theme.create({ data })
    );
  }

  async getAll(): Promise<Theme[]> {
    const data = await this.prisma.client.theme.findMany();
    return data.map(Theme.fromPersistence);
  }

  /*************  ✨ Windsurf Command ⭐  *************/
  /*******  5d00d57b-4f87-459f-bc8e-87f7ed5c39d6  *******/
  async findById(id: number): Promise<Theme | null> {
    const data = await this.prisma.client.theme.findUnique({ where: { id } });
    return data ? Theme.fromPersistence(data) : null;
  }

  async update(id: number, data: Partial<any>): Promise<Theme> {
    const updated = await this.prisma.client.theme.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return Theme.fromPersistence(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.client.theme.delete({ where: { id } });
  }
}
