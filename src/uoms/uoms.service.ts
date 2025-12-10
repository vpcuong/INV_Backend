import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUomDto } from './dto/create-uom.dto';
import { UpdateUomDto } from './dto/update-uom.dto';

@Injectable()
export class UomsService {
  constructor(private prisma: PrismaService) {}

  async create(createUomDto: CreateUomDto) {
    // Check if code already exists
    const existingUom = await this.prisma.client.uOM.findUnique({
      where: { code: createUomDto.code },
    });

    if (existingUom) {
      throw new ConflictException(`UOM with code '${createUomDto.code}' already exists`);
    }

    // Check if UOM class exists
    const uomClass = await this.prisma.client.uOMClass.findUnique({
      where: { id: createUomDto.classId },
    });

    if (!uomClass) {
      throw new NotFoundException(`UOM class with ID ${createUomDto.classId} not found`);
    }

    return this.prisma.client.uOM.create({
      data: createUomDto,
      include: {
        uomClass: true,
      },
    });
  }

  async findAll() {
    return this.prisma.client.uOM.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        uomClass: true,
      },
    });
  }

  async findOne(id: number) {
    const uom = await this.prisma.client.uOM.findUnique({
      where: { id },
      include: {
        uomClass: true,
        fromConversions: {
          include: {
            toUOM: true,
          },
        },
        toConversions: {
          include: {
            fromUOM: true,
          },
        },
      },
    });

    if (!uom) {
      throw new NotFoundException(`UOM with ID ${id} not found`);
    }

    return uom;
  }

  async update(id: number, updateUomDto: UpdateUomDto) {
    await this.findOne(id);

    // Check if code already exists (if being changed)
    if (updateUomDto.code) {
      const existingUom = await this.prisma.client.uOM.findFirst({
        where: {
          code: updateUomDto.code,
          NOT: { id },
        },
      });

      if (existingUom) {
        throw new ConflictException(`UOM with code '${updateUomDto.code}' already exists`);
      }
    }

    // Check if UOM class exists (if being changed)
    if (updateUomDto.classId) {
      const uomClass = await this.prisma.client.uOMClass.findUnique({
        where: { id: updateUomDto.classId },
      });

      if (!uomClass) {
        throw new NotFoundException(`UOM class with ID ${updateUomDto.classId} not found`);
      }
    }

    return this.prisma.client.uOM.update({
      where: { id },
      data: updateUomDto,
      include: {
        uomClass: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // Check if UOM has conversions or is used by items
    const uom = await this.prisma.client.uOM.findUnique({
      where: { id },
      include: {
        fromConversions: true,
        toConversions: true,
        items: true,
      },
    });

    if (uom && (uom.fromConversions.length > 0 || uom.toConversions.length > 0)) {
      throw new ConflictException(`Cannot delete UOM that has conversions`);
    }

    if (uom && uom.items.length > 0) {
      throw new ConflictException(`Cannot delete UOM that is used by items`);
    }

    return this.prisma.client.uOM.delete({
      where: { id },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.client.uOM.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.client.uOM.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
