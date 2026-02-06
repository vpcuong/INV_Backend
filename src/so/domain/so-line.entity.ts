import { SOLineStatus } from '../enums/so-status.enum';
import {
  InvalidSOLineException,
  InvalidQuantityException,
  InvalidAmountException,
} from './exceptions/so-domain.exception';
import { RowMode } from '../../common/enums/row-mode.enum';

export interface SOLineConstructorData {
  id?: number;
  publicId?: string;
  soHeaderId?: number;
  lineNum: number;
  itemSkuId: number;
  description?: string | null;
  orderQty: number;
  uomCode: string;
  unitPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
  taxAmount?: number;
  totalAmount?: number; // Optional now, auto-calculated
  shippedQty?: number;
  needByDate?: Date | null;
  status?: string;
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
  private itemSkuId: number;
  private description?: string | null;
  private orderQty: number;
  private shippedQty: number;
  private uomCode: string;
  private unitPrice: number;
  private discountPercent: number;
  private discountAmount: number;
  private taxPercent: number;
  private taxAmount: number;
  private totalAmount: number;
  private needByDate?: Date | null;
  private status: string;
  private warehouseCode?: string | null;
  private lineNote?: string | null;
  private createdAt?: Date;
  private updatedAt?: Date;
  private rowMode: RowMode | null = null;

  constructor(data: SOLineConstructorData) {
    this.validateRequiredFields(data);
    
    // Initialize basic fields first to calculate pricing
    this.orderQty = data.orderQty;
    this.shippedQty = data.shippedQty ?? 0;
    this.unitPrice = data.unitPrice;

    // Handle Discount Logic: Validate Consistency or Auto-calculate
    const baseAmount = this.orderQty * this.unitPrice;
    const { percent: dPercent, amount: dAmount } = this.resolvePricingComponent(
      baseAmount,
      data.discountPercent,
      data.discountAmount,
      'Discount'
    );
    this.discountPercent = dPercent;
    this.discountAmount = dAmount;

    // Handle Tax Logic: Validate Consistency or Auto-calculate
    // Tax usually applies to Base - Discount (Taxable Amount)
    const taxableAmount = baseAmount - this.discountAmount;
    const { percent: tPercent, amount: tAmount } = this.resolvePricingComponent(
      taxableAmount,
      data.taxPercent,
      data.taxAmount,
      'Tax'
    );
    this.taxPercent = tPercent;
    this.taxAmount = tAmount;

    // Auto-calculate Total Amount (Ignore input totalAmount to ensure correctness)
    this.totalAmount = baseAmount - this.discountAmount + this.taxAmount;

    // Validate calculated total vs input total (if provided) mostly for sanity check
    if (data.totalAmount !== undefined && Math.abs(data.totalAmount - this.totalAmount) > 0.01) {
       // Optional: Log warning or throw error?
       // For strictness, we could throw. But data migration/rounding might cause issues.
       // Let's rely on our calculation being the source of truth.
    }

    this.id = data.id;
    this.publicId = data.publicId;
    this.soHeaderId = data.soHeaderId;
    this.lineNum = data.lineNum;
    this.itemSkuId = data.itemSkuId;
    this.description = data.description;
    this.uomCode = data.uomCode;
    this.needByDate = data.needByDate;
    this.status = data.status ?? SOLineStatus.OPEN;
    this.warehouseCode = data.warehouseCode;
    this.lineNote = data.lineNote;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    // New record (no id) → mark as NEW
    if (!data.id) {
      this.rowMode = RowMode.NEW;
    }
  }

  /**
   * Helper to resolve/validate Percent vs Amount
   */
  private resolvePricingComponent(
    base: number,
    percent: number | undefined,
    amount: number | undefined,
    fieldName: string
  ): { percent: number; amount: number } {
    let finalPercent = percent ?? 0;
    let finalAmount = amount ?? 0;

    // 1. Both provided: Validate Consistency
    if (percent !== undefined && amount !== undefined) {
      const calculatedAmount = (base * percent) / 100;
      // Allow small epsilon for floating point errors (e.g., 0.01)
      if (Math.abs(calculatedAmount - amount) > 0.02) {
        throw new InvalidAmountException(
          `${fieldName} Percent (${percent}%) and Amount (${amount}) do not match for base ${base}. Expected amount: ${calculatedAmount}`,
          amount
        );
      }
      // If consistent, trust the amount (often fixed rounding)
      finalAmount = amount;
      finalPercent = percent;
    }
    // 2. Only Percent provided: Calculate Amount
    else if (percent !== undefined) {
      finalPercent = percent;
      finalAmount = (base * percent) / 100;
    }
    // 3. Only Amount provided: Calculate Percent
    else if (amount !== undefined) {
      finalAmount = amount;
      finalPercent = base > 0 ? (amount / base) * 100 : 0;
    }
    
    // Sanity checks
    if (finalPercent < 0 || finalPercent > 100) {
       throw new InvalidAmountException(`${fieldName} percent must be between 0 and 100`, finalPercent);
    }
    if (finalAmount < 0) {
       throw new InvalidAmountException(`${fieldName} amount cannot be negative`, finalAmount);
    }

    return { percent: finalPercent, amount: finalAmount };
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
    if (!data.itemSkuId) {
      throw new InvalidSOLineException('Item SKU ID is required');
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
    if (!data.uomCode) {
      throw new InvalidSOLineException('UOM code is required');
    }
  }

  /**
   * Business rule: Update unit price
   * Keeps discount percent and tax percent constant, recalculates amounts
   */
  public updateUnitPrice(unitPrice: number): void {
    if (unitPrice < 0) {
      throw new InvalidAmountException('Unit price', unitPrice);
    }
    this.unitPrice = unitPrice;
    this.recalculateAll();
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
    this.updatedAt = new Date();
  }

  /**
   * Business rule: Update discount
   * Accepts percent, amount, or both (validated for consistency)
   */
  public updateDiscount(discountPercent?: number, discountAmount?: number): void {
    const baseAmount = this.orderQty * this.unitPrice;
    const res = this.resolvePricingComponent(baseAmount, discountPercent, discountAmount, 'Discount');
    this.discountPercent = res.percent;
    this.discountAmount = res.amount;
    this.recalculateTax();
    this.recalculateTotalAmount();
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
    this.updatedAt = new Date();
  }

  /**
   * Business rule: Update tax
   * Accepts percent, amount, or both (validated for consistency)
   */
  public updateTax(taxPercent?: number, taxAmount?: number): void {
    const baseAmount = this.orderQty * this.unitPrice;
    const taxableAmount = baseAmount - this.discountAmount;
    const res = this.resolvePricingComponent(taxableAmount, taxPercent, taxAmount, 'Tax');
    this.taxPercent = res.percent;
    this.taxAmount = res.amount;
    this.recalculateTotalAmount();
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
    this.updatedAt = new Date();
  }

  /**
   * Business rule: Update line quantity
   * Keeps percent constant, recalculates all amounts
   */
  public updateQuantity(orderQty: number): void {
    if (orderQty <= 0) {
      throw new InvalidQuantityException('Order quantity', orderQty);
    }
    this.orderQty = orderQty;
    this.recalculateAll();
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
    this.updatedAt = new Date();
  }

  /**
   * Business rule: Cancel line
   */
  public cancel(): void {
    this.status = SOLineStatus.CANCELLED;
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
    this.updatedAt = new Date();
  }

  /**
   * Business rule: Update shipped quantity (add delta)
   * Automatically updates status to CLOSED if fully shipped
   */
  public addShippedQty(delta: number): void {
    const newShippedQty = Number(this.shippedQty) + Number(delta);
    
    if (newShippedQty < 0) {
      throw new InvalidQuantityException('Shipped quantity cannot be negative', newShippedQty);
    }
    
    this.shippedQty = newShippedQty;
    
    // Auto-close line if fully shipped
    if (this.shippedQty >= this.orderQty && this.status !== SOLineStatus.CLOSED && this.status !== SOLineStatus.CANCELLED) {
      this.status = SOLineStatus.CLOSED;
    } else if (this.shippedQty > 0 && this.shippedQty < this.orderQty && this.status === SOLineStatus.OPEN) {
      this.status = SOLineStatus.PARTIAL;
    } else if (this.shippedQty === 0 && this.status === SOLineStatus.PARTIAL) {
      // Revert to OPEN if shipped qty goes back to 0 (e.g. cancellation of shipment)
      this.status = SOLineStatus.OPEN;
    }

    this.rowMode = this.rowMode ?? RowMode.UPDATED;
    this.updatedAt = new Date();
  }

  private recalculateDiscount(): void {
    const baseAmount = this.orderQty * this.unitPrice;
    this.discountAmount = (baseAmount * this.discountPercent) / 100;
  }

  private recalculateTax(): void {
    const baseAmount = this.orderQty * this.unitPrice;
    const taxableAmount = baseAmount - this.discountAmount;
    this.taxAmount = (taxableAmount * this.taxPercent) / 100;
  }

  private recalculateTotalAmount(): void {
    const subtotal = this.orderQty * this.unitPrice;
    this.totalAmount = subtotal - this.discountAmount + this.taxAmount;
  }

  private recalculateAll(): void {
    this.recalculateDiscount();
    this.recalculateTax();
    this.recalculateTotalAmount();
  }

  public setLineNum(lineNum: number): void {
    this.lineNum = lineNum;
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
    this.updatedAt = new Date();
  }

  public markDeleted(): void {
    this.rowMode = RowMode.DELETED;
  }

  public getRowMode(): RowMode | null {
    return this.rowMode;
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
  public getItemSkuId(): number {
    return this.itemSkuId;
  }
  public getDescription(): string | null | undefined {
    return this.description;
  }
  public getOrderQty(): number {
    return this.orderQty;
  }
  public getShippedQty(): number {
    return this.shippedQty;
  }
  public getUomCode(): string {
    return this.uomCode;
  }
  public getUnitPrice(): number {
    return this.unitPrice;
  }
  public getDiscountPercent(): number {
    return this.discountPercent;
  }
  public getDiscountAmount(): number {
    return this.discountAmount;
  }
  public getTaxPercent(): number {
    return this.taxPercent;
  }
  public getTaxAmount(): number {
    return this.taxAmount;
  }
  public getSubtotal(): number {
    return this.orderQty * this.unitPrice;
  }
  public getTotalAmount(): number {
    return this.totalAmount;
  }
  public getNeedByDate(): Date | null | undefined {
    return this.needByDate;
  }
  public getStatus(): string {
    return this.status;
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
      itemSkuId: this.itemSkuId,
      description: this.description,
      orderQty: this.orderQty,
      shippedQty: this.shippedQty,
      uomCode: this.uomCode,
      unitPrice: this.unitPrice,
      discountPercent: this.discountPercent,
      discountAmount: this.discountAmount,
      taxPercent: this.taxPercent,
      taxAmount: this.taxAmount,
      totalAmount: this.totalAmount,
      needByDate: this.needByDate,
      status: this.status,
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
      itemSkuId: data.itemSkuId,
      description: data.description,
      orderQty: Number(data.orderQty),
      shippedQty: data.shippedQty ? Number(data.shippedQty) : 0,
      uomCode: data.uomCode,
      unitPrice: Number(data.unitPrice),
      // For persistence load, assume data is correct. But constructor will re-calc/validate.
      discountPercent: data.discountPercent ? Number(data.discountPercent) : 0,
      discountAmount: data.discountAmount ? Number(data.discountAmount) : 0,
      taxPercent: data.taxPercent ? Number(data.taxPercent) : 0,
      taxAmount: data.taxAmount ? Number(data.taxAmount) : 0,
      totalAmount: Number(data.totalAmount),
      needByDate: data.needByDate,
      status: data.status,
      warehouseCode: data.warehouseCode,
      lineNote: data.lineNote,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
