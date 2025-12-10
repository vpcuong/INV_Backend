import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';

@Injectable()
export class SizesService {
  constructor(private prisma: PrismaService) {}

  async create(createSizeDto: CreateSizeDto) {
    return this.prisma.client.size.create({
      data: createSizeDto,
    });
  }

  async findAll() {
    return this.prisma.client.size.findMany({
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
  }

  async findOne(id: number) {
    const size = await this.prisma.client.size.findUnique({
      where: { id },
    });

    if (!size) {
      throw new NotFoundException(`Size with ID ${id} not found`);
    }

    return size;
  }

  async update(id: number, updateSizeDto: UpdateSizeDto) {
    await this.findOne(id);

    return this.prisma.client.size.update({
      where: { id },
      data: updateSizeDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.client.size.delete({
      where: { id },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.client.size.update({
      where: { id },
      data: { status: true },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.client.size.update({
      where: { id },
      data: { status: false },
    });
  }
}
