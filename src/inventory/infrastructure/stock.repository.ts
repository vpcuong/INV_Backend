import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IStockRepository, StockData } from '../domain/stock.repository.interface';

@Injectable()
export class StockRepository implements IStockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findStock(
    warehouseId: number,
    itemSkuId: number,
  ): Promise<StockData | null> {
    const item = await this.prisma.client.warehouseItem.findUnique({
      where: {
        warehouseId_itemSkuId: {
          warehouseId,
          itemSkuId,
        },
      },
    });

    if (!item) return null;

    return {
      quantity: Number(item.quantity),
      reservedQty: Number(item.reservedQty),
    };
  }

  async upsertStock(
    warehouseId: number,
    itemSkuId: number,
    quantity: number,
    uomCode: string,
  ): Promise<void> {
    await this.prisma.client.warehouseItem.upsert({
      where: {
        warehouseId_itemSkuId: {
          warehouseId,
          itemSkuId,
        },
      },
      create: {
        warehouseId,
        itemSkuId,
        quantity,
        reservedQty: 0,
        uomCode,
      },
      update: {
        quantity,
      },
    });
  }

  async createStock(
    warehouseId: number,
    itemSkuId: number,
    quantity: number,
    reservedQty: number,
    uomCode: string,
  ): Promise<void> {
    await this.prisma.client.warehouseItem.create({
      data: {
        warehouseId,
        itemSkuId,
        quantity,
        reservedQty,
        uomCode,
      },
    });
  }

  async updateStockQuantity(
    warehouseId: number,
    itemSkuId: number,
    quantity: number,
  ): Promise<void> {
    await this.prisma.client.warehouseItem.update({
      where: {
        warehouseId_itemSkuId: {
          warehouseId,
          itemSkuId,
        },
      },
      data: {
        quantity,
      },
    });
  }
}
