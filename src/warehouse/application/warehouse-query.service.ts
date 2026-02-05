import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WAREHOUSE_REPOSITORY } from '../constant/warehouse.token';
import { IWarehouseRepository } from '../domain/warehouse.repository.interface';
import { WarehouseFilterDto } from '../dto/warehouse-filter.dto';
import { WarehouseNotFoundException } from '../domain/exceptions/warehouse-domain.exception';

@Injectable()
export class WarehouseQueryService {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY)
    private readonly warehouseRepository: IWarehouseRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(filterDto?: WarehouseFilterDto): Promise<any[]> {
    const warehouses = await this.warehouseRepository.findAll(filterDto);
    return warehouses.map((w) => w.toPersistence());
  }

  async findByPublicId(publicId: string): Promise<any> {
    const warehouse = await this.warehouseRepository.findByPublicId(publicId);
    if (!warehouse) {
      throw new WarehouseNotFoundException(publicId);
    }
    return warehouse.toPersistence();
  }

  async findByCode(code: string): Promise<any> {
    const warehouse = await this.warehouseRepository.findByCode(code);
    if (!warehouse) {
      throw new WarehouseNotFoundException(code);
    }
    return warehouse.toPersistence();
  }

  async getInventory(warehousePublicId: string): Promise<any[]> {
    const warehouse =
      await this.warehouseRepository.findByPublicId(warehousePublicId);
    if (!warehouse) {
      throw new WarehouseNotFoundException(warehousePublicId);
    }

    // Get inventory with SKU details
    const inventoryItems = await this.prisma.client.warehouseItem.findMany({
      where: { warehouseId: warehouse.getId() },
      include: {
        itemSku: {
          include: {
            color: true,
            size: true,
            gender: true,
          },
        },
      },
      orderBy: { itemSku: { skuCode: 'asc' } },
    });

    return inventoryItems.map((item: any) => ({
      warehousePublicId: warehouse.getPublicId(),
      warehouseCode: warehouse.getCode(),
      warehouseName: warehouse.getName(),
      skuPublicId: item.itemSku.publicId,
      skuCode: item.itemSku.skuCode,
      skuDesc: item.itemSku.desc,
      color: item.itemSku.color?.desc,
      size: item.itemSku.size?.desc,
      gender: item.itemSku.gender?.desc,
      quantity: Number(item.quantity),
      reservedQty: Number(item.reservedQty),
      availableQty: Number(item.quantity) - Number(item.reservedQty),
    }));
  }

  async getInventoryBySku(skuPublicId: string): Promise<any[]> {
    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { publicId: skuPublicId },
    });
    if (!sku) {
      throw new NotFoundException(
        `SKU with publicId ${skuPublicId} not found`,
      );
    }

    const inventoryItems = await this.prisma.client.warehouseItem.findMany({
      where: { itemSkuId: sku.id },
      include: {
        warehouse: true,
      },
      orderBy: { warehouse: { code: 'asc' } },
    });

    return inventoryItems.map((item: any) => ({
      warehousePublicId: item.warehouse.publicId,
      warehouseCode: item.warehouse.code,
      warehouseName: item.warehouse.name,
      skuPublicId: sku.publicId,
      skuCode: sku.skuCode,
      quantity: Number(item.quantity),
      reservedQty: Number(item.reservedQty),
      availableQty: Number(item.quantity) - Number(item.reservedQty),
    }));
  }

  async getStockSummary(warehousePublicId: string): Promise<any> {
    const warehouse =
      await this.warehouseRepository.findByPublicId(warehousePublicId);
    if (!warehouse) {
      throw new WarehouseNotFoundException(warehousePublicId);
    }

    const summary = await this.prisma.client.warehouseItem.aggregate({
      where: { warehouseId: warehouse.getId() },
      _sum: {
        quantity: true,
        reservedQty: true,
      },
      _count: {
        id: true,
      },
    });

    const totalQty = Number(summary._sum.quantity ?? 0);
    const totalReserved = Number(summary._sum.reservedQty ?? 0);

    return {
      warehousePublicId: warehouse.getPublicId(),
      warehouseCode: warehouse.getCode(),
      warehouseName: warehouse.getName(),
      totalSkuCount: summary._count.id,
      totalQuantity: totalQty,
      totalReservedQty: totalReserved,
      totalAvailableQty: totalQty - totalReserved,
    };
  }

  async getTotalStockBySku(skuPublicId: string): Promise<any> {
    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { publicId: skuPublicId },
    });
    if (!sku) {
      throw new NotFoundException(
        `SKU with publicId ${skuPublicId} not found`,
      );
    }

    const summary = await this.prisma.client.warehouseItem.aggregate({
      where: { itemSkuId: sku.id },
      _sum: {
        quantity: true,
        reservedQty: true,
      },
      _count: {
        id: true,
      },
    });

    const totalQty = Number(summary._sum.quantity ?? 0);
    const totalReserved = Number(summary._sum.reservedQty ?? 0);

    return {
      skuPublicId: sku.publicId,
      skuCode: sku.skuCode,
      warehouseCount: summary._count.id,
      totalQuantity: totalQty,
      totalReservedQty: totalReserved,
      totalAvailableQty: totalQty - totalReserved,
    };
  }
}
