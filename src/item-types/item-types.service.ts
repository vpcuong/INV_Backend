import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemTypeDto } from './dto/create-item-type.dto';
import { UpdateItemTypeDto } from './dto/update-item-type.dto';

@Injectable()
export class ItemTypesService {
  constructor(private prisma: PrismaService) {}

  async create(createItemTypeDto: CreateItemTypeDto) {
    // Check if code already exists (if provided)
    if (createItemTypeDto.code) {
      const existingItemType = await this.prisma.client.itemType.findFirst({
        where: { code: createItemTypeDto.code },
      });

      if (existingItemType) {
        throw new ConflictException(`Item type with code '${createItemTypeDto.code}' already exists`);
      }
    }

    return this.prisma.client.itemType.create({
      data: createItemTypeDto,
    });
  }

  async findAll() {
    return this.prisma.client.itemType.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const itemType = await this.prisma.client.itemType.findUnique({
      where: { id },
    });

    if (!itemType) {
      throw new NotFoundException(`Item type with ID ${id} not found`);
    }

    return itemType;
  }

  async update(id: number, updateItemTypeDto: UpdateItemTypeDto) {
    await this.findOne(id); // Check if item type exists

    // Check if code already exists (if provided and changed)
    if (updateItemTypeDto.code) {
      const existingItemType = await this.prisma.client.itemType.findFirst({
        where: {
          code: updateItemTypeDto.code,
          NOT: { id }
        },
      });

      if (existingItemType) {
        throw new ConflictException(`Item type with code '${updateItemTypeDto.code}' already exists`);
      }
    }

    return this.prisma.client.itemType.update({
      where: { id },
      data: updateItemTypeDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Check if item type exists

    return this.prisma.client.itemType.delete({
      where: { id },
    });
  }

  async activate(id: number) {
    await this.findOne(id); // Check if item type exists

    return this.prisma.client.itemType.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id); // Check if item type exists

    return this.prisma.client.itemType.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
