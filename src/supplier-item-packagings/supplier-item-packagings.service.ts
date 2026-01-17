import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierItemPackagingDto } from './dto/create-supplier-item-packaging.dto';
import { UpdateSupplierItemPackagingDto } from './dto/update-supplier-item-packaging.dto';

@Injectable()
export class SupplierItemPackagingsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateSupplierItemPackagingDto) {
    // Verify supplier item exists
    const supplierItem = await this.prisma.client.supplierItem.findUnique({
      where: { id: createDto.supplierItemId },
    });

    if (!supplierItem) {
      throw new NotFoundException(
        `Supplier item with ID ${createDto.supplierItemId} not found`
      );
    }

    // Check if level already exists for this supplier item
    const existingPackaging =
      await this.prisma.client.supplierItemPackaging.findUnique({
        where: {
          supplierItemId_level: {
            supplierItemId: createDto.supplierItemId,
            level: createDto.level,
          },
        },
      });

    if (existingPackaging) {
      throw new ConflictException(
        `Packaging level ${createDto.level} already exists for supplier item ${createDto.supplierItemId}`
      );
    }

    // Verify UOM exists
    const uom = await this.prisma.client.uOM.findUnique({
      where: { code: createDto.uomCode },
    });

    if (!uom) {
      throw new NotFoundException(
        `UOM with code '${createDto.uomCode}' not found`
      );
    }

    // Calculate qtyToBase if not provided
    let qtyToBase = createDto.qtyToBase;
    if (!qtyToBase) {
      qtyToBase = await this.calculateQtyToBase(
        createDto.supplierItemId,
        createDto.level,
        createDto.qtyPerPrevLevel
      );
    }

    return this.prisma.client.supplierItemPackaging.create({
      data: {
        supplierItemId: createDto.supplierItemId,
        level: createDto.level,
        uomCode: createDto.uomCode,
        qtyPerPrevLevel: createDto.qtyPerPrevLevel,
        qtyToBase,
      },
      include: {
        uom: true,
        supplierItem: {
          include: {
            item: true,
            supplier: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.client.supplierItemPackaging.findMany({
      include: {
        uom: true,
        supplierItem: {
          include: {
            item: true,
            supplier: true,
          },
        },
      },
      orderBy: [{ supplierItemId: 'asc' }, { level: 'asc' }],
    });
  }

  async findBySupplierItem(supplierItemId: number) {
    const supplierItem = await this.prisma.client.supplierItem.findUnique({
      where: { id: supplierItemId },
    });

    if (!supplierItem) {
      throw new NotFoundException(
        `Supplier item with ID ${supplierItemId} not found`
      );
    }

    return this.prisma.client.supplierItemPackaging.findMany({
      where: { supplierItemId },
      include: {
        uom: true,
      },
      orderBy: { level: 'asc' },
    });
  }

  async findOne(id: number) {
    const packaging = await this.prisma.client.supplierItemPackaging.findUnique(
      {
        where: { id },
        include: {
          uom: true,
          supplierItem: {
            include: {
              item: true,
              supplier: true,
            },
          },
        },
      }
    );

    if (!packaging) {
      throw new NotFoundException(
        `Supplier item packaging with ID ${id} not found`
      );
    }

    return packaging;
  }

  async update(id: number, updateDto: UpdateSupplierItemPackagingDto) {
    await this.findOne(id);

    // If updating level, check for conflicts
    if (
      updateDto.level !== undefined &&
      updateDto.supplierItemId !== undefined
    ) {
      const existingPackaging =
        await this.prisma.client.supplierItemPackaging.findUnique({
          where: {
            supplierItemId_level: {
              supplierItemId: updateDto.supplierItemId,
              level: updateDto.level,
            },
          },
        });

      if (existingPackaging && existingPackaging.id !== id) {
        throw new ConflictException(
          `Packaging level ${updateDto.level} already exists for supplier item ${updateDto.supplierItemId}`
        );
      }
    }

    // Recalculate qtyToBase if qtyPerPrevLevel or level changes
    let qtyToBase = updateDto.qtyToBase;
    if (updateDto.qtyPerPrevLevel !== undefined && !updateDto.qtyToBase) {
      const currentPackaging =
        await this.prisma.client.supplierItemPackaging.findUnique({
          where: { id },
        });

      if (currentPackaging) {
        qtyToBase = await this.calculateQtyToBase(
          updateDto.supplierItemId ?? currentPackaging.supplierItemId,
          updateDto.level ?? currentPackaging.level,
          updateDto.qtyPerPrevLevel
        );
      }
    }

    return this.prisma.client.supplierItemPackaging.update({
      where: { id },
      data: {
        ...updateDto,
        qtyToBase,
      },
      include: {
        uom: true,
        supplierItem: {
          include: {
            item: true,
            supplier: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.client.supplierItemPackaging.delete({
      where: { id },
    });
  }

  /**
   * Calculate qtyToBase for a given packaging level
   * Level 1: qtyToBase = qtyPerPrevLevel (since prev = base unit)
   * Level 2+: qtyToBase = qtyPerPrevLevel * prevLevel.qtyToBase
   */
  private async calculateQtyToBase(
    supplierItemId: number,
    level: number,
    qtyPerPrevLevel: number
  ): Promise<number> {
    if (level === 1) {
      // Level 1: qtyToBase equals qtyPerPrevLevel (base unit)
      return qtyPerPrevLevel;
    }

    // For level > 1, find previous level and multiply
    const prevLevel = await this.prisma.client.supplierItemPackaging.findUnique(
      {
        where: {
          supplierItemId_level: {
            supplierItemId,
            level: level - 1,
          },
        },
      }
    );

    if (!prevLevel) {
      throw new BadRequestException(
        `Cannot create level ${level} without level ${level - 1}. Please create packaging levels in order.`
      );
    }

    if (!prevLevel.qtyToBase) {
      throw new BadRequestException(
        `Previous level ${level - 1} does not have qtyToBase calculated`
      );
    }

    return qtyPerPrevLevel * prevLevel.qtyToBase;
  }

  /**
   * Recalculate qtyToBase for all packaging levels of a supplier item
   * Useful when updating lower levels
   */
  async recalculateQtyToBase(supplierItemId: number) {
    const packagings = await this.prisma.client.supplierItemPackaging.findMany({
      where: { supplierItemId },
      orderBy: { level: 'asc' },
    });

    for (const packaging of packagings) {
      const qtyToBase = await this.calculateQtyToBase(
        supplierItemId,
        packaging.level,
        packaging.qtyPerPrevLevel
      );

      await this.prisma.client.supplierItemPackaging.update({
        where: { id: packaging.id },
        data: { qtyToBase },
      });
    }

    return this.findBySupplierItem(supplierItemId);
  }
}
