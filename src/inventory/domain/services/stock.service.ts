import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { InvTransType } from '../../enums/inv-trans.enum';
import { InvTransLine } from '../inv-trans-line.entity';

export interface StockUpdateResult {
  warehouseId: number;
  itemSkuId: number;
  previousQty: number;
  newQty: number;
}

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  /**
   * Update warehouse stock based on transaction type
   * Called when a transaction is completed
   */
  async updateStock(
    type: InvTransType,
    fromWarehouseId: number | null | undefined,
    toWarehouseId: number | null | undefined,
    lines: InvTransLine[]
  ): Promise<StockUpdateResult[]> {
    const results: StockUpdateResult[] = [];

    for (const line of lines) {
      const itemSkuId = line.getItemSkuId();
      const quantity = line.getQuantity();

      switch (type) {
        case InvTransType.GOODS_RECEIPT:
          // Add stock to toWarehouse
          if (toWarehouseId) {
            const result = await this.addStock(toWarehouseId, itemSkuId, quantity);
            results.push(result);
          }
          break;

        case InvTransType.GOODS_ISSUE:
          // Remove stock from fromWarehouse
          if (fromWarehouseId) {
            const result = await this.removeStock(fromWarehouseId, itemSkuId, quantity);
            results.push(result);
          }
          break;

        case InvTransType.STOCK_TRANSFER:
          // Remove from source, add to destination
          if (fromWarehouseId && toWarehouseId) {
            const removeResult = await this.removeStock(fromWarehouseId, itemSkuId, quantity);
            results.push(removeResult);
            const addResult = await this.addStock(toWarehouseId, itemSkuId, quantity);
            results.push(addResult);
          }
          break;

        case InvTransType.ADJUSTMENT:
          // For adjustment, quantity can be positive (add) or negative (remove)
          // Note: In current schema, quantity is always positive
          // You might need to add a sign field or handle positive/negative adjustment differently
          if (fromWarehouseId) {
            // For now, treat adjustment as setting the quantity delta
            // Positive = add, Negative = remove (if you support negative in UI)
            const result = await this.addStock(fromWarehouseId, itemSkuId, quantity);
            results.push(result);
          }
          break;
      }
    }

    return results;
  }

  /**
   * Add stock to warehouse
   */
  private async addStock(
    warehouseId: number,
    itemSkuId: number,
    quantity: number
  ): Promise<StockUpdateResult> {
    const existing = await this.prisma.client.warehouseItem.findUnique({
      where: {
        warehouseId_itemSkuId: {
          warehouseId,
          itemSkuId,
        },
      },
    });

    const previousQty = existing ? Number(existing.quantity) : 0;
    const newQty = previousQty + quantity;

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
        quantity: newQty,
        reservedQty: 0,
      },
      update: {
        quantity: newQty,
      },
    });

    return { warehouseId, itemSkuId, previousQty, newQty };
  }

  /**
   * Remove stock from warehouse
   */
  private async removeStock(
    warehouseId: number,
    itemSkuId: number,
    quantity: number
  ): Promise<StockUpdateResult> {
    const existing = await this.prisma.client.warehouseItem.findUnique({
      where: {
        warehouseId_itemSkuId: {
          warehouseId,
          itemSkuId,
        },
      },
    });

    const previousQty = existing ? Number(existing.quantity) : 0;
    const newQty = Math.max(0, previousQty - quantity); // Prevent negative stock

    if (!existing) {
      // Create with 0 or negative (business decision needed)
      await this.prisma.client.warehouseItem.create({
        data: {
          warehouseId,
          itemSkuId,
          quantity: newQty,
          reservedQty: 0,
        },
      });
    } else {
      await this.prisma.client.warehouseItem.update({
        where: {
          warehouseId_itemSkuId: {
            warehouseId,
            itemSkuId,
          },
        },
        data: {
          quantity: newQty,
        },
      });
    }

    return { warehouseId, itemSkuId, previousQty, newQty };
  }

  /**
   * Check if warehouse has sufficient stock
   */
  async hasStock(
    warehouseId: number,
    itemSkuId: number,
    requiredQty: number
  ): Promise<boolean> {
    const item = await this.prisma.client.warehouseItem.findUnique({
      where: {
        warehouseId_itemSkuId: {
          warehouseId,
          itemSkuId,
        },
      },
    });

    if (!item) {
      return false;
    }

    const availableQty = Number(item.quantity) - Number(item.reservedQty);
    return availableQty >= requiredQty;
  }

  /**
   * Get current stock level
   */
  async getStock(warehouseId: number, itemSkuId: number): Promise<number> {
    const item = await this.prisma.client.warehouseItem.findUnique({
      where: {
        warehouseId_itemSkuId: {
          warehouseId,
          itemSkuId,
        },
      },
    });

    return item ? Number(item.quantity) : 0;
  }
}
