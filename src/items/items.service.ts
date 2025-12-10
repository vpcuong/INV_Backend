import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createItemDto: CreateItemDto) {
    return this.prisma.client.item.create({
      data: {
        name: createItemDto.name,
        model: createItemDto.model,
        costPrice: createItemDto.costPrice,
        sellingPrice: createItemDto.sellingPrice,
        lengthCm: createItemDto.lengthCm,
        widthCm: createItemDto.widthCm,
        heightCm: createItemDto.heightCm,
        weightG: createItemDto.weightG,
        notes: createItemDto.notes,
        status: createItemDto.status || 'Draft',
        hasSku: createItemDto.hasSku || false,
        isPurchasable: createItemDto.isPurchasable || false,
        isSellable: createItemDto.isSellable || false,
        isManufactured: createItemDto.isManufactured || false,
        // Relationships - use connect
        category: { connect: { id: createItemDto.categoryId } },
        itemType: { connect: { id: createItemDto.itemTypeId } },
        ...(createItemDto.materialId && { material: { connect: { id: createItemDto.materialId } } }),
        ...(createItemDto.uomId && { uom: { connect: { id: createItemDto.uomId } } }),
      },
      include: {
        category: true,
        itemType: true,
        material: true,
        uom: true,
        revisions: true,
      },
    });
  }

  async findAll() {
    return this.prisma.client.item.findMany({
      include: {
        category: true,
        itemType: true,
        material: true,
        uom: true,
        revisions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.client.item.findUnique({
      where: { id },
      include: {
        category: true,
        itemType: true,
        material: true,
        uom: true,
        revisions: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return item;
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
    await this.findOne(id);

    const updateData: any = {};

    // Scalar fields
    if (updateItemDto.name !== undefined) updateData.name = updateItemDto.name;
    if (updateItemDto.model !== undefined) updateData.model = updateItemDto.model;
    if (updateItemDto.costPrice !== undefined) updateData.costPrice = updateItemDto.costPrice;
    if (updateItemDto.sellingPrice !== undefined) updateData.sellingPrice = updateItemDto.sellingPrice;
    if (updateItemDto.lengthCm !== undefined) updateData.lengthCm = updateItemDto.lengthCm;
    if (updateItemDto.widthCm !== undefined) updateData.widthCm = updateItemDto.widthCm;
    if (updateItemDto.heightCm !== undefined) updateData.heightCm = updateItemDto.heightCm;
    if (updateItemDto.weightG !== undefined) updateData.weightG = updateItemDto.weightG;
    if (updateItemDto.notes !== undefined) updateData.notes = updateItemDto.notes;
    if (updateItemDto.status !== undefined) updateData.status = updateItemDto.status;
    if (updateItemDto.hasSku !== undefined) updateData.hasSku = updateItemDto.hasSku;
    if (updateItemDto.isPurchasable !== undefined) updateData.isPurchasable = updateItemDto.isPurchasable;
    if (updateItemDto.isSellable !== undefined) updateData.isSellable = updateItemDto.isSellable;
    if (updateItemDto.isManufactured !== undefined) updateData.isManufactured = updateItemDto.isManufactured;

    // Relationships
    if (updateItemDto.categoryId !== undefined) {
      updateData.category = { connect: { id: updateItemDto.categoryId } };
    }
    if (updateItemDto.itemTypeId !== undefined) {
      updateData.itemType = { connect: { id: updateItemDto.itemTypeId } };
    }
    if (updateItemDto.materialId !== undefined) {
      updateData.material = { connect: { id: updateItemDto.materialId } };
    }
    if (updateItemDto.uomId !== undefined) {
      updateData.uom = { connect: { id: updateItemDto.uomId } };
    }

    return this.prisma.client.item.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        itemType: true,
        material: true,
        uom: true,
        revisions: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.client.item.delete({
      where: { id },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.client.item.update({
      where: { id },
      data: { status: 'Active' },
      include: {
        category: true,
        itemType: true,
        material: true,
        uom: true,
        revisions: true,
      },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.client.item.update({
      where: { id },
      data: { status: 'Inactive' },
      include: {
        category: true,
        itemType: true,
        material: true,
        uom: true,
        revisions: true,
      },
    });
  }
}
