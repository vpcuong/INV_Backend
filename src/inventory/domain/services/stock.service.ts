import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InvTransType } from '../../enums/inv-trans.enum';
import { InvTransLine } from '../inv-trans-line.entity';
import { IStockRepository } from '../stock.repository.interface';
import { STOCK_REPOSITORY } from '../../constant/inventory.token';
import { ItemQueryService } from '../../../items/application/item-query.service';
import { WarehouseService } from '../../../warehouse/application/warehouse.service';

export interface StockUpdateResult {
  warehouseId: number;
  itemSkuId: number;
  previousQty: number;
  newQty: number;
}

@Injectable()
export class StockService {
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
    private readonly itemQueryService: ItemQueryService,
    private readonly warehouseService: WarehouseService,
  ) {}

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
      // USE BASE QUANTITY FOR STOCK UPDATE
      const quantity = line.getBaseQty(); 
      const uomCode = line.getUomCode();

      switch (type) {
        case InvTransType.GOODS_RECEIPT:
          // Add stock to toWarehouse
          if (toWarehouseId) {
            const result = await this.addStock(toWarehouseId, itemSkuId, quantity, uomCode);
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
            const addResult = await this.addStock(toWarehouseId, itemSkuId, quantity, uomCode);
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
            const result = await this.addStock(fromWarehouseId, itemSkuId, quantity, uomCode);
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
    quantity: number,
    uomCode: string
  ): Promise<StockUpdateResult> {
  
    const warehouse = await this.stockRepository.findStock(warehouseId, itemSkuId);

    const previousQty = warehouse?.quantity ?? 0;
    const newQty = previousQty + quantity;

    await this.stockRepository.upsertStock(warehouseId, itemSkuId, newQty, uomCode);

    return { warehouseId, itemSkuId, previousQty, newQty };
  }

  /**
   * Remove stock from warehouse
   */
  private async removeStock(
    warehouseId: number,
    itemSkuId: number,
    quantity: number,
  ): Promise<StockUpdateResult> {
    const warehouseItem = await this.stockRepository.findStock(warehouseId, itemSkuId);

    const [sku, warehouse] = await Promise.all([
      this.itemQueryService.findSkuById(itemSkuId),
      this.warehouseService.findOne(warehouseId),
    ]);
    const skuCode = sku?.skuCode ?? `SKU#${itemSkuId}`;
    const warehouseCode = warehouse?.getCode() ?? `WH#${warehouseId}`;

    if (!warehouseItem) {
      throw new BadRequestException(`No stock found for SKU ${skuCode} in warehouse ${warehouseCode}`);
    }

    const previousQty = warehouseItem.quantity;

    if (previousQty < quantity) {
      throw new BadRequestException(`Insufficient stock for SKU ${skuCode} in warehouse ${warehouseCode}`);
    }

    const newQty = previousQty - quantity;

    await this.stockRepository.updateStockQuantity(warehouseId, itemSkuId, newQty);

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
    
    const warehouseItem = await this.stockRepository.findStock(warehouseId, itemSkuId);

    if (!warehouseItem) {
      return false;
    }

    const availableQty = warehouseItem.quantity - warehouseItem.reservedQty;
    return availableQty >= requiredQty;
  }

  /**
   * Get current stock level
   */
  async getStock(warehouseId: number, itemSkuId: number): Promise<number> {
    
    const warehouseItem = await this.stockRepository.findStock(warehouseId, itemSkuId);
    if (warehouseItem) {
      return warehouseItem.quantity;
    }

    return 0;
  }
}
