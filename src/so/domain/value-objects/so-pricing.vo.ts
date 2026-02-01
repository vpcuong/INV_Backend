import { InvalidAmountException } from '../exceptions/so-domain.exception';

export class SOPricing {
  private constructor(
    private readonly baseAmount: number,
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
  }): SOPricing {
    const {
      discountPercent = 0,
      discountAmount = 0,
      taxPercent = 0,
      taxAmount = 0,
      totalAmount = 0,
    } = data;

    // Derive baseAmount: Total = Base - Discount + Tax => Base = Total + Discount - Tax
    const baseAmount = totalAmount + discountAmount - taxAmount;

    return new SOPricing(
      baseAmount,
      discountPercent,
      discountAmount,
      taxPercent,
      taxAmount,
      totalAmount
    );
  }

  /**
   * Recalculate pricing based on a new base amount (sum of lines).
   * Preserves percentages and recalculates absolute amounts.
   * If percent is 0, keeps the fixed amount (capped at base).
   */
  public recalculate(baseAmount: number): SOPricing {
    if (baseAmount < 0) {
      throw new InvalidAmountException('Base amount', baseAmount);
    }

    let newDiscountAmount = this.discountAmount;

    if (this.discountPercent > 0) {
      newDiscountAmount = (baseAmount * this.discountPercent) / 100;
    } else if (newDiscountAmount > baseAmount) {
      newDiscountAmount = baseAmount;
    }

    const taxableAmount = baseAmount - newDiscountAmount;
    let newTaxAmount = this.taxAmount;

    if (this.taxPercent > 0) {
      newTaxAmount = (taxableAmount * this.taxPercent) / 100;
    }

    const newTotalAmount = baseAmount - newDiscountAmount + newTaxAmount;

    return new SOPricing(
      baseAmount,
      this.discountPercent,
      newDiscountAmount,
      this.taxPercent,
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

    let newTaxAmount = this.taxAmount;
    if (this.taxPercent > 0) {
      const newTaxable = this.baseAmount - amount;
      newTaxAmount = (newTaxable * this.taxPercent) / 100;
    }

    const newTotalAmount = this.baseAmount - amount + newTaxAmount;

    return new SOPricing(
      this.baseAmount,
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

    const newAmount = (this.baseAmount * percent) / 100;

    let newTaxAmount = this.taxAmount;
    if (this.taxPercent > 0) {
      const newTaxable = this.baseAmount - newAmount;
      newTaxAmount = (newTaxable * this.taxPercent) / 100;
    }

    const newTotalAmount = this.baseAmount - newAmount + newTaxAmount;

    return new SOPricing(
      this.baseAmount,
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

    const newTotalAmount = this.baseAmount - this.discountAmount + amount;
    const taxable = this.baseAmount - this.discountAmount;
    const newPercent = taxable > 0 ? (amount / taxable) * 100 : 0;

    return new SOPricing(
      this.baseAmount,
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

    const taxable = this.baseAmount - this.discountAmount;
    const newTaxAmount = (taxable * percent) / 100;
    const newTotalAmount = this.baseAmount - this.discountAmount + newTaxAmount;

    return new SOPricing(
      this.baseAmount,
      this.discountPercent,
      this.discountAmount,
      percent,
      newTaxAmount,
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

  public getTaxPercent(): number {
    return this.taxPercent;
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
      taxPercent: this.taxPercent,
      taxAmount: this.taxAmount,
      totalAmount: this.totalAmount,
    };
  }

  public static fromPersistence(data: any): SOPricing {
    const discountPercent = Number(data.discountPercent) || 0;
    const discountAmount = Number(data.discountAmount) || 0;
    const taxPercent = Number(data.taxPercent) || 0;
    const taxAmount = Number(data.taxAmount) || 0;
    const totalAmount = Number(data.totalAmount) || 0;
    // Derive baseAmount: Base = Total + Discount - Tax
    const baseAmount = totalAmount + discountAmount - taxAmount;

    return new SOPricing(
      baseAmount,
      discountPercent,
      discountAmount,
      taxPercent,
      taxAmount,
      totalAmount
    );
  }
}