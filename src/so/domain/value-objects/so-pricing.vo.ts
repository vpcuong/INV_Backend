import { InvalidAmountException } from '../exceptions/so-domain.exception';

export class SOPricing {
  private constructor(
    private readonly baseAmount: number,
    private readonly discountPercent: number,
    private readonly discountAmount: number,
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
    taxAmount?: number;
    totalAmount?: number;
  }): SOPricing {
    const {
      discountPercent = 0,
      discountAmount = 0,
      taxAmount = 0,
      totalAmount = 0,
    } = data;

    // Derive baseAmount: Total = Base - Discount + Tax => Base = Total + Discount - Tax
    const baseAmount = totalAmount + discountAmount - taxAmount;

    return new SOPricing(
      baseAmount,
      discountPercent,
      discountAmount,
      taxAmount,
      totalAmount
    );
  }

  /**
   * Recalculate pricing based on a new base amount (sum of line totals).
   * Preserves discount percentage and recalculates discount amount.
   * taxAmount is passed in as the sum of line-level taxes.
   */
  public recalculate(baseAmount: number, totalLinesTaxAmount: number = 0): SOPricing {
    if (baseAmount < 0) {
      throw new InvalidAmountException('Base amount', baseAmount);
    }

    let newDiscountAmount = this.discountAmount;

    if (this.discountPercent > 0) {
      newDiscountAmount = (baseAmount * this.discountPercent) / 100;
    } else if (newDiscountAmount > baseAmount) {
      newDiscountAmount = baseAmount;
    }

    // Tax at header level = sum of line taxes (passed in)
    const newTaxAmount = totalLinesTaxAmount;
    const newTotalAmount = baseAmount - newDiscountAmount + newTaxAmount;

    return new SOPricing(
      baseAmount,
      this.discountPercent,
      newDiscountAmount,
      newTaxAmount,
      newTotalAmount
    );
  }

  public setDiscountAmount(amount: number): SOPricing {
    if (amount < 0) {
      throw new InvalidAmountException('Discount amount cannot be negative', amount);
    }
    if (amount > this.baseAmount) {
      throw new InvalidAmountException('Discount amount cannot exceed total order value', amount);
    }

    const newPercent = this.baseAmount > 0 ? (amount / this.baseAmount) * 100 : 0;
    // taxAmount stays the same (comes from lines, not affected by header discount)
    const newTotalAmount = this.baseAmount - amount + this.taxAmount;

    return new SOPricing(
      this.baseAmount,
      newPercent,
      amount,
      this.taxAmount,
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

    const newAmount = (this.baseAmount * percent) / 100;
    // taxAmount stays the same (comes from lines)
    const newTotalAmount = this.baseAmount - newAmount + this.taxAmount;

    return new SOPricing(
      this.baseAmount,
      percent,
      newAmount,
      this.taxAmount,
      newTotalAmount
    );
  }

  // Getters
  public getBaseAmount(): number {
    return this.baseAmount;
  }

  public getDiscountPercent(): number {
    return this.discountPercent;
  }

  public getDiscountAmount(): number {
    return this.discountAmount;
  }

  public getTaxAmount(): number {
    return this.taxAmount;
  }

  public getTotalAmount(): number {
    return this.totalAmount;
  }

  // Persistence methods - matches Prisma schema exactly
  public toPersistence(): any {
    return {
      discountPercent: this.discountPercent,
      discountAmount: this.discountAmount,
      taxAmount: this.taxAmount,
      totalAmount: this.totalAmount,
    };
  }

  public static fromPersistence(data: any): SOPricing {
    const discountPercent = Number(data.discountPercent) || 0;
    const discountAmount = Number(data.discountAmount) || 0;
    const taxAmount = Number(data.taxAmount) || 0;
    const totalAmount = Number(data.totalAmount) || 0;
    // Derive baseAmount: Base = Total + Discount - Tax
    const baseAmount = totalAmount + discountAmount - taxAmount;

    return new SOPricing(
      baseAmount,
      discountPercent,
      discountAmount,
      taxAmount,
      totalAmount
    );
  }
}