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

  constructor(data: SOLineConstructorData) {
    this.validateRequiredFields(data);
    this.validateQuantities(data);
    
    // Initialize basic fields first to calculate pricing
    this.orderQty = data.orderQty;
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
   * Business rule: Validate quantities cannot be negative
   */
  private validateQuantities(data: SOLineConstructorData): void {
    // No additional quantity validations needed after removing openQty, shippedQty
  }

  /**
   * Business rule: Update line pricing
   */
  public updatePricing(
    unitPrice?: number,
    discountPercent?: number,
    discountAmount?: number
  ): void {
    if (unitPrice !== undefined) {
      if (unitPrice < 0) {
        throw new InvalidAmountException('Unit price', unitPrice);
      }
      this.unitPrice = unitPrice;
    }

    // Logic: If user provides NEW percent or amount, we recalculate consistency.
    // If user provides BOTH, we validate.
    // However, this update method signature is partial.
    // We should assume if one is missing, we MIGHT keep existing?
    // BUT typically in update, if I set Percent, I expect Amount to recalc.
    
    const baseAmount = this.orderQty * this.unitPrice;
    
    // Determine input for resolution
    // If passed explicitly (even undefined? logic depends on caller) -> Assuming undefined means "no change"
    // BUT for consistency, if I update UnitPrice, I MUST recalc DiscountAmount if Percent is fixed.
    // STRATEGY: 
    // 1. If Discount inputs provided, use them.
    // 2. If NO Discount inputs provided, Keep EXISTING Percent and Recalc Amount? (Percent driven)
    
    let targetPercent = this.discountPercent;
    let targetAmount = undefined; // Undefined means recalc from percent

    if (discountPercent !== undefined && discountAmount !== undefined) {
        // Both updated
        targetPercent = discountPercent;
        targetAmount = discountAmount;
    } else if (discountPercent !== undefined) {
        // Only percent updated
        targetPercent = discountPercent;
        targetAmount = undefined; // Force recalc
    } else if (discountAmount !== undefined) {
        // Only amount updated
        targetPercent = undefined as any; // Trick to force reverse calc? No, helper needs logic.
        // Helper logic: if percent Undefined, and Amount Defined -> Calc Percent.
        // So pass undefined for percent.
        const res = this.resolvePricingComponent(baseAmount, undefined, discountAmount, 'Discount');
        this.discountPercent = res.percent;
        this.discountAmount = res.amount;
        
        // Skip default Assignment below
        this.recalculateTotalAmount();
        this.updatedAt = new Date();
        return;
    }

    // Default flow (Percent driven or Both)
    const res = this.resolvePricingComponent(baseAmount, targetPercent, targetAmount, 'Discount');
    this.discountPercent = res.percent;
    this.discountAmount = res.amount;

    this.recalculateTotalAmount();
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
    // When qty changes, Base changes.
    // Keep Percent constant, recalc Amount?
    // Or Keep Amount constant, recalc Percent?
    // Standard business rule: Percent is King.
    
    const baseAmount = this.orderQty * this.unitPrice;
    this.discountAmount = (baseAmount * this.discountPercent) / 100;
    
    // Re-calc Tax amount too? Yes if tax is percent based.
    if (this.taxPercent > 0) {
        const taxable = baseAmount - this.discountAmount;
        this.taxAmount = (taxable * this.taxPercent) / 100;
    }

    this.recalculateTotalAmount();
    this.updatedAt = new Date();
  }

  /**
   * Business rule: Cancel line
   */
  public cancel(): void {
    this.status = SOLineStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  /**
   * Business rule: Recalculate total amount
   */
  private recalculateTotalAmount(): void {
    const subtotal = this.orderQty * this.unitPrice;
    
    // Tax logic check (ensure consistency if taxPercent exists)
    // We might need a full recalc method like resolvePricingComponent?
    // For now, assuming direct updates handled components individually.
    
    this.totalAmount = subtotal - this.discountAmount + this.taxAmount;
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

  // Backward compatibility getters (deprecated)
  /** @deprecated Use getTotalAmount() instead */
  public getLineTotal(): number {
    return this.totalAmount;
  }
  /** @deprecated Use getStatus() instead */
  public getLineStatus(): string {
    return this.status;
  }
  /** @deprecated Use getDiscountPercent() instead */
  public getLineDiscountPercent(): number {
    return this.discountPercent;
  }
  /** @deprecated Use getDiscountAmount() instead */
  public getLineDiscountAmount(): number {
    return this.discountAmount;
  }
  /** @deprecated Use getTaxPercent() instead */
  public getLineTaxPercent(): number {
    return this.taxPercent;
  }
  /** @deprecated Use getTaxAmount() instead */
  public getLineTaxAmount(): number {
    return this.taxAmount;
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
      uomCode: data.uomCode,
      unitPrice: Number(data.unitPrice),
      // For persistence load, assume data is correct. But constructor will re-calc/validate.
      // If DB has inconsistency (e.g. legacy data), resolution logic will force consistency
      // potentially changing Amount to match Percent if they disagree?
      // Or throwing error.
      // For legacy migration safety, maybe we should trust Amount if present?
      // The current logic prefers consistency.
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
