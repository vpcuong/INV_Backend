import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUomConversionDto } from './dto/create-uom-conversion.dto';
import { UpdateUomConversionDto } from './dto/update-uom-conversion.dto';

@Injectable()
export class UomConversionsService {
  constructor(private prisma: PrismaService) {}

  async create(createUomConversionDto: CreateUomConversionDto) {
    // Check if both UOMs exist
    const [fromUOM, toUOM] = await Promise.all([
      this.prisma.client.uOM.findUnique({
        where: { id: createUomConversionDto.fromUOMId },
      }),
      this.prisma.client.uOM.findUnique({
        where: { id: createUomConversionDto.toUOMId },
      }),
    ]);

    if (!fromUOM) {
      throw new NotFoundException(`From UOM with ID ${createUomConversionDto.fromUOMId} not found`);
    }

    if (!toUOM) {
      throw new NotFoundException(`To UOM with ID ${createUomConversionDto.toUOMId} not found`);
    }

    // Check if conversion already exists
    const existingConversion = await this.prisma.client.uOMConversion.findFirst({
      where: {
        fromUOMId: createUomConversionDto.fromUOMId,
        toUOMId: createUomConversionDto.toUOMId,
      },
    });

    if (existingConversion) {
      throw new ConflictException(
        `Conversion from ${fromUOM.code} to ${toUOM.code} already exists`,
      );
    }

    return this.prisma.client.uOMConversion.create({
      data: createUomConversionDto,
      include: {
        fromUOM: true,
        toUOM: true,
      },
    });
  }

  async findAll() {
    return this.prisma.client.uOMConversion.findMany({
      include: {
        fromUOM: true,
        toUOM: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const conversion = await this.prisma.client.uOMConversion.findUnique({
      where: { id },
      include: {
        fromUOM: true,
        toUOM: true,
      },
    });

    if (!conversion) {
      throw new NotFoundException(`UOM conversion with ID ${id} not found`);
    }

    return conversion;
  }

  async update(id: number, updateUomConversionDto: UpdateUomConversionDto) {
    await this.findOne(id);

    // Check if UOMs exist (if being changed)
    if (updateUomConversionDto.fromUOMId) {
      const fromUOM = await this.prisma.client.uOM.findUnique({
        where: { id: updateUomConversionDto.fromUOMId },
      });

      if (!fromUOM) {
        throw new NotFoundException(`From UOM with ID ${updateUomConversionDto.fromUOMId} not found`);
      }
    }

    if (updateUomConversionDto.toUOMId) {
      const toUOM = await this.prisma.client.uOM.findUnique({
        where: { id: updateUomConversionDto.toUOMId },
      });

      if (!toUOM) {
        throw new NotFoundException(`To UOM with ID ${updateUomConversionDto.toUOMId} not found`);
      }
    }

    return this.prisma.client.uOMConversion.update({
      where: { id },
      data: updateUomConversionDto,
      include: {
        fromUOM: true,
        toUOM: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.client.uOMConversion.delete({
      where: { id },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.client.uOMConversion.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.client.uOMConversion.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
