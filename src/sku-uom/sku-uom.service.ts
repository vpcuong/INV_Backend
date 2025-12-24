import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkuUomDto } from './dto/create-sku-uom.dto';
import { UpdateSkuUomDto } from './dto/update-sku-uom.dto';

@Injectable()
export class SkuUomService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateSkuUomDto) {
    // Check if SKU exists
    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { id: createDto.skuId },
    });

    if (!sku) {
      throw new NotFoundException(`SKU with ID ${createDto.skuId} not found`);
    }

    // Prevent creating SKUUOM with the same UOM as the SKU's base UOM
    if (sku.uomCode === createDto.uomCode) {
      throw new ConflictException(
        `Cannot create SKUUOM with UOM ${createDto.uomCode} because it is already the base UOM of SKU ${createDto.skuId}`,
      );
    }

    // Check if UOM exists
    const uom = await this.prisma.client.uOM.findUnique({
      where: { code: createDto.uomCode },
    });

    if (!uom) {
      throw new NotFoundException(`UOM with code '${createDto.uomCode}' not found`);
    }

    // Check if SKUUOM already exists
    const existing = await this.prisma.client.sKUUOM.findUnique({
      where: {
        ux_sku_uom_once: {
          skuId: createDto.skuId,
          uomCode: createDto.uomCode,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `SKUUOM already exists for SKU ${createDto.skuId} and UOM ${uom.code}`,
      );
    }

    return this.prisma.client.sKUUOM.create({
      data: {
        skuId: createDto.skuId,
        uomCode: createDto.uomCode,
        toBaseFactor: createDto.toBaseFactor,
        roundingPrecision: createDto.roundingPrecision ?? 2,
        isDefaultTransUom: createDto.isDefaultTransUom ?? false,
        isPurchasingUom: createDto.isPurchasingUom ?? false,
        isSalesUom: createDto.isSalesUom ?? false,
        isManufacturingUom: createDto.isManufacturingUom ?? false,
        isActive: createDto.isActive ?? true,
        desc: createDto.desc,
      },
      include: {
        sku: {
          select: {
            id: true,
            skuCode: true,
            uomCode: true,
          },
        },
        uom: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    skuId?: number;
    uomCode?: string;
    isActive?: boolean;
    isPurchasingUom?: boolean;
    isSalesUom?: boolean;
    isManufacturingUom?: boolean;
  }) {
    const { skip, take, skuId, uomCode, isActive, isPurchasingUom, isSalesUom, isManufacturingUom } =
      params || {};

    return this.prisma.client.sKUUOM.findMany({
      skip,
      take,
      where: {
        ...(skuId && { skuId }),
        ...(uomCode && { uomCode }),
        ...(isActive !== undefined && { isActive }),
        ...(isPurchasingUom !== undefined && { isPurchasingUom }),
        ...(isSalesUom !== undefined && { isSalesUom }),
        ...(isManufacturingUom !== undefined && { isManufacturingUom }),
      },
      include: {
        sku: {
          select: {
            id: true,
            skuCode: true,
            uomCode: true,
          },
        },
        uom: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: [
        { skuId: 'asc' },
        { toBaseFactor: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    const skuUom = await this.prisma.client.sKUUOM.findUnique({
      where: { id },
      include: {
        sku: {
          select: {
            id: true,
            skuCode: true,
            uomCode: true,
            uom: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
        uom: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    if (!skuUom) {
      throw new NotFoundException(`SKUUOM with ID ${id} not found`);
    }

    return skuUom;
  }

  async findBySkuId(skuId: number) {
    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { id: skuId },
    });

    if (!sku) {
      throw new NotFoundException(`SKU with ID ${skuId} not found`);
    }

    return this.prisma.client.sKUUOM.findMany({
      where: { skuId },
      include: {
        uom: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        toBaseFactor: 'asc',
      },
    });
  }

  async findBySkuAndUom(skuId: number, uomCode: string) {
    const skuUom = await this.prisma.client.sKUUOM.findUnique({
      where: {
        ux_sku_uom_once: {
          skuId,
          uomCode,
        },
      },
      include: {
        sku: {
          select: {
            id: true,
            skuCode: true,
            uomCode: true,
          },
        },
        uom: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    if (!skuUom) {
      throw new NotFoundException(
        `SKUUOM not found for SKU ${skuId} and UOM ${uomCode}`,
      );
    }

    return skuUom;
  }

  async update(id: number, updateDto: UpdateSkuUomDto) {
    const skuUom = await this.prisma.client.sKUUOM.findUnique({
      where: { id },
    });

    if (!skuUom) {
      throw new NotFoundException(`SKUUOM with ID ${id} not found`);
    }

    // Only one SKUUOM can be default
    if (updateDto.isDefaultTransUom) {
      const skuUoms = await this.prisma.client.sKUUOM.findMany({
        where: {
          skuId: skuUom.skuId,
          isDefaultTransUom: true,
          id: { not: id },
        },
      });

      if (skuUoms.length > 0) {
        throw new BadRequestException('Only one SKUUOM can be set as default');
      }
    }

    return this.prisma.client.sKUUOM.update({
      where: { id },
      data: updateDto,
      include: {
        sku: {
          select: {
            id: true,
            skuCode: true,
            uomCode: true,
          },
        },
        uom: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const skuUom = await this.prisma.client.sKUUOM.findUnique({
      where: { id },
    });

    if (!skuUom) {
      throw new NotFoundException(`SKUUOM with ID ${id} not found`);
    }

    return this.prisma.client.sKUUOM.delete({
      where: { id },
    });
  }

  // Utility method to convert quantity between UOMs
  async convertQuantity(
    skuId: number,
    fromUomCode: string,
    toUomCode: string,
    quantity: number,
  ): Promise<number> {
    // Prevent conversion if both UOMs are the same
    if (fromUomCode === toUomCode) {
      return quantity; // No conversion needed, return original quantity
    }

    const fromUom = await this.findBySkuAndUom(skuId, fromUomCode);
    const toUom = await this.findBySkuAndUom(skuId, toUomCode);

    // Convert to base UOM first
    const baseQuantity = quantity * Number(fromUom.toBaseFactor);

    // Convert to target UOM
    const targetQuantity = baseQuantity / Number(toUom.toBaseFactor);

    // Apply rounding precision
    const precision = toUom.roundingPrecision ?? 2;
    return Number(targetQuantity.toFixed(precision));
  }
}