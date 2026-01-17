import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
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
      throw new ConflictException(
        `UOM with code '${createUomDto.code}' already exists`
      );
    }

    // Check if UOM class exists
    const uomClass = await this.prisma.client.uOMClass.findUnique({
      where: { code: createUomDto.classCode },
    });

    if (!uomClass) {
      throw new NotFoundException(
        `UOM class with code '${createUomDto.classCode}' not found`
      );
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

  async findOne(code: string) {
    const uom = await this.prisma.client.uOM.findUnique({
      where: { code },
      include: {
        uomClass: true,
        uomConvs: {
          include: {
            uomClass: true,
          },
        },
      },
    });

    if (!uom) {
      throw new NotFoundException(`UOM with code '${code}' not found`);
    }

    return uom;
  }

  async update(code: string, updateUomDto: UpdateUomDto) {
    await this.findOne(code);

    // Check if UOM class exists (if being changed)
    if (updateUomDto.classCode) {
      const uomClass = await this.prisma.client.uOMClass.findUnique({
        where: { code: updateUomDto.classCode },
      });

      if (!uomClass) {
        throw new NotFoundException(
          `UOM class with code '${updateUomDto.classCode}' not found`
        );
      }
    }

    return this.prisma.client.uOM.update({
      where: { code },
      data: updateUomDto,
      include: {
        uomClass: true,
      },
    });
  }

  async remove(code: string) {
    await this.findOne(code);

    // Check if UOM has conversions or is used by items
    const uom = await this.prisma.client.uOM.findUnique({
      where: { code },
      include: {
        uomConvs: true,
        items: true,
      },
    });

    if (uom && uom.uomConvs.length > 0) {
      throw new ConflictException(`Cannot delete UOM that has conversions`);
    }

    if (uom && uom.items.length > 0) {
      throw new ConflictException(`Cannot delete UOM that is used by items`);
    }

    return this.prisma.client.uOM.delete({
      where: { code },
    });
  }

  async activate(code: string) {
    await this.findOne(code);

    return this.prisma.client.uOM.update({
      where: { code },
      data: { isActive: true },
    });
  }

  async deactivate(code: string) {
    await this.findOne(code);

    return this.prisma.client.uOM.update({
      where: { code },
      data: { isActive: false },
    });
  }
}
