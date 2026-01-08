import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemStatus } from './domain/item-status.enum';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  private readonly commonInclude = {
    category: true,
    itemType: true,
    material: true,
    uom: true,
    models: true,
  };

  async create(createItemDto: CreateItemDto) {
    return this.prisma.client.item.create({
      data: {
        code: createItemDto.code,
        purchasingPrice: createItemDto.purchasingPrice,
        sellingPrice: createItemDto.sellingPrice,
        lengthCm: createItemDto.lengthCm,
        widthCm: createItemDto.widthCm,
        heightCm: createItemDto.heightCm,
        weightG: createItemDto.weightG,
        desc: createItemDto.desc,
        status: createItemDto.status || ItemStatus.ACTIVE,
        isPurchasable: createItemDto.isPurchasable || false,
        isSellable: createItemDto.isSellable || false,
        isManufactured: createItemDto.isManufactured || false,
        category: { connect: { id: createItemDto.categoryId } },
        itemType: { connect: { id: createItemDto.itemTypeId } },
        ...(createItemDto.materialId && { material: { connect: { id: createItemDto.materialId } } }),
        ...(createItemDto.uomCode && { uom: { connect: { code: createItemDto.uomCode } } }),
      },
      include: this.commonInclude,
    });
  }

  async findAll() {
    return this.prisma.client.item.findMany({
      include: this.commonInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.client.item.findUnique({
      where: { id },
      include: this.commonInclude,
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return item;
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
    const updateData: any = {};

    const scalarFields = [
      'code', 'purchasingPrice', 'sellingPrice', 'lengthCm', 
      'widthCm', 'heightCm', 'weightG', 'desc', 'status', 
      'isPurchasable', 'isSellable', 'isManufactured'
    ];

    scalarFields.forEach(field => {
      if ((updateItemDto as any)[field] !== undefined) {
        updateData[field] = (updateItemDto as any)[field];
      }
    });

    if (updateItemDto.categoryId !== undefined) {
      updateData.category = { connect: { id: updateItemDto.categoryId } };
    }
    if (updateItemDto.itemTypeId !== undefined) {
      updateData.itemType = { connect: { id: updateItemDto.itemTypeId } };
    }
    if (updateItemDto.materialId !== undefined) {
      updateData.material = { connect: { id: updateItemDto.materialId } };
    }
    if (updateItemDto.uomCode !== undefined) {
      updateData.uom = { connect: { code: updateItemDto.uomCode } };
    }

    try {
      return await this.prisma.client.item.update({
        where: { id },
        data: updateData,
        include: this.commonInclude,
      });
    } catch (error: any) {
      // Prisma error code for record not found
      if (error.code === 'P2025') {
        throw new NotFoundException(`Item with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.client.item.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Item with ID ${id} not found`);
      }
      throw error;
    }
  }

  private async updateStatus(id: number, status: ItemStatus) {
    try {
      return await this.prisma.client.item.update({
        where: { id },
        data: { status },
        include: this.commonInclude,
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Item with ID ${id} not found`);
      }
      throw error;
    }
  }

  async activate(id: number) {
    return this.updateStatus(id, ItemStatus.ACTIVE);
  }

  async deactivate(id: number) {
    return this.updateStatus(id, ItemStatus.INACTIVE);
  }

  async draft(id: number) {
    return this.updateStatus(id, ItemStatus.DRAFT);
  }

  async search(searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    const trimmedSearch = searchTerm.trim();

    return this.prisma.client.item.findMany({
      where: {
        OR: [
          {
            code: {
              contains: trimmedSearch,
              mode: 'insensitive',
            },
          },
          {
            desc: {
              contains: trimmedSearch,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
