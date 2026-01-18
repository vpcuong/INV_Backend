import { SOLineStatus } from '../enums/so-status.enum';
import {
  InvalidSOLineException,
  InvalidQuantityException,
  InvalidAmountException,
} from './exceptions/so-domain.exception';

export interface SOLineConstructorData {
  id?: number;
  publicId?: string;
  soHeaderId?: number;
  lineNum: number;
  itemId?: number | null;
  itemSkuId?: number | null;
  itemCode?: string | null;
  description?: string | null;
  orderQty: number;
  uomCode?: string | null;
  unitPrice: number;
  lineDiscountPercent?: number | null;
  lineDiscountAmount?: number | null;
  lineTaxPercent?: number | null;
  lineTaxAmount?: number | null;
  lineTotal: number;
  needByDate?: Date | null;
  lineStatus?: string;
  openQty?: number | null;
  shippedQty?: number | null;
  warehouseCode?: string | null;
  lineNote?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SOLine {
  private id?: number;
  private publicId?: string;
  private soHeaderId?: number;
  private lineNum: number;
  private itemId?: number | null;
  private itemSkuId?: number | null;
  private itemCode?: string | null;
  private description?: string | null;
  private orderQty: number;
  private uomCode?: string | null;
  private unitPrice: number;
  private lineDiscountPercent?: number | null;
  private lineDiscountAmount?: number | null;
  private lineTaxPercent?: number | null;
  private lineTaxAmount?: number | null;
  private lineTotal: number;
  private needByDate?: Date | null;
  private lineStatus: string;
  private openQty?: number | null;
  private shippedQty?: number | null;
  private warehouseCode?: string | null;
  private lineNote?: string | null;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(data: SOLineConstructorData) {
    this.validateRequiredFields(data);
    this.validateQuantities(data);
    this.validateAmounts(data);

    this.id = data.id;
    this.publicId = data.publicId;
    this.soHeaderId = data.soHeaderId;
    this.lineNum = data.lineNum;
    this.itemId = data.itemId;
    this.itemSkuId = data.itemSkuId;
    this.itemCode = data.itemCode;
    this.description = data.description;
    this.orderQty = data.orderQty;
    this.uomCode = data.uomCode;
    this.unitPrice = data.unitPrice;
    this.lineDiscountPercent = data.lineDiscountPercent ?? 0;
    this.lineDiscountAmount = data.lineDiscountAmount ?? 0;
    this.lineTaxPercent = data.lineTaxPercent ?? 0;
    this.lineTaxAmount = data.lineTaxAmount ?? 0;
    this.lineTotal = data.lineTotal;
    this.needByDate = data.needByDate;
    this.lineStatus = data.lineStatus ?? SOLineStatus.OPEN;
    this.openQty = data.openQty ?? data.orderQty;
    this.shippedQty = data.shippedQty ?? 0;
    this.warehouseCode = data.warehouseCode;
    this.lineNote = data.lineNote;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Business rule: Validate required fields
   */
  private validateRequiredFields(data: SOLineConstructorData): void {
    if (!data.lineNum || data.lineNum <= 0) {
      throw new InvalidSOLineException(
        'Line number is required and must be greater than 0'
      );
    }
    if (!data.orderQty || data.orderQty <= 0) {
      throw new InvalidQuantityException('Order quantity', data.orderQty);
    }
    if (
      data.unitPrice === undefined ||
      data.unitPrice === null ||
      data.unitPrice < 0
    ) {
      throw new InvalidAmountException('Unit price', data.unitPrice);
    }
  }

  /**
   * Business rule: Validate quantities cannot be negative
   */
  private validateQuantities(data: SOLineConstructorData): void {
    if (
      data.openQty !== undefined &&
      data.openQty !== null &&
      data.openQty < 0
    ) {
      throw new InvalidQuantityException('Open quantity', data.openQty);
    }
    if (
      data.shippedQty !== undefined &&
      data.shippedQty !== null &&
      data.shippedQty < 0
    ) {
      throw new InvalidQuantityException('Shipped quantity', data.shippedQty);
    }
  }

  /**
   * Business rule: Validate amounts cannot be negative
   */
  private validateAmounts(data: SOLineConstructorData): void {
    if (
      data.lineDiscountAmount !== undefined &&
      data.lineDiscountAmount !== null &&
      data.lineDiscountAmount < 0
    ) {
      throw new InvalidAmountException(
        'Line discount amount',
        data.lineDiscountAmount
      );
    }
    if (
      data.lineTaxAmount !== undefined &&
      data.lineTaxAmount !== null &&
      data.lineTaxAmount < 0
    ) {
      throw new InvalidAmountException('Line tax amount', data.lineTaxAmount);
    }
  }

  /**
   * Business rule: Update line pricing
   */
  public updatePricing(
    unitPrice?: number,
    lineDiscountPercent?: number | null,
    lineDiscountAmount?: number | null
  ): void {
    if (unitPrice !== undefined) {
      if (unitPrice < 0) {
        throw new InvalidAmountException('Unit price', unitPrice);
      }
      this.unitPrice = unitPrice;
    }
    if (lineDiscountPercent !== undefined) {
      this.lineDiscountPercent = lineDiscountPercent;
    }
    if (lineDiscountAmount !== undefined) {
      if (lineDiscountAmount !== null && lineDiscountAmount < 0) {
        throw new InvalidAmountException(
          'Line discount amount',
          lineDiscountAmount
        );
      }
      this.lineDiscountAmount = lineDiscountAmount;
    }
    this.recalculateLineTotal();
    this.updatedAt = new Date();
  }

  /**
   * Business rule: Update line quantity
   */
  public updateQuantity(orderQty: number): void {
    if (orderQty <= 0) {
      throw new InvalidQuantityException('Order quantity', orderQty);
    }
    this.orderQty = orderQty;
    this.openQty = orderQty - (this.shippedQty ?? 0);
    this.recalculateLineTotal();
    this.updatedAt = new Date();
  }

  /**
   * Business rule: Ship quantity
   */
  public ship(quantity: number): void {
    if (quantity <= 0) {
      throw new InvalidQuantityException('Ship quantity', quantity);
    }
    if (quantity > (this.openQty ?? 0)) {
      throw new InvalidSOLineException(
        `Cannot ship ${quantity}. Open quantity is ${this.openQty}`
      );
    }

    this.shippedQty = (this.shippedQty ?? 0) + quantity;
    this.openQty = (this.openQty ?? 0) - quantity;

    if (this.openQty === 0) {
      this.lineStatus = SOLineStatus.CLOSED;
    } else {
      this.lineStatus = SOLineStatus.PARTIAL;
    }

    this.updatedAt = new Date();
  }

  /**
   * Business rule: Cancel line
   */
  public cancel(): void {
    this.lineStatus = SOLineStatus.CANCELLED;
    this.openQty = 0;
    this.updatedAt = new Date();
  }

  /**
   * Business rule: Recalculate line total
   */
  private recalculateLineTotal(): void {
    const subtotal = this.orderQty * this.unitPrice;
    const discount = this.lineDiscountAmount ?? 0;
    const tax = this.lineTaxAmount ?? 0;
    this.lineTotal = subtotal - discount + tax;
  }

  // Getters
  public getId(): number | undefined {
    return this.id;
  }
  public getPublicId(): string | undefined {
    return this.publicId;
  }
  public getSOHeaderId(): number | undefined {
    return this.soHeaderId;
  }
  public getLineNum(): number {
    return this.lineNum;
  }
  public getItemId(): number | null | undefined {
    return this.itemId;
  }
  public getItemSkuId(): number | null | undefined {
    return this.itemSkuId;
  }
  public getItemCode(): string | null | undefined {
    return this.itemCode;
  }
  public getDescription(): string | null | undefined {
    return this.description;
  }
  public getOrderQty(): number {
    return this.orderQty;
  }
  public getUomCode(): string | null | undefined {
    return this.uomCode;
  }
  public getUnitPrice(): number {
    return this.unitPrice;
  }
  public getLineDiscountPercent(): number | null | undefined {
    return this.lineDiscountPercent;
  }
  public getLineDiscountAmount(): number | null | undefined {
    return this.lineDiscountAmount;
  }
  public getLineTaxPercent(): number | null | undefined {
    return this.lineTaxPercent;
  }
  public getLineTaxAmount(): number | null | undefined {
    return this.lineTaxAmount;
  }
  public getLineTotal(): number {
    return this.lineTotal;
  }
  public getNeedByDate(): Date | null | undefined {
    return this.needByDate;
  }
  public getLineStatus(): string {
    return this.lineStatus;
  }
  public getOpenQty(): number | null | undefined {
    return this.openQty;
  }
  public getShippedQty(): number | null | undefined {
    return this.shippedQty;
  }
  public getWarehouseCode(): string | null | undefined {
    return this.warehouseCode;
  }
  public getLineNote(): string | null | undefined {
    return this.lineNote;
  }
  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }
  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  /**
   * Convert to persistence model (for Prisma)
   */
  public toPersistence(): any {
    return {
      id: this.id,
      publicId: this.publicId,
      soHeaderId: this.soHeaderId,
      lineNum: this.lineNum,
      itemId: this.itemId,
      itemSkuId: this.itemSkuId,
      itemCode: this.itemCode,
      description: this.description,
      orderQty: this.orderQty,
      uomCode: this.uomCode,
      unitPrice: this.unitPrice,
      lineDiscountPercent: this.lineDiscountPercent,
      lineDiscountAmount: this.lineDiscountAmount,
      lineTaxPercent: this.lineTaxPercent,
      lineTaxAmount: this.lineTaxAmount,
      lineTotal: this.lineTotal,
      needByDate: this.needByDate,
      lineStatus: this.lineStatus,
      openQty: this.openQty,
      shippedQty: this.shippedQty,
      warehouseCode: this.warehouseCode,
      lineNote: this.lineNote,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create domain entity from persistence model
   */
  public static fromPersistence(data: any): SOLine {
    return new SOLine({
      id: data.id,
      publicId: data.publicId,
      soHeaderId: data.soHeaderId,
      lineNum: data.lineNum,
      itemId: data.itemId,
      itemSkuId: data.itemSkuId,
      itemCode: data.itemCode,
      description: data.description,
      orderQty: data.orderQty,
      uomCode: data.uomCode,
      unitPrice: data.unitPrice,
      lineDiscountPercent: data.lineDiscountPercent,
      lineDiscountAmount: data.lineDiscountAmount,
      lineTaxPercent: data.lineTaxPercent,
      lineTaxAmount: data.lineTaxAmount,
      lineTotal: data.lineTotal,
      needByDate: data.needByDate,
      lineStatus: data.lineStatus,
      openQty: data.openQty,
      shippedQty: data.shippedQty,
      warehouseCode: data.warehouseCode,
      lineNote: data.lineNote,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
