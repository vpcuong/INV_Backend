export class SOMetadata {
  private constructor(
    private readonly channel: string | null,
    private readonly fobCode: string | null,
    private readonly shipViaCode: string | null,
    private readonly paymentTermCode: string | null,
    private readonly currencyCode: string | null,
    //private readonly exchangeRate: number,
    private readonly customerPoNum: string | null,
    private readonly headerNote: string | null,
    private readonly internalNote: string | null,
    private readonly createdBy: string | null
  ) {
    this.validateMetadata();
  }

  private validateMetadata(): void {
    //if (this.exchangeRate <= 0) {
    //  throw new Error('Exchange rate must be greater than 0');
    //}
  }

  public static create(data: {
    channel?: string | null;
    fobCode?: string | null;
    shipViaCode?: string | null;
    paymentTermCode?: string | null;
    currencyCode?: string | null;
    //exchangeRate?: number;
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
      //data.exchangeRate || 1,
      data.customerPoNum || null,
      data.headerNote || null,
      data.internalNote || null,
      data.createdBy || null
    );
  }

  // Business methods
  public update(data: {
    channel?: string | null;
    fobCode?: string | null;
    shipViaCode?: string | null;
    paymentTermCode?: string | null;
    currencyCode?: string | null;
    exchangeRate?: number;
    customerPoNum?: string | null;
    headerNote?: string | null;
    internalNote?: string | null;
  }): SOMetadata {
    return new SOMetadata(
      data.channel !== undefined ? data.channel : this.channel,
      data.fobCode !== undefined ? data.fobCode : this.fobCode,
      data.shipViaCode !== undefined ? data.shipViaCode : this.shipViaCode,
      data.paymentTermCode !== undefined
        ? data.paymentTermCode
        : this.paymentTermCode,
      data.currencyCode !== undefined ? data.currencyCode : this.currencyCode,
      // data.exchangeRate !== undefined ? data.exchangeRate : this.exchangeRate,
      data.customerPoNum !== undefined
        ? data.customerPoNum
        : this.customerPoNum,
      data.headerNote !== undefined ? data.headerNote : this.headerNote,
      data.internalNote !== undefined ? data.internalNote : this.internalNote,
      this.createdBy
    );
  }

  public updateShippingDetails(
    shipViaCode: string | null,
    fobCode: string | null
  ): SOMetadata {
    return this.update({ shipViaCode, fobCode });
  }

  public updateNotes(
    headerNote: string | null,
    internalNote: string | null
  ): SOMetadata {
    return this.update({ headerNote, internalNote });
  }

  public updateExchangeRate(exchangeRate: number): SOMetadata {
    return this.update({ exchangeRate });
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

  // public getExchangeRate(): number {
  //   return this.exchangeRate;
  // }

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
      //exchangeRate: this.exchangeRate,
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
      //Number(data.exchangeRate) || 1,
      data.customerPoNum || null,
      data.headerNote || null,
      data.internalNote || null,
      data.createdBy || null
    );
  }
}
