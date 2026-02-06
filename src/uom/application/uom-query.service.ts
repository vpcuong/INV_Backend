import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UomQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllClasses() {
    return this.prisma.client.uOMClass.findMany({
      include: {
        uoms: {
          orderBy: { sortOrder: 'asc' },
        },
        uomConvs: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findClassByCode(code: string) {
    return this.prisma.client.uOMClass.findUnique({
      where: { code },
      include: {
        uoms: {
          orderBy: { sortOrder: 'asc' },
        },
        uomConvs: true,
      },
    });
  }

  async findAllUoms() {
    return this.prisma.client.uOM.findMany({
      include: {
        uomClass: true,
      },
      orderBy: [
        { classCode: 'asc' },
        { sortOrder: 'asc' },
      ],
    });
  }

  async findUomByCode(code: string) {
    return this.prisma.client.uOM.findUnique({
      where: { code },
      include: {
        uomClass: true,
        uomConvs: true,
      },
    });
  }

  async findUomsByClassCode(classCode: string) {
    return this.prisma.client.uOM.findMany({
      where: { classCode },
      include: {
        uomConvs: {
          where: { uomClassCode: classCode },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllConversions() {
    return this.prisma.client.uOMConversion.findMany({
      include: {
        uom: true,
        uomClass: true,
      },
      orderBy: [
        { uomClassCode: 'asc' },
        { uomCode: 'asc' },
      ],
    });
  }

  async findConversionsByClassCode(classCode: string) {
    return this.prisma.client.uOMConversion.findMany({
      where: { uomClassCode: classCode },
      include: {
        uom: true,
      },
      orderBy: { uomCode: 'asc' },
    });
  }

  async findActiveClasses() {
    return this.prisma.client.uOMClass.findMany({
      where: { isActive: true },
      include: {
        uoms: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findActiveUoms() {
    return this.prisma.client.uOM.findMany({
      where: { isActive: true },
      orderBy: [
        { classCode: 'asc' },
        { sortOrder: 'asc' },
      ],
    });
  }

  async findConversion(classCode: string, uomCode: string) {
    return this.prisma.client.uOMConversion.findUnique({
      where: {
        uomClassCode_uomCode: {
          uomClassCode: classCode,
          uomCode,
        },
      },
      include: {
        uom: true,
        uomClass: true,
      },
    });
  }

  async convertValue(
    classCode: string,
    fromUomCode: string,
    toUomCode: string,
    value: number,
  ) {
    // Lấy cả 2 conversion factors cùng lúc
    const [fromConv, toConv] = await Promise.all([
      this.prisma.client.uOMConversion.findUnique({
        where: {
          uomClassCode_uomCode: {
            uomClassCode: classCode,
            uomCode: fromUomCode,
          },
        },
      }),
      this.prisma.client.uOMConversion.findUnique({
        where: {
          uomClassCode_uomCode: {
            uomClassCode: classCode,
            uomCode: toUomCode,
          },
        },
      }),
    ]);

    if (!fromConv) {
      throw new NotFoundException(
        `Conversion for UOM ${fromUomCode} not found in class ${classCode}`,
      );
    }
    if (!toConv) {
      throw new NotFoundException(
        `Conversion for UOM ${toUomCode} not found in class ${classCode}`,
      );
    }

    // Convert: value * (fromFactor / toFactor)
    // Ví dụ: 2 DZ → PC: 2 * (12 / 1) = 24
    const baseValue = value * fromConv.toBaseFactor;
    const result = baseValue / toConv.toBaseFactor;

    return {
      fromUomCode,
      toUomCode,
      classCode,
      inputValue: value,
      result,
      fromFactor: fromConv.toBaseFactor,
      toFactor: toConv.toBaseFactor,
    };
  }

}
