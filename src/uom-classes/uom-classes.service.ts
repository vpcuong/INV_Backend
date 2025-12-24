import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUomClassDto } from './dto/create-uom-class.dto';
import { UpdateUomClassDto } from './dto/update-uom-class.dto';

@Injectable()
export class UomClassesService {
  constructor(private prisma: PrismaService) {}

  async create(createUomClassDto: CreateUomClassDto) {
    // Check if code already exists
    const existingUomClass = await this.prisma.client.uOMClass.findUnique({
      where: { code: createUomClassDto.code },
    });

    if (existingUomClass) {
      throw new ConflictException(`UOM class with code '${createUomClassDto.code}' already exists`);
    }

    // Validate baseUOMCode if provided
    if (createUomClassDto.baseUOMCode) {
      const baseUOM = await this.prisma.client.uOM.findUnique({
        where: { code: createUomClassDto.baseUOMCode },
      });

      if (!baseUOM) {
        throw new NotFoundException(`Base UOM with code '${createUomClassDto.baseUOMCode}' not found`);
      }
    }

    return this.prisma.client.uOMClass.create({
      data: createUomClassDto,
      include: {
        baseUOM: true,
      },
    });
  }

  async findAll() {
    return this.prisma.client.uOMClass.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        baseUOM: true,
        uoms: true,
      },
    });
  }

  async findOne(code: string) {
    const uomClass = await this.prisma.client.uOMClass.findUnique({
      where: { code },
      include: {
        baseUOM: true,
        uoms: true,
      },
    });

    if (!uomClass) {
      throw new NotFoundException(`UOM class with code '${code}' not found`);
    }

    return uomClass;
  }

  async update(code: string, updateUomClassDto: UpdateUomClassDto) {
    await this.findOne(code); // Check if exists

    // Validate baseUOMCode if provided
    if (updateUomClassDto.baseUOMCode) {
      const baseUOM = await this.prisma.client.uOM.findUnique({
        where: { code: updateUomClassDto.baseUOMCode },
      });

      if (!baseUOM) {
        throw new NotFoundException(`Base UOM with code '${updateUomClassDto.baseUOMCode}' not found`);
      }
    }

    return this.prisma.client.uOMClass.update({
      where: { code },
      data: updateUomClassDto,
      include: {
        baseUOM: true,
      },
    });
  }

  async remove(code: string) {
    await this.findOne(code); // Check if exists

    // Check if UOM class has associated UOMs
    const uomClass = await this.prisma.client.uOMClass.findUnique({
      where: { code },
      include: {
        baseUOM: true,
        uoms: true,
      },
    });

    if (uomClass && uomClass.uoms.length > 0) {
      throw new ConflictException(`Cannot delete UOM class that has associated UOMs`);
    }

    return this.prisma.client.uOMClass.delete({
      where: { code },
    });
  }

  async activate(code: string) {
    await this.findOne(code);

    return this.prisma.client.uOMClass.update({
      where: { code },
      data: { isActive: true },
    });
  }

  async deactivate(code: string) {
    await this.findOne(code);

    return this.prisma.client.uOMClass.update({
      where: { code },
      data: { isActive: false },
    });
  }
}
