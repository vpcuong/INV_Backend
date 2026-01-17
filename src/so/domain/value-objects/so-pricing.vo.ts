import { InvalidAmountException } from '../exceptions/so-domain.exception';

export class SOPricing {
  private constructor(
    private readonly totalLineAmount: number,
    private readonly headerDiscount: number,
    private readonly headerDiscountPercent: number,
    private readonly lineDiscounts: number[],
    private readonly totalDiscount: number,
    private readonly taxes: number[],
    private readonly charges: number[],
    private readonly totalTax: number,
    private readonly totalCharges: number,
    private readonly orderTotal: number,
    private readonly openAmount: number
  ) {
    this.validateAmounts();
  }

  private validateAmounts(): void {
    if (this.totalLineAmount < 0) {
      throw new InvalidAmountException(
        'Total line amount',
        this.totalLineAmount
      );
    }
    if (this.headerDiscount < 0) {
      throw new InvalidAmountException('Header discount', this.headerDiscount);
    }
    if (this.totalDiscount < 0) {
      throw new InvalidAmountException('Total discount', this.totalDiscount);
    }
    if (this.totalTax < 0) {
      throw new InvalidAmountException('Total tax', this.totalTax);
    }
    if (this.totalCharges < 0) {
      throw new InvalidAmountException('Total charges', this.totalCharges);
    }
    if (this.orderTotal < 0) {
      throw new InvalidAmountException('Order total', this.orderTotal);
    }
  }

  public static create(data: {
    totalLineAmount: number;
    headerDiscount?: number;
    headerDiscountPercent?: number;
    lineDiscounts?: number[];
    taxes?: number[];
    charges?: number[];
    openAmount?: number;
  }): SOPricing {
    const {
      totalLineAmount,
      headerDiscount = 0,
      headerDiscountPercent = 0,
      lineDiscounts = [],
      taxes = [],
      charges = [],
      openAmount,
    } = data;

    const totalDiscount =
      headerDiscount +
      lineDiscounts.reduce((sum, discount) => sum + discount, 0);
    const totalTax = taxes.reduce((sum, tax) => sum + tax, 0);
    const totalCharges = charges.reduce((sum, charge) => sum + charge, 0);
    const orderTotal =
      totalLineAmount - totalDiscount + totalTax + totalCharges;
    const calculatedOpenAmount = openAmount ?? orderTotal;

    return new SOPricing(
      totalLineAmount,
      headerDiscount,
      headerDiscountPercent,
      lineDiscounts,
      totalDiscount,
      taxes,
      charges,
      totalTax,
      totalCharges,
      orderTotal,
      calculatedOpenAmount
    );
  }

  // Business methods
  public addLineDiscount(discount: number): SOPricing {
    if (discount < 0) {
      throw new InvalidAmountException('Line discount', discount);
    }

    return new SOPricing(
      this.totalLineAmount,
      this.headerDiscount,
      this.headerDiscountPercent,
      [...this.lineDiscounts, discount],
      this.totalDiscount + discount,
      this.taxes,
      this.charges,
      this.totalTax,
      this.totalCharges,
      this.orderTotal - discount,
      this.openAmount - discount
    );
  }

  public addHeaderDiscount(discount: number): SOPricing {
    if (discount < 0) {
      throw new InvalidAmountException('Header discount', discount);
    }

    return new SOPricing(
      this.totalLineAmount,
      this.headerDiscount + discount,
      this.headerDiscountPercent,
      this.lineDiscounts,
      this.totalDiscount + discount,
      this.taxes,
      this.charges,
      this.totalTax,
      this.totalCharges,
      this.orderTotal - discount,
      this.openAmount - discount
    );
  }

  public addTax(tax: number): SOPricing {
    if (tax < 0) {
      throw new InvalidAmountException('Tax', tax);
    }

    return new SOPricing(
      this.totalLineAmount,
      this.headerDiscount,
      this.headerDiscountPercent,
      this.lineDiscounts,
      this.totalDiscount,
      this.taxes,
      this.charges,
      this.totalTax + tax,
      this.totalCharges,
      this.orderTotal + tax,
      this.openAmount + tax
    );
  }

  public addCharge(charge: number): SOPricing {
    if (charge < 0) {
      throw new InvalidAmountException('Charge', charge);
    }

    return new SOPricing(
      this.totalLineAmount,
      this.headerDiscount,
      this.headerDiscountPercent,
      this.lineDiscounts,
      this.totalDiscount,
      this.taxes,
      this.charges,
      this.totalTax,
      this.totalCharges + charge,
      this.orderTotal + charge,
      this.openAmount + charge
    );
  }

  // Getters
  public getTotalLineAmount(): number {
    return this.totalLineAmount;
  }

  public getHeaderDiscount(): number {
    return this.headerDiscount;
  }

  public getLineDiscounts(): number[] {
    return [...this.lineDiscounts];
  }

  public getTotalDiscount(): number {
    return this.totalDiscount;
  }

  public getTaxes(): number[] {
    return [...this.taxes];
  }

  public getCharges(): number[] {
    return [...this.charges];
  }

  public getTotalTax(): number {
    return this.totalTax;
  }

  public getTotalCharges(): number {
    return this.totalCharges;
  }

  public getOrderTotal(): number {
    return this.orderTotal;
  }

  public getHeaderDiscountPercent(): number {
    return this.headerDiscountPercent;
  }

  public getOpenAmount(): number {
    return this.openAmount;
  }

  // Persistence methods
  public toPersistence(): any {
    return {
      totalLineAmount: this.totalLineAmount,
      headerDiscountAmount: this.headerDiscount,
      headerDiscountPercent: this.headerDiscountPercent,
      totalDiscount: this.totalDiscount,
      totalTax: this.totalTax,
      totalCharges: this.totalCharges,
      orderTotal: this.orderTotal,
      openAmount: this.openAmount,
    };
  }

  public static fromPersistence(data: any): SOPricing {
    return new SOPricing(
      data.totalLineAmount || 0,
      data.headerDiscountAmount || 0,
      data.headerDiscountPercent || 0,
      [], // Line discounts stored separately
      data.totalDiscount || 0,
      [], // Taxes stored separately
      [], // Charges stored separately
      data.totalTax || 0,
      data.totalCharges || 0,
      data.orderTotal || 0,
      data.openAmount || 0
    );
  }
}
