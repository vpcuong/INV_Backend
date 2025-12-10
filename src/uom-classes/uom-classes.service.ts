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

    return this.prisma.client.uOMClass.create({
      data: createUomClassDto,
    });
  }

  async findAll() {
    return this.prisma.client.uOMClass.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        uoms: true,
      },
    });
  }

  async findOne(id: number) {
    const uomClass = await this.prisma.client.uOMClass.findUnique({
      where: { id },
      include: {
        uoms: true,
      },
    });

    if (!uomClass) {
      throw new NotFoundException(`UOM class with ID ${id} not found`);
    }

    return uomClass;
  }

  async update(id: number, updateUomClassDto: UpdateUomClassDto) {
    await this.findOne(id); // Check if exists

    // Check if code already exists (if code is being changed)
    if (updateUomClassDto.code) {
      const existingUomClass = await this.prisma.client.uOMClass.findFirst({
        where: {
          code: updateUomClassDto.code,
          NOT: { id },
        },
      });

      if (existingUomClass) {
        throw new ConflictException(`UOM class with code '${updateUomClassDto.code}' already exists`);
      }
    }

    return this.prisma.client.uOMClass.update({
      where: { id },
      data: updateUomClassDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Check if exists

    // Check if UOM class has associated UOMs
    const uomClass = await this.prisma.client.uOMClass.findUnique({
      where: { id },
      include: {
        uoms: true,
      },
    });

    if (uomClass && uomClass.uoms.length > 0) {
      throw new ConflictException(`Cannot delete UOM class that has associated UOMs`);
    }

    return this.prisma.client.uOMClass.delete({
      where: { id },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.client.uOMClass.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.client.uOMClass.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
