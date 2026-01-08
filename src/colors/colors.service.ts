import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';

@Injectable()
export class ColorsService {
  constructor(private prisma: PrismaService) {}

  async create(createColorDto: CreateColorDto) {
    return this.prisma.client.color.create({
      data: createColorDto,
    });
  }

  async findAll() {
    return this.prisma.client.color.findMany({
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
  }

  async findOne(id: number) {
    const color = await this.prisma.client.color.findUnique({
      where: { id },
    });

    if (!color) {
      throw new NotFoundException(`Color with ID ${id} not found`);
    }

    return color;
  }

  async update(id: number, updateColorDto: UpdateColorDto) {
    await this.findOne(id);

    return this.prisma.client.color.update({
      where: { id },
      data: updateColorDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.client.color.delete({
      where: { id },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.client.color.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.client.color.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
