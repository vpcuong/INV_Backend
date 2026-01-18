import { SOStatus } from './value-objects/so-status.vo';
import { SOPricing } from './value-objects/so-pricing.vo';
import { SOAddresses } from './value-objects/so-addresses.vo';
import { SOMetadata } from './value-objects/so-metadata.vo';
import { InvalidSOException } from './exceptions/so-domain.exception';
import { SOLine } from './so-line.entity';

export interface SOHeaderConstructorData {
  id?: number;
  publicId?: string;
  soNum: string;
  customerId: number;
  orderDate?: Date;
  requestDate?: Date | null;
  needByDate?: Date | null;
  orderStatus?: string;
  totalLineAmount?: number;
  headerDiscount?: number;
  headerDiscountPercent?: number;
  lineDiscounts?: number[];
  taxes?: number[];
  charges?: number[];
  openAmount?: number;
  billingAddressId?: number | null;
  shippingAddressId?: number | null;
  channel?: string | null;
  fobCode?: string | null;
  shipViaCode?: string | null;
  paymentTermCode?: string | null;
  currencyCode?: string | null;
  exchangeRate?: number;
  customerPoNum?: string | null;
  headerNote?: string | null;
  internalNote?: string | null;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  lines?: SOLine[];
}

export class SOHeader {
  private constructor(
    private readonly soNum: string,
    private readonly customerId: number,
    private readonly orderDate: Date,
    private readonly requestDate: Date | null,
    private readonly needByDate: Date | null,
    private readonly status: SOStatus,
    private readonly pricing: SOPricing,
    private readonly addresses: SOAddresses,
    private readonly metadata: SOMetadata,
    private readonly lines: SOLine[],
    private readonly createdBy: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
    private readonly id?: number,
    private readonly publicId?: string
  ) {
    this.validateBasicData();
  }

  private validateBasicData(): void {
    if (!this.soNum || this.soNum.trim() === '') {
      throw new InvalidSOException('SO number is required');
    }
    if (!this.customerId) {
      throw new InvalidSOException('Customer is required');
    }
  }

  public static create(data: SOHeaderConstructorData): SOHeader {
    const status = SOStatus.create(data.orderStatus || 'OPEN');
    const pricing = SOPricing.create({
      totalLineAmount: data.totalLineAmount || 0,
      headerDiscount: data.headerDiscount || 0,
      headerDiscountPercent: data.headerDiscountPercent || 0,
      lineDiscounts: data.lineDiscounts || [],
      taxes: data.taxes || [],
      charges: data.charges || [],
      openAmount: data.openAmount,
    });
    const addresses = SOAddresses.create({
      billingAddressId: data.billingAddressId,
      shippingAddressId: data.shippingAddressId,
    });
    const metadata = SOMetadata.create({
      channel: data.channel,
      fobCode: data.fobCode,
      shipViaCode: data.shipViaCode,
      paymentTermCode: data.paymentTermCode,
      currencyCode: data.currencyCode,
      exchangeRate: data.exchangeRate,
      customerPoNum: data.customerPoNum,
      headerNote: data.headerNote,
      internalNote: data.internalNote,
      createdBy: data.createdBy,
    });

    return new SOHeader(
      data.soNum,
      data.customerId,
      data.orderDate || new Date(),
      data.requestDate || null,
      data.needByDate || null,
      status,
      pricing,
      addresses,
      metadata,
      data.lines || [],
      data.createdBy,
      data.createdAt || new Date(),
      data.updatedAt || new Date(),
      data.id,
      data.publicId
    );
  }

  // Essential getters only
  public getId(): number | undefined {
    return this.id;
  }

  public getPublicId(): string | undefined {
    return this.publicId;
  }

  public getSONum(): string {
    return this.soNum;
  }

  public getCustomerId(): number {
    return this.customerId;
  }

  public getOrderDate(): Date {
    return this.orderDate;
  }

  public getRequestDate(): Date | null {
    return this.requestDate;
  }

  public getNeedByDate(): Date | null {
    return this.needByDate;
  }

  public getStatus(): string {
    return this.status.getValue();
  }

  public getPricing(): SOPricing {
    return this.pricing;
  }

  public getAddresses(): SOAddresses {
    return this.addresses;
  }

  public getMetadata(): SOMetadata {
    return this.metadata;
  }

  public getLines(): SOLine[] {
    return [...this.lines];
  }

  public getCreatedBy(): string {
    return this.createdBy;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business methods
  public hold(): SOHeader {
    return this.withStatus(this.status.toOnHold());
  }

  public release(): SOHeader {
    if (!this.status.isOnHold()) {
      throw new InvalidSOException('Order is not on hold');
    }
    return this.withStatus(this.status.toOpen());
  }

  public cancel(): SOHeader {
    if (this.status.isClosed()) {
      throw new InvalidSOException('Cannot cancel closed order');
    }
    const cancelledLines = this.lines.map((line) => line.cancel());
    return new SOHeader(
      this.soNum,
      this.customerId,
      this.orderDate,
      this.requestDate,
      this.needByDate,
      this.status.toCancelled(),
      this.pricing,
      this.addresses,
      this.metadata,
      // @ts-ignore - void[] to SOLine[]
      cancelledLines,
      this.createdBy,
      this.createdAt,
      new Date(),
      this.id,
      this.publicId
    );
  }

  public close(): SOHeader {
    if (this.lines.some((line) => line.getOpenQty() > 0)) {
      throw new InvalidSOException('Cannot close order with open lines');
    }
    return this.withStatus(this.status.toClosed());
  }

  // Alias for backward compatibility
  public complete(): SOHeader {
    return this.close();
  }

  public addLine(line: SOLine): SOHeader {
    const updatedLines = [...this.lines, line];
    const updatedPricing = this.recalculatePricing(updatedLines);

    return new SOHeader(
      this.soNum,
      this.customerId,
      this.orderDate,
      this.requestDate,
      this.needByDate,
      this.status,
      updatedPricing,
      this.addresses,
      this.metadata,
      updatedLines,
      this.createdBy,
      this.createdAt,
      new Date(),
      this.id,
      this.publicId
    );
  }

  public removeLine(lineNum: number): SOHeader {
    const updatedLines = this.lines.filter(
      (line) => line.getLineNum() !== lineNum
    );
    const updatedPricing = this.recalculatePricing(updatedLines);

    return new SOHeader(
      this.soNum,
      this.customerId,
      this.orderDate,
      this.requestDate,
      this.needByDate,
      this.status,
      updatedPricing,
      this.addresses,
      this.metadata,
      updatedLines,
      this.createdBy,
      this.createdAt,
      new Date(),
      this.id,
      this.publicId
    );
  }

  public updateDiscount(headerDiscount: number): SOHeader {
    const updatedPricing = this.pricing.addHeaderDiscount(headerDiscount);

    return new SOHeader(
      this.soNum,
      this.customerId,
      this.orderDate,
      this.requestDate,
      this.needByDate,
      this.status,
      updatedPricing,
      this.addresses,
      this.metadata,
      this.lines,
      this.createdBy,
      this.createdAt,
      new Date(),
      this.id,
      this.publicId
    );
  }

  public updateAddresses(
    billingAddressId: number | null,
    shippingAddressId: number | null
  ): SOHeader {
    const updatedAddresses = this.addresses.updateAddresses(
      billingAddressId,
      shippingAddressId
    );

    return new SOHeader(
      this.soNum,
      this.customerId,
      this.orderDate,
      this.requestDate,
      this.needByDate,
      this.status,
      this.pricing,
      updatedAddresses,
      this.metadata,
      this.lines,
      this.createdBy,
      this.createdAt,
      new Date(),
      this.id,
      this.publicId
    );
  }

  public updateShippingDetails(
    shipViaCode: string | null,
    fobCode: string | null
  ): SOHeader {
    const updatedMetadata = this.metadata.updateShippingDetails(
      shipViaCode,
      fobCode
    );

    return new SOHeader(
      this.soNum,
      this.customerId,
      this.orderDate,
      this.requestDate,
      this.needByDate,
      this.status,
      this.pricing,
      this.addresses,
      updatedMetadata,
      this.lines,
      this.createdBy,
      this.createdAt,
      new Date(),
      this.id,
      this.publicId
    );
  }

  public updateNotes(
    headerNote: string | null,
    internalNote: string | null
  ): SOHeader {
    const updatedMetadata = this.metadata.updateNotes(headerNote, internalNote);

    return new SOHeader(
      this.soNum,
      this.customerId,
      this.orderDate,
      this.requestDate,
      this.needByDate,
      this.status,
      this.pricing,
      this.addresses,
      updatedMetadata,
      this.lines,
      this.createdBy,
      this.createdAt,
      new Date(),
      this.id,
      this.publicId
    );
  }

  // Private helper methods
  private withStatus(newStatus: SOStatus): SOHeader {
    return new SOHeader(
      this.soNum,
      this.customerId,
      this.orderDate,
      this.requestDate,
      this.needByDate,
      newStatus,
      this.pricing,
      this.addresses,
      this.metadata,
      this.lines,
      this.createdBy,
      this.createdAt,
      new Date(),
      this.id,
      this.publicId
    );
  }

  private recalculatePricing(lines: SOLine[]): SOPricing {
    const totalLineAmount = lines.reduce(
      (sum, line) => sum + line.getLineTotal(),
      0
    );
    const lineDiscounts = lines.map(
      (line) => line.getLineDiscountAmount() || 0
    );

    return SOPricing.create({
      totalLineAmount,
      headerDiscount: this.pricing.getHeaderDiscount(),
      lineDiscounts,
      taxes: this.pricing.getTaxes(),
      charges: this.pricing.getCharges(),
    });
  }

  // Persistence methods
  public toPersistence(): any {
    return {
      id: this.id,
      publicId: this.publicId,
      soNum: this.soNum,
      customerId: this.customerId,
      orderDate: this.orderDate,
      requestDate: this.requestDate,
      needByDate: this.needByDate,
      orderStatus: this.status.getValue(),
      ...this.pricing.toPersistence(),
      ...this.addresses.toPersistence(),
      ...this.metadata.toPersistence(),
      lines: this.lines.map((line) => line.toPersistence()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPersistence(data: any): SOHeader {
    const status = SOStatus.fromPersistence(data.orderStatus);
    const pricing = SOPricing.fromPersistence(data);
    const addresses = SOAddresses.fromPersistence(data);
    const metadata = SOMetadata.fromPersistence(data);
    const lines =
      data.lines?.map((line: any) => SOLine.fromPersistence(line)) || [];

    return new SOHeader(
      data.soNum,
      data.customerId,
      new Date(data.orderDate),
      data.requestDate ? new Date(data.requestDate) : null,
      data.needByDate ? new Date(data.needByDate) : null,
      status,
      pricing,
      addresses,
      metadata,
      lines,
      data.createdBy,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.id,
      data.publicId
    );
  }
}
