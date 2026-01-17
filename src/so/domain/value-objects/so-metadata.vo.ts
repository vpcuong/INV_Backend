export class SOMetadata {
  private constructor(
    private readonly channel: string | null,
    private readonly fobCode: string | null,
    private readonly shipViaCode: string | null,
    private readonly paymentTermCode: string | null,
    private readonly currencyCode: string | null,
    private readonly exchangeRate: number,
    private readonly customerPoNum: string | null,
    private readonly headerNote: string | null,
    private readonly internalNote: string | null,
    private readonly createdBy: string | null
  ) {
    this.validateMetadata();
  }

  private validateMetadata(): void {
    if (this.exchangeRate <= 0) {
      throw new Error('Exchange rate must be greater than 0');
    }
  }

  public static create(data: {
    channel?: string | null;
    fobCode?: string | null;
    shipViaCode?: string | null;
    paymentTermCode?: string | null;
    currencyCode?: string | null;
    exchangeRate?: number;
    customerPoNum?: string | null;
    headerNote?: string | null;
    internalNote?: string | null;
    createdBy?: string | null;
  }): SOMetadata {
    return new SOMetadata(
      data.channel || null,
      data.fobCode || null,
      data.shipViaCode || null,
      data.paymentTermCode || null,
      data.currencyCode || null,
      data.exchangeRate || 1,
      data.customerPoNum || null,
      data.headerNote || null,
      data.internalNote || null,
      data.createdBy || null
    );
  }

  // Business methods
  public updateShippingDetails(
    shipViaCode: string | null,
    fobCode: string | null
  ): SOMetadata {
    return new SOMetadata(
      this.channel,
      fobCode,
      shipViaCode,
      this.paymentTermCode,
      this.currencyCode,
      this.exchangeRate,
      this.customerPoNum,
      this.headerNote,
      this.internalNote,
      this.createdBy
    );
  }

  public updateNotes(
    headerNote: string | null,
    internalNote: string | null
  ): SOMetadata {
    return new SOMetadata(
      this.channel,
      this.fobCode,
      this.shipViaCode,
      this.paymentTermCode,
      this.currencyCode,
      this.exchangeRate,
      this.customerPoNum,
      headerNote,
      internalNote,
      this.createdBy
    );
  }

  public updateExchangeRate(exchangeRate: number): SOMetadata {
    return new SOMetadata(
      this.channel,
      this.fobCode,
      this.shipViaCode,
      this.paymentTermCode,
      this.currencyCode,
      exchangeRate,
      this.customerPoNum,
      this.headerNote,
      this.internalNote,
      this.createdBy
    );
  }

  // Getters
  public getChannel(): string | null {
    return this.channel;
  }

  public getFobCode(): string | null {
    return this.fobCode;
  }

  public getShipViaCode(): string | null {
    return this.shipViaCode;
  }

  public getPaymentTermCode(): string | null {
    return this.paymentTermCode;
  }

  public getCurrencyCode(): string | null {
    return this.currencyCode;
  }

  public getExchangeRate(): number {
    return this.exchangeRate;
  }

  public getCustomerPoNum(): string | null {
    return this.customerPoNum;
  }

  public getHeaderNote(): string | null {
    return this.headerNote;
  }

  public getInternalNote(): string | null {
    return this.internalNote;
  }

  public getCreatedBy(): string | null {
    return this.createdBy;
  }

  // Persistence methods
  public toPersistence(): any {
    return {
      channel: this.channel,
      fobCode: this.fobCode,
      shipViaCode: this.shipViaCode,
      paymentTermCode: this.paymentTermCode,
      currencyCode: this.currencyCode,
      exchangeRate: this.exchangeRate,
      customerPoNum: this.customerPoNum,
      headerNote: this.headerNote,
      internalNote: this.internalNote,
      createdBy: this.createdBy,
    };
  }

  public static fromPersistence(data: any): SOMetadata {
    return new SOMetadata(
      data.channel || null,
      data.fobCode || null,
      data.shipViaCode || null,
      data.paymentTermCode || null,
      data.currencyCode || null,
      data.exchangeRate || 1,
      data.customerPoNum || null,
      data.headerNote || null,
      data.internalNote || null,
      data.createdBy || null
    );
  }
}
