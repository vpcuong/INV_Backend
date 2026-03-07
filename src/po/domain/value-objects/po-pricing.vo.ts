import { InvalidPOAmountException } from '../exceptions/po-domain.exception';

export class POPricing {
  private constructor(
    private readonly totalAmount: number,
    private readonly exchangeRate: number
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.totalAmount < 0) {
      throw new InvalidPOAmountException('Total amount', this.totalAmount);
    }
    if (this.exchangeRate < 0) {
      throw new InvalidPOAmountException('Exchange rate', this.exchangeRate);
    }
  }

  public static create(data: {
    totalAmount?: number;
    exchangeRate?: number;
  }): POPricing {
    return new POPricing(data.totalAmount ?? 0, data.exchangeRate ?? 1);
  }

  /**
   * Recalculate totalAmount from lines: SUM(lineAmount)
   */
  public recalculate(lines: { lineAmount: number }[]): POPricing {
    const total = lines.reduce((sum, l) => sum + l.lineAmount, 0);
    return new POPricing(total, this.exchangeRate);
  }

  public setExchangeRate(rate: number): POPricing {
    if (rate < 0) {
      throw new InvalidPOAmountException('Exchange rate', rate);
    }
    return new POPricing(this.totalAmount, rate);
  }

  public getTotalAmount(): number { return this.totalAmount; }
  public getExchangeRate(): number { return this.exchangeRate; }

  public toPersistence(): { totalAmount: number; exchangeRate: number } {
    return { totalAmount: this.totalAmount, exchangeRate: this.exchangeRate };
  }

  public static fromPersistence(data: { totalAmount: any; exchangeRate: any }): POPricing {
    return new POPricing(
      Number(data.totalAmount) || 0,
      Number(data.exchangeRate) || 1
    );
  }
}
