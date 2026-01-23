import { InvalidAmountException } from '../exceptions/so-domain.exception';

export class SOPricing {
  private constructor(
    private readonly discountPercent: number,
    private readonly discountAmount: number,
    private readonly taxPercent: number,
    private readonly taxAmount: number,
    private readonly totalAmount: number
  ) {
    this.validateAmounts();
  }

  private validateAmounts(): void {
    if (this.discountPercent < 0 || this.discountPercent > 100) {
      throw new InvalidAmountException(
        'Discount percent must be between 0 and 100',
        this.discountPercent
      );
    }
    if (this.discountAmount < 0) {
      throw new InvalidAmountException('Discount amount', this.discountAmount);
    }
    if (this.taxPercent < 0 || this.taxPercent > 100) {
      throw new InvalidAmountException(
        'Tax percent must be between 0 and 100',
        this.taxPercent
      );
    }
    if (this.taxAmount < 0) {
      throw new InvalidAmountException('Tax amount', this.taxAmount);
    }
    if (this.totalAmount < 0) {
      throw new InvalidAmountException('Total amount', this.totalAmount);
    }
  }

  public static create(data: {
    discountPercent?: number;
    discountAmount?: number;
    taxPercent?: number;
    taxAmount?: number;
    totalAmount?: number;
    // Legacy support
    totalLineAmount?: number;
    headerDiscount?: number;
  }): SOPricing {
    const {
      discountPercent = 0,
      discountAmount = 0,
      taxPercent = 0,
      taxAmount = 0,
      totalAmount = 0,
      // Legacy fields
      totalLineAmount,
      headerDiscount,
    } = data;

    let finalDiscountAmount = discountAmount;
    if (discountAmount === 0 && headerDiscount) {
      finalDiscountAmount = headerDiscount;
    }

    let finalTotalAmount = totalAmount;
    if (totalAmount === 0 && totalLineAmount) {
      finalTotalAmount = totalLineAmount - finalDiscountAmount + taxAmount;
    }

    return new SOPricing(
      discountPercent,
      finalDiscountAmount,
      taxPercent,
      taxAmount,
      finalTotalAmount
    );
  }

  /**
   * Recalculate pricing based on a new base amount (sum of lines)
   * This preserves the PERCENTAGES if they are set, recalculating the absolute amounts.
   * If amounts were fixed, it keeps them fixed? -> Usually business rule assumes Percent wins.
   * Let's assume: If Percent > 0, recalculate Amount. If Percent == 0, keep Amount fixed (unless Amount > Base).
   */
  public recalculate(baseAmount: number): SOPricing {
    if (baseAmount < 0) {
      throw new InvalidAmountException('Base amount', baseAmount);
    }

    let newDiscountAmount = this.discountAmount;
    
    // Rule: Recalculate discount amount if percent is set
    if (this.discountPercent > 0) {
      newDiscountAmount = (baseAmount * this.discountPercent) / 100;
    } else {
      // Validation: Discount cannot exceed base
      if (newDiscountAmount > baseAmount) {
         // Cap discount or throw error? Capping is safer for recalculations
         newDiscountAmount = baseAmount; 
      }
    }

    // Tax typically applies to (Base - Discount)
    const taxableAmount = baseAmount - newDiscountAmount;
    let newTaxAmount = this.taxAmount;

    // Rule: Recalculate tax amount if percent is set
    if (this.taxPercent > 0) {
      newTaxAmount = (taxableAmount * this.taxPercent) / 100;
    }
    
    // Formula: Total = Base - Discount + Tax
    const newTotalAmount = baseAmount - newDiscountAmount + newTaxAmount;

    return new SOPricing(
      this.discountPercent,
      newDiscountAmount,
      this.taxPercent,
      newTaxAmount,
      newTotalAmount
    );
  }

  // Business methods
  /**
   * Set discount by amount - auto-calculates discountPercent based on current total structure
   * Effectively we need the Back-Calculated Base to do this properly.
   * Base = Total - Tax + Discount
   */
  public setDiscountAmount(amount: number): SOPricing {
    if (amount < 0) {
      throw new InvalidAmountException('Discount amount cannot be negative', amount);
    }

    // Reverse calculate base from current state
    // Current Total = Base - currDiscount + currTax
    // Base = Current Total + currDiscount - currTax
    const currentBase = this.totalAmount + this.discountAmount - this.taxAmount;
    
    if (amount > currentBase) {
       throw new InvalidAmountException('Discount amount cannot exceed total order value', amount);
    }

    const newPercent = currentBase > 0 ? (amount / currentBase) * 100 : 0;
    
    // Re-calculate Tax if it's percent based?
    // If we change discount, taxable amount changes.
    // If tax is fixed amount, keep it. If percent, recalc.
    let newTaxAmount = this.taxAmount;
    if (this.taxPercent > 0) {
        const newTaxable = currentBase - amount;
        newTaxAmount = (newTaxable * this.taxPercent) / 100;
    }

    const newTotalAmount = currentBase - amount + newTaxAmount;

    return new SOPricing(
      newPercent,
      amount,
      this.taxPercent,
      newTaxAmount,
      newTotalAmount
    );
  }

  public setDiscountPercent(percent: number): SOPricing {
    if (percent < 0 || percent > 100) {
      throw new InvalidAmountException(
        'Discount percent must be between 0 and 100',
        percent
      );
    }

    const currentBase = this.totalAmount + this.discountAmount - this.taxAmount;
    const newAmount = (currentBase * percent) / 100;
    
    // Recalc tax
    let newTaxAmount = this.taxAmount;
    if (this.taxPercent > 0) {
        const newTaxable = currentBase - newAmount;
        newTaxAmount = (newTaxable * this.taxPercent) / 100;
    }

    const newTotalAmount = currentBase - newAmount + newTaxAmount;

    return new SOPricing(
      percent,
      newAmount,
      this.taxPercent,
      newTaxAmount,
      newTotalAmount
    );
  }

  public setTaxAmount(amount: number): SOPricing {
    if (amount < 0) {
      throw new InvalidAmountException('Tax amount cannot be negative', amount);
    }

    const currentBase = this.totalAmount + this.discountAmount - this.taxAmount;
    // Discount stays same
    const newTotalAmount = currentBase - this.discountAmount + amount;
    
    // Calc percent
    const taxable = currentBase - this.discountAmount;
    const newPercent = taxable > 0 ? (amount / taxable) * 100 : 0;

    return new SOPricing(
      this.discountPercent,
      this.discountAmount,
      newPercent,
      amount,
      newTotalAmount
    );
  }

  public setTaxPercent(percent: number): SOPricing {
    if (percent < 0 || percent > 100) {
      throw new InvalidAmountException(
        'Tax percent must be between 0 and 100',
        percent
      );
    }

    const currentBase = this.totalAmount + this.discountAmount - this.taxAmount;
    const taxable = currentBase - this.discountAmount;
    const newTaxAmount = (taxable * percent) / 100;
    const newTotalAmount = taxable + newTaxAmount;

    return new SOPricing(
      this.discountPercent,
      this.discountAmount,
      percent,
      newTaxAmount,
      newTotalAmount
    );
  }

  // Getters
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

  // Legacy compatibility getters
  /** @deprecated Use getDiscountAmount() instead */
  public getHeaderDiscount(): number {
    return this.discountAmount;
  }

  /** @deprecated Use getDiscountPercent() instead */
  public getHeaderDiscountPercent(): number {
    return this.discountPercent;
  }

  /** @deprecated Use getTotalAmount() instead */
  public getOrderTotal(): number {
    return this.totalAmount;
  }

  /** @deprecated Not stored in new schema */
  public getTotalLineAmount(): number {
    // Current Base
    return this.totalAmount + this.discountAmount - this.taxAmount;
  }

  /** @deprecated Not stored in new schema */
  public getTotalDiscount(): number {
    return this.discountAmount;
  }

  /** @deprecated Not stored in new schema */
  public getTotalTax(): number {
    return this.taxAmount;
  }

  /** @deprecated Not stored in new schema */
  public getTotalCharges(): number {
    return 0;
  }

  /** @deprecated Not stored in new schema */
  public getOpenAmount(): number {
    return this.totalAmount;
  }

  /** @deprecated Not stored in new schema */
  public getLineDiscounts(): number[] {
    return [];
  }

  /** @deprecated Not stored in new schema */
  public getTaxes(): number[] {
    return [];
  }

  /** @deprecated Not stored in new schema */
  public getCharges(): number[] {
    return [];
  }

  // Persistence methods - matches Prisma schema exactly
  public toPersistence(): any {
    return {
      discountPercent: this.discountPercent,
      discountAmount: this.discountAmount,
      taxPercent: this.taxPercent,
      taxAmount: this.taxAmount,
      totalAmount: this.totalAmount,
    };
  }

  public static fromPersistence(data: any): SOPricing {
    return new SOPricing(
      Number(data.discountPercent) || 0,
      Number(data.discountAmount) || 0,
      Number(data.taxPercent) || 0,
      Number(data.taxAmount) || 0,
      Number(data.totalAmount) || 0
    );
  }
}
