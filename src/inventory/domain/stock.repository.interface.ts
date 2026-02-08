export interface StockData {
  quantity: number;
  reservedQty: number;
}

export interface IStockRepository {
  findStock(
    warehouseId: number,
    itemSkuId: number,
  ): Promise<StockData | null>;

  upsertStock(
    warehouseId: number,
    itemSkuId: number,
    quantity: number,
    uomCode: string,
  ): Promise<void>;

  createStock(
    warehouseId: number,
    itemSkuId: number,
    quantity: number,
    reservedQty: number,
    uomCode: string,
  ): Promise<void>;

  updateStockQuantity(
    warehouseId: number,
    itemSkuId: number,
    quantity: number,
  ): Promise<void>;
}
