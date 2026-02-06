import { RowMode } from '../../common/enums/row-mode.enum';
import {
  InsufficientInventoryException,
  InvalidQuantityException,
} from './exceptions/warehouse-domain.exception';

export interface WarehouseItemConstructorData {
  id?: number;
  warehouseId: number;
  itemSkuId: number;
  quantity?: number;
  reservedQty?: number;
  uomCode?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateWarehouseItemData {
  quantity?: number;
  reservedQty?: number;
  uomCode?: string | null;
}

export class WarehouseItem {
  private id?: number;
  private warehouseId: number;
  private itemSkuId: number;
  private quantity: number;
  private reservedQty: number;
  private uomCode?: string | null;
  private createdAt: Date;
  private updatedAt: Date;
  private rowMode: RowMode | null = null;

  constructor(data: WarehouseItemConstructorData) {
    this.validate(data);

    this.id = data.id;
    this.warehouseId = data.warehouseId;
    this.itemSkuId = data.itemSkuId;
    this.quantity = data.quantity ?? 0;
    this.reservedQty = data.reservedQty ?? 0;
    this.uomCode = data.uomCode;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  private validate(data: WarehouseItemConstructorData): void {
    if (data.quantity !== undefined && data.quantity < 0) {
      throw new InvalidQuantityException('quantity', data.quantity);
    }
    if (data.reservedQty !== undefined && data.reservedQty < 0) {
      throw new InvalidQuantityException('reservedQty', data.reservedQty);
    }
  }

  // Domain methods
  public getAvailableQty(): number {
    return this.quantity - this.reservedQty;
  }

  /**
   * Adjust quantity (normalized base qty)
   * @param adjustment Delta amount (in base UoM)
   */
  public adjustQuantity(adjustment: number): void {
    const newQty = this.quantity + adjustment;
    if (newQty < 0) {
      throw new InsufficientInventoryException(
        this.warehouseId,
        this.itemSkuId,
        Math.abs(adjustment),
        this.quantity,
      );
    }
    this.quantity = newQty;
    this.updatedAt = new Date();
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
  }

  public setQuantity(quantity: number): void {
    if (quantity < 0) {
      throw new InvalidQuantityException('quantity', quantity);
    }
    if (quantity < this.reservedQty) {
      throw new InsufficientInventoryException(
        this.warehouseId,
        this.itemSkuId,
        this.reservedQty,
        quantity,
      );
    }
    this.quantity = quantity;
    this.updatedAt = new Date();
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
  }

  public setUomCode(uomCode: string): void {
      this.uomCode = uomCode;
      this.updatedAt = new Date();
      this.rowMode = this.rowMode ?? RowMode.UPDATED;
  }

  public reserve(qty: number): void {
    if (qty < 0) {
      throw new InvalidQuantityException('reserve quantity', qty);
    }
    if (qty > this.getAvailableQty()) {
      throw new InsufficientInventoryException(
        this.warehouseId,
        this.itemSkuId,
        qty,
        this.getAvailableQty(),
      );
    }
    this.reservedQty += qty;
    this.updatedAt = new Date();
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
  }

  public releaseReservation(qty: number): void {
    if (qty < 0) {
      throw new InvalidQuantityException('release quantity', qty);
    }
    this.reservedQty = Math.max(0, this.reservedQty - qty);
    this.updatedAt = new Date();
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
  }

  // Getters
  public getId(): number | undefined {
    return this.id;
  }

  public getWarehouseId(): number {
    return this.warehouseId;
  }

  public getItemSkuId(): number {
    return this.itemSkuId;
  }

  public getQuantity(): number {
    return this.quantity;
  }

  public getReservedQty(): number {
    return this.reservedQty;
  }

  public getUomCode(): string | null | undefined {
    return this.uomCode;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public getRowMode(): RowMode | null {
    return this.rowMode;
  }

  public markAsNew(): void {
    this.rowMode = RowMode.NEW;
  }

  public markUpdated(): void {
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
  }

  public markDeleted(): void {
    this.rowMode = RowMode.DELETED;
  }

  // Persistence methods
  public toPersistence(): any {
    return {
      id: this.id,
      warehouseId: this.warehouseId,
      itemSkuId: this.itemSkuId,
      quantity: this.quantity,
      reservedQty: this.reservedQty,
      uomCode: this.uomCode,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPersistence(data: any): WarehouseItem {
    return new WarehouseItem({
      id: data.id,
      warehouseId: data.warehouseId,
      itemSkuId: data.itemSkuId,
      quantity: Number(data.quantity),
      reservedQty: Number(data.reservedQty),
      uomCode: data.uomCode,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
