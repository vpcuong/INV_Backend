import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUomConversionDto } from './dto/create-uom-conversion.dto';
import { UpdateUomConversionDto } from './dto/update-uom-conversion.dto';

@Injectable()
export class UomConversionsService {
  constructor(private prisma: PrismaService) {}

  async create(createUomConversionDto: CreateUomConversionDto) {
    // Check if both UOMs exist
    const [classUOMCode, uomCode] = await Promise.all([
      this.prisma.client.uOMClass.findUnique({
        where: { 
          code: createUomConversionDto.uomClassCode,
        },
      }),
      this.prisma.client.uOM.findUnique({
        where: { 
          code: createUomConversionDto.uomCode
        },
      }),
    ]);

    if (!classUOMCode) {
      throw new NotFoundException(`From UOM Class with Code ${createUomConversionDto.uomClassCode} not found`);
    }

    if (!uomCode) {
      throw new NotFoundException(`To UOM with Code ${createUomConversionDto.uomCode} not found`);
    }

    // Check if conversion already exists
    const existingConversion = await this.prisma.client.uOMConversion.findFirst({
      where: {
        uomClassCode: createUomConversionDto.uomClassCode,
        uomCode: createUomConversionDto.uomCode,
      },
    });

    if (existingConversion) {
      throw new ConflictException(
        `Conversion UOM Class ${classUOMCode}, UOM Code ${uomCode} already exists`,
      );
    }

    return this.prisma.client.uOMConversion.create({
      data: {
        uomClassCode: createUomConversionDto.uomClassCode,
        uomCode: createUomConversionDto.uomCode,
        toBaseFactor: createUomConversionDto.toBaseFactor,
      },
      include: {
        uomClass: true,
        uom: true,
      },
    });
  }

  async findAll() {
    return this.prisma.client.uOMConversion.findMany({
      include: {
        uomClass: true,
        uom: true,
      },
      orderBy: {
        uomClassCode: 'asc',
      },
    });
  }

  async findOne(uomClassCode: string, uomCodeString: string) {
    const conversion = await this.prisma.client.uOMConversion.findUnique({
      where: { 
        uomClassCode_uomCode: {
          uomClassCode,
          uomCode: uomCodeString
        }
      },
      include: {
        uomClass: true,
        uom: true,
      },
    });

    if (!conversion) {
      throw new NotFoundException(`UOM conversion for class '${uomClassCode}' and UOM '${uomCodeString}' not found`);
    }

    return conversion;
  }

  async update(uomClassCode: string, uomCode: string, updateUomConversionDto: UpdateUomConversionDto) {
    await this.findOne(uomClassCode, uomCode);

    // Check if UOMs exist (if being changed)
    if (updateUomConversionDto.uomCode) {
      const uomCode = await this.prisma.client.uOM.findUnique({
        where: { code: updateUomConversionDto.uomCode },
      });

      if (!uomCode) {
        throw new NotFoundException(`UOM with code: ${updateUomConversionDto.uomCode} not found`);
      }
    }

    const updateData: any = {};
    if (updateUomConversionDto.uomClassCode !== undefined) {
      updateData.uomClassCode = updateUomConversionDto.uomClassCode;
    }
    if (updateUomConversionDto.uomCode !== undefined) {
      updateData.uomCode = updateUomConversionDto.uomCode;
    }
    if (updateUomConversionDto.toBaseFactor !== undefined) {
      updateData.toBaseFactor = updateUomConversionDto.toBaseFactor;
    }

    return this.prisma.client.uOMConversion.update({
      where: {
        uomClassCode_uomCode: {
          uomClassCode,
          uomCode
        }
       },
      data: updateData,
      include: {
        uomClass: true,
        uom: true,
      },
    });
  }

  async remove(uomClassCode: string, uomCode: string) {
    const conversion = await this.findOne(uomClassCode, uomCode);

    if (!conversion) {
      throw new NotFoundException(`UOM conversion with ID ${uomClassCode} not found`);
    }

    return this.prisma.client.uOMConversion.delete({
      where: { 
        uomClassCode_uomCode: {
          uomClassCode,
          uomCode
       }
      },
    });
  }

  async activate(uomClassCode: string, uomCode: string) {
    const conversion = await this.findOne(uomClassCode, uomCode);

    if (!conversion) {
      throw new NotFoundException(`UOM conversion with ID ${uomClassCode} not found`);
    }

    return this.prisma.client.uOMConversion.update({
      where: { 
        uomClassCode_uomCode: {
          uomClassCode,
          uomCode
        }
      },
      data: { isActive: true }
    });
  }

  async deactivate(uomClassCode: string, uomCode: string) {
    const conversion = await this.findOne(uomClassCode, uomCode);

    if (!conversion) {
      throw new NotFoundException(`UOM conversion with ID ${uomClassCode} not found`);
    }

    return this.prisma.client.uOMConversion.update({
      where: { 
        uomClassCode_uomCode: {
          uomClassCode,
          uomCode
        }
      },
      data: { isActive: false },
    });
  }
}
