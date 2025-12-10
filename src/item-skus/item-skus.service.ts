import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemSkuDto } from './dto/create-item-sku.dto';
import { UpdateItemSkuDto } from './dto/update-item-sku.dto';

@Injectable()
export class ItemSkusService {
  constructor(private prisma: PrismaService) {}

  async create(createItemSkuDto: CreateItemSkuDto) {
    const skuCode = await this.createSKUCode(
      createItemSkuDto.revisionId,
      createItemSkuDto.colorId,
      createItemSkuDto.genderId,
      createItemSkuDto.sizeId
    );
    return this.prisma.client.itemSKU.create({
      data: {
        skuCode: skuCode,
        revisionId: createItemSkuDto.revisionId,
        colorId: createItemSkuDto.colorId,
        genderId: createItemSkuDto.genderId,
        sizeId: createItemSkuDto.sizeId,
        pattern: createItemSkuDto.pattern,
        lengthCm: createItemSkuDto.lengthCm,
        widthCm: createItemSkuDto.widthCm,
        heightCm: createItemSkuDto.heightCm,
        weightG: createItemSkuDto.weightG,
        notes: createItemSkuDto.notes,
        status: createItemSkuDto.status || 'Active',
      },
      include: {
        revision: {
          include: {
            item: true,
          },
        },
        color: true,
        gender: true,
        size: true,
      },
    });
  }

  async findAll() {
    return this.prisma.client.itemSKU.findMany({
      include: {
        revision: {
          include: {
            item: true,
          },
        },
        color: true,
        gender: true,
        size: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { id },
      include: {
        revision: {
          include: {
            item: true,
          },
        },
        color: true,
        gender: true,
        size: true,
      },
    });

    if (!sku) {
      throw new NotFoundException(`Item SKU with ID ${id} not found`);
    }

    return sku;
  }

  async findByItemId(itemId: number) {
    return this.prisma.client.itemSKU.findMany({
      where: {
        revision: {
          itemId: itemId,
        },
      },
      include: {
        revision: {
          include: {
            item: true,
          },
        },
        color: true,
        gender: true,
        size: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByRevisionId(revisionId: number) {
    return this.prisma.client.itemSKU.findMany({
      where: { revisionId },
      include: {
        revision: {
          include: {
            item: true,
          },
        },
        color: true,
        gender: true,
        size: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: number, updateItemSkuDto: UpdateItemSkuDto) {
    await this.findOne(id);

    return this.prisma.client.itemSKU.update({
      where: { id },
      data: {
        ...updateItemSkuDto,
      },
      include: {
        revision: {
          include: {
            item: true,
          },
        },
        color: true,
        gender: true,
        size: true,
      },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.client.itemSKU.update({
      where: { id },
      data: { status: 'Active' },
      include: {
        revision: {
          include: {
            item: true,
          },
        },
        color: true,
        gender: true,
        size: true,
      },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.client.itemSKU.update({
      where: { id },
      data: { status: 'Inactive' },
      include: {
        revision: {
          include: {
            item: true,
          },
        },
        color: true,
        gender: true,
        size: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.client.itemSKU.delete({
      where: { id },
    });
  }

  async createSKUCode(revisionId: number, colorId: number, genderId: number, sizeId: number): Promise<string> {
    // Lookup codes from IDs and get Item data from revision
    const [color, gender, size, revision] = await Promise.all([
      this.prisma.client.color.findUnique({ where: { id: colorId } }),
      this.prisma.client.gender.findUnique({ where: { id: genderId } }),
      this.prisma.client.size.findUnique({ where: { id: sizeId } }),
      this.prisma.client.itemRevision.findUnique({
        where: { id: revisionId },
        include: {
          item: {
            include: {
              itemType: true,
              material: true,
            },
          },
        },
      }),
    ]);

    if (!color || !gender || !size) {
      throw new NotFoundException('Invalid color, gender, or size ID');
    }

    if (!revision) {
      throw new NotFoundException(`Item revision with ID ${revisionId} not found`);
    }

    // Lookup for ItemType.code, Material.code, and Size.code from related Item
    const itemTypeCode = revision.item.itemType?.code || 'NOTYPE';
    const materialCode = revision.item.material?.code || 'NOMAT';
    const sizeCode = size.code;

    const skuCode = `${itemTypeCode}-${materialCode}-${color.code}-${gender.code}-${sizeCode}`.trim();
    return skuCode;
  }
}
