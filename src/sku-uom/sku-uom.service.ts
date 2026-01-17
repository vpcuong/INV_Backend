import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
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
        `Cannot create SKUUOM with UOM ${createDto.uomCode} because it is already the base UOM of SKU ${createDto.skuId}`
      );
    }

    // Check if UOM exists
    const uom = await this.prisma.client.uOM.findUnique({
      where: { code: createDto.uomCode },
    });

    if (!uom) {
      throw new NotFoundException(
        `UOM with code '${createDto.uomCode}' not found`
      );
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
        `SKUUOM already exists for SKU ${createDto.skuId} and UOM ${uom.code}`
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
    const {
      skip,
      take,
      skuId,
      uomCode,
      isActive,
      isPurchasingUom,
      isSalesUom,
      isManufacturingUom,
    } = params || {};

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
      orderBy: [{ skuId: 'asc' }, { toBaseFactor: 'asc' }],
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
        `SKUUOM not found for SKU ${skuId} and UOM ${uomCode}`
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

  /**
   * Get all available UOM codes for a SKU
   *
   * Business Logic:
   * - TH1: If Item.uomCode === SKU.uomCode
   *        => Return ItemUOMs (not overridden) + SKUUOMs (overridden or new)
   * - TH2: If Item.uomCode ≠ SKU.uomCode
   *        => Return only SKUUOMs (Item UOMs don't apply)
   */
  async getAvailableUomsForSku(skuId: number) {
    // Get SKU with its UOM information
    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { id: skuId },
      include: {
        uom: true,
        skuUoms: {
          where: { isActive: true },
          include: {
            uom: true,
          },
        },
      },
    });

    if (!sku) {
      throw new NotFoundException(`SKU with ID ${skuId} not found`);
    }

    // Get Item with its UOMs (use modelId if available, otherwise itemId)
    const itemId = sku.modelId
      ? (
          await this.prisma.client.itemModel.findUnique({
            where: { id: sku.modelId },
            select: { itemId: true },
          })
        )?.itemId
      : sku.itemId;

    if (!itemId) {
      throw new NotFoundException(`Item not found for SKU ${skuId}`);
    }

    const item = await this.prisma.client.item.findUnique({
      where: { id: itemId },
      include: {
        uom: true,
        itemUoms: {
          where: { isActive: true },
          include: {
            uom: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }
    const itemUomCode = item.uomCode;
    const skuUomCode = sku.uomCode;

    // Get SKUUOM codes (these override ItemUOMs)
    const skuUomCodes = new Set(
      sku.skuUoms?.map((su: any) => su.uomCode) || []
    );

    let availableUoms: any[] = [];

    // TH1: Item và SKU có cùng base UOM
    if (itemUomCode === skuUomCode) {
      // Add base UOM
      if (sku.uom) {
        availableUoms.push({
          uomCode: sku.uom.code,
          uomName: sku.uom.name,
          source: 'BASE',
          toBaseFactor: 1,
          roundingPrecision: 2,
          isDefaultTransUom: false,
          isPurchasingUom: false,
          isSalesUom: false,
          isManufacturingUom: false,
        });
      }

      // Add ItemUOMs that are NOT overridden by SKUUOMs
      const nonOverriddenItemUoms = (item.itemUoms || [])
        .filter((itemUom: any) => !skuUomCodes.has(itemUom.uomCode))
        .map((itemUom: any) => ({
          uomCode: itemUom.uomCode,
          uomName: itemUom.uom.name,
          source: 'ITEM',
          toBaseFactor: Number(itemUom.toBaseFactor),
          roundingPrecision: itemUom.roundingPrecision,
          isDefaultTransUom: itemUom.isDefaultTransUom,
          isPurchasingUom: itemUom.isPurchasingUom,
          isSalesUom: itemUom.isSalesUom,
          isManufacturingUom: itemUom.isManufacturingUom,
          desc: itemUom.desc,
        }));

      availableUoms = [...availableUoms, ...nonOverriddenItemUoms];

      // Add all SKUUOMs (overridden or new)
      const skuUoms = (sku.skuUoms || []).map((skuUom: any) => ({
        uomCode: skuUom.uomCode,
        uomName: skuUom.uom.name,
        source:
          skuUomCodes.has(skuUom.uomCode) &&
          (item.itemUoms || []).some((iu: any) => iu.uomCode === skuUom.uomCode)
            ? 'SKU_OVERRIDE'
            : 'SKU',
        toBaseFactor: Number(skuUom.toBaseFactor),
        roundingPrecision: skuUom.roundingPrecision,
        isDefaultTransUom: skuUom.isDefaultTransUom,
        isPurchasingUom: skuUom.isPurchasingUom,
        isSalesUom: skuUom.isSalesUom,
        isManufacturingUom: skuUom.isManufacturingUom,
        desc: skuUom.desc,
      }));

      availableUoms = [...availableUoms, ...skuUoms];
    }
    // TH2: Item và SKU có base UOM khác nhau
    else {
      // Add SKU base UOM
      if (sku.uom) {
        availableUoms.push({
          uomCode: sku.uom.code,
          uomName: sku.uom.name,
          source: 'BASE',
          toBaseFactor: 1,
          roundingPrecision: 2,
          isDefaultTransUom: false,
          isPurchasingUom: false,
          isSalesUom: false,
          isManufacturingUom: false,
        });
      }

      // Only add SKUUOMs (ItemUOMs don't apply)
      const skuUoms = (sku.skuUoms || []).map((skuUom: any) => ({
        uomCode: skuUom.uomCode,
        uomName: skuUom.uom.name,
        source: 'SKU',
        toBaseFactor: Number(skuUom.toBaseFactor),
        roundingPrecision: skuUom.roundingPrecision,
        isDefaultTransUom: skuUom.isDefaultTransUom,
        isPurchasingUom: skuUom.isPurchasingUom,
        isSalesUom: skuUom.isSalesUom,
        isManufacturingUom: skuUom.isManufacturingUom,
        desc: skuUom.desc,
      }));

      availableUoms = [...availableUoms, ...skuUoms];
    }

    // Sort by toBaseFactor
    availableUoms.sort((a, b) => a.toBaseFactor - b.toBaseFactor);

    return {
      skuId,
      skuCode: sku.skuCode,
      itemId: item.id,
      itemName: item.code,
      itemUomCode,
      skuUomCode,
      sameBaseUom: itemUomCode === skuUomCode,
      availableUoms,
    };
  }

  // Utility method to convert quantity between UOMs
  async convertQuantity(
    skuId: number,
    fromUomCode: string,
    toUomCode: string,
    quantity: number
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
