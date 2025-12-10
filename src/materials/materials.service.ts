import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  async create(createMaterialDto: CreateMaterialDto) {
    // Check if code already exists
    const existing = await this.prisma.client.material.findUnique({
      where: { code: createMaterialDto.code },
    });

    if (existing) {
      throw new ConflictException(`Material with code ${createMaterialDto.code} already exists`);
    }

    return this.prisma.client.material.create({
      data: {
        code: createMaterialDto.code,
        desc: createMaterialDto.desc,
        status: createMaterialDto.status ?? true,
        sortOrder: createMaterialDto.sortOrder,
        createdBy: createMaterialDto.createdBy,
      },
    });
  }

  async findAll() {
    return this.prisma.client.material.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { code: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    const material = await this.prisma.client.material.findUnique({
      where: { id },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }

    return material;
  }

  async update(id: number, updateMaterialDto: UpdateMaterialDto) {
    await this.findOne(id); // Check if material exists

    // If updating code, check for conflicts
    if (updateMaterialDto.code) {
      const existing = await this.prisma.client.material.findUnique({
        where: { code: updateMaterialDto.code },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(`Material with code ${updateMaterialDto.code} already exists`);
      }
    }

    return this.prisma.client.material.update({
      where: { id },
      data: {
        ...updateMaterialDto,
      },
    });
  }

  async activate(id: number) {
    await this.findOne(id); // Check if material exists

    return this.prisma.client.material.update({
      where: { id },
      data: { status: true },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id); // Check if material exists

    return this.prisma.client.material.update({
      where: { id },
      data: { status: false },
    });
  }

  async remove(id: number) {
    const material = await this.findOne(id);

    // Check if material is being used by any item
    if (material.item && material.item.length > 0) {
      throw new ConflictException(
        `Cannot delete material. It is being used by ${material.item.length} item(s)`
      );
    }

    return this.prisma.client.material.delete({
      where: { id },
    });
  }
}
