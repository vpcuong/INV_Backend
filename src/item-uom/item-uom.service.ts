import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemUomDto } from './dto/create-item-uom.dto';
import { UpdateItemUomDto } from './dto/update-item-uom.dto';

@Injectable()
export class ItemUomService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateItemUomDto) {
    // Check if item exists
    const item = await this.prisma.client.item.findUnique({
      where: { id: createDto.itemId },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${createDto.itemId} not found`);
    }

    // Prevent creating ItemUOM with the same UOM as the Item's base UOM
    if (item.uomCode === createDto.uomCode) {
      throw new ConflictException(
        `Cannot create ItemUOM with UOM ${createDto.uomCode} because it is already the base UOM of Item ${createDto.itemId}`,
      );
    }

    // Check if UOM exists
    const uom = await this.prisma.client.uOM.findUnique({
      where: { code: createDto.uomCode },
    });

    if (!uom) {
      throw new NotFoundException(`UOM with code '${createDto.uomCode}' not found`);
    }

    // Check if ItemUOM already exists
    const existing = await this.prisma.client.itemUOM.findUnique({
      where: {
        itemId_uomCode: {
          itemId: createDto.itemId,
          uomCode: createDto.uomCode,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `ItemUOM already exists for Item ${createDto.itemId} and UOM ${uom.code}`,
      );
    }

    return this.prisma.client.itemUOM.create({
      data: {
        itemId: createDto.itemId,
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
        item: {
          select: {
            id: true,
            name: true,
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
    itemId?: number;
    uomCode?: string;
    isActive?: boolean;
    isPurchasingUom?: boolean;
    isSalesUom?: boolean;
    isManufacturingUom?: boolean;
  }) {
    const { skip, take, itemId, uomCode, isActive, isPurchasingUom, isSalesUom, isManufacturingUom } =
      params || {};

    return this.prisma.client.itemUOM.findMany({
      skip,
      take,
      where: {
        ...(itemId && { itemId }),
        ...(uomCode && { uomCode }),
        ...(isActive !== undefined && { isActive }),
        ...(isPurchasingUom !== undefined && { isPurchasingUom }),
        ...(isSalesUom !== undefined && { isSalesUom }),
        ...(isManufacturingUom !== undefined && { isManufacturingUom }),
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
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
        { itemId: 'asc' },
        { toBaseFactor: 'asc' },
      ],
    });
  }

  async findOne(itemId: number, uomCode: string) {
    const itemUom = await this.prisma.client.itemUOM.findUnique({
      where: {
        itemId_uomCode: {
          itemId,
          uomCode,
        },
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
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

    if (!itemUom) {
      throw new NotFoundException(`ItemUOM not found for Item ${itemId} and UOM ${uomCode}`);
    }

    return itemUom;
  }

  async findByItemId(itemId: number) {
    const item = await this.prisma.client.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    return this.prisma.client.itemUOM.findMany({
      where: { itemId },
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

  async findByItemAndUom(itemId: number, uomCode: string) {
    const itemUom = await this.prisma.client.itemUOM.findUnique({
      where: {
        itemId_uomCode: {
          itemId,
          uomCode,
        },
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
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

    if (!itemUom) {
      throw new NotFoundException(
        `ItemUOM not found for Item ${itemId} and UOM ${uomCode}`,
      );
    }

    return itemUom;
  }

  async update(itemId: number, uomCode: string, updateDto: UpdateItemUomDto) {
    const itemUom = await this.prisma.client.itemUOM.findUnique({
      where: {
        itemId_uomCode: {
          itemId,
          uomCode,
        },
      },
    });

    if (!itemUom) {
      throw new NotFoundException(`ItemUOM not found for Item ${itemId} and UOM ${uomCode}`);
    }
    // only one itemUOM can be default
    if(updateDto.isDefaultTransUom) {
      const itemUoms = await this.prisma.client.itemUOM.findMany({
        where: {
          itemId: itemUom.itemId,
          isDefaultTransUom: true,
          NOT: {
            AND: [
              { itemId },
              { uomCode },
            ],
          },
        },
      })

      if(itemUoms.length > 0) {
        throw new BadRequestException('Only one itemUOM can be set as default');
      }
    }

    return this.prisma.client.itemUOM.update({
      where: {
        itemId_uomCode: {
          itemId,
          uomCode,
        },
      },
      data: updateDto,
      include: {
        item: {
          select: {
            id: true,
            name: true,
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

  async remove(itemId: number, uomCode: string) {
    const itemUom = await this.prisma.client.itemUOM.findUnique({
      where: {
        itemId_uomCode: {
          itemId,
          uomCode,
        },
      },
    });

    if (!itemUom) {
      throw new NotFoundException(`ItemUOM not found for Item ${itemId} and UOM ${uomCode}`);
    }

    return this.prisma.client.itemUOM.delete({
      where: {
        itemId_uomCode: {
          itemId,
          uomCode,
        },
      },
    });
  }

  // Utility method to convert quantity between UOMs
  async convertQuantity(
    itemId: number,
    fromUomCode: string,
    toUomCode: string,
    quantity: number,
  ): Promise<number> {
    // Prevent conversion if both UOMs are the same
    if (fromUomCode === toUomCode) {
      return quantity; // No conversion needed, return original quantity
    }

    const fromUom = await this.findByItemAndUom(itemId, fromUomCode);
    const toUom = await this.findByItemAndUom(itemId, toUomCode);

    // Convert to base UOM first
    const baseQuantity = quantity * Number(fromUom.toBaseFactor);

    // Convert to target UOM
    const targetQuantity = baseQuantity / Number(toUom.toBaseFactor);

    // Apply rounding precision
    const precision = toUom.roundingPrecision ?? 2;
    return Number(targetQuantity.toFixed(precision));
  }
}