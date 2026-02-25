import { SOStatus } from './value-objects/so-status.vo';
import { SOPricing } from './value-objects/so-pricing.vo';
import { SOAddresses } from './value-objects/so-addresses.vo';
import { SOMetadata } from './value-objects/so-metadata.vo';
import { InvalidSOException } from './exceptions/so-domain.exception';
import { SOLine } from './so-line.entity';
import { RowMode } from '../../common/enums/row-mode.enum';

export interface SOHeaderConstructorData {
  id?: number;
  publicId?: string;
  soNum: string;
  customerId: number;
  orderDate?: Date;
  requestDate?: Date | null;
  needByDate?: Date | null;
  orderStatus?: string;
  // Pricing fields - Simplified
  discountPercent?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  // Relations
  billingAddressId?: number | null;
  shippingAddressId?: number | null;
  // Metadata
  channel?: string | null;
  fobCode?: string | null;
  shipViaCode?: string | null;
  paymentTermCode?: string | null;
  currencyCode?: string | null;
  // exchangeRate?: number;
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
    private orderDate: Date,
    private requestDate: Date | null,
    private needByDate: Date | null,
    private status: SOStatus,
    private pricing: SOPricing,
    private addresses: SOAddresses,
    private metadata: SOMetadata,
    private lines: SOLine[],
    private readonly createdBy: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
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
    
    // Initial lines
    const lines = data.lines || [];

    // Calculate line-level aggregates
    const totalLinesAmount = lines.reduce(
        (sum, line) => sum + line.getTotalAmount(),
        0
    );
    const totalLinesTaxAmount = lines.reduce(
      (sum, line) => sum + line.getTaxAmount(),
      0
    );
    const subtotalAmount = lines.reduce(
      (sum, line) => sum + line.getSubtotal(),
      0
    );
    const totalLinesDiscountAmount = lines.reduce(
      (sum, line) => sum + line.getDiscountAmount(),
      0
    );

    let pricing = SOPricing.create({
      discountPercent: data.discountPercent,
      discountAmount: data.discountAmount,
      taxAmount: data.taxAmount,
      totalAmount: data.totalAmount,
      subtotalAmount: data.totalAmount !== undefined ? undefined : 0,
      totalLinesDiscountAmount: data.totalAmount !== undefined ? undefined : 0,
    });

    // Enforce consistency: Recalculate from lines
    pricing = pricing.recalculate(totalLinesAmount, totalLinesTaxAmount, subtotalAmount, totalLinesDiscountAmount);

    const addresses = SOAddresses.create({
      billingAddressId: data.billingAddressId,
      shippingAddressId: data.shippingAddressId,
    });

    const metadata = SOMetadata.create({
      channel: data.channel,
      fobCode: data.fobCode,
      shipViaCode: data.shipViaCode,
      paymentTermCode: data.paymentTermCode,
      currencyCode: data.currencyCode ?? 'VND',
      // exchangeRate: data.exchangeRate ?? 1,
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
      lines,
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
    return [...this.lines.filter(l => l.getRowMode() !== RowMode.DELETED)];
  }

  /**
   * Get all lines including deleted ones (for repository persistence)
   */
  public getAllLinesForPersistence(): SOLine[] {
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
  public hold(): void {
    this.status = this.status.toOnHold();
    this.updatedAt = new Date();
  }

  public release(): void {
    if (!this.status.isOnHold()) {
      throw new InvalidSOException('Order is not on hold');
    }
    this.status = this.status.toOpen();
    this.updatedAt = new Date();
  }

  public cancel(): void {
    if (this.status.isClosed()) {
      throw new InvalidSOException('Cannot cancel closed order');
    }
    this.lines.forEach((line) => {
      line.cancel();
    });
    this.status = this.status.toCancelled();
    this.updatedAt = new Date();
  }

  public close(): void {
    // Auto-close all active OPEN/PARTIAL lines
    this.lines
      .filter(l => l.getRowMode() !== RowMode.DELETED)
      .forEach(line => line.close());

    this.status = this.status.toClosed();
    this.updatedAt = new Date();
  }

  // Alias for backward compatibility
  public complete(): void {
    this.close();
  }

  public addLine(line: SOLine): void {
    this.lines.push(line);
    this.recalculatePricingInPlace();
    this.updatedAt = new Date();
  }

  public removeLine(lineNum: number): void {
    const lineIndex = this.lines.findIndex(l => l.getLineNum() === lineNum);
    if (lineIndex === -1) {
      throw new InvalidSOException(`Line ${lineNum} not found`);
    }

    const line = this.lines[lineIndex];

    // If line is NEW (not yet persisted), just remove from array
    if (line.getRowMode() === RowMode.NEW) {
      this.lines.splice(lineIndex, 1);
    } else {
      line.markDeleted();
    }

    this.recalculatePricingInPlace();
    this.updatedAt = new Date();
  }

  /**
   * Update discount by amount - auto-syncs percent
   * @param discountAmount - Discount amount in currency
   */
  public updateDiscountAmount(discountAmount: number): void {
    this.pricing = this.pricing.setDiscountAmount(discountAmount);
    this.updatedAt = new Date();
  }

  /**
   * Update discount by percent - auto-syncs amount
   * @param discountPercent - Discount percent (0-100)
   */
  public updateDiscountPercent(discountPercent: number): void {
    this.pricing = this.pricing.setDiscountPercent(discountPercent);
    this.updatedAt = new Date();
  }
  
  /**
   * @deprecated Use updateDiscountAmount instead
   */
  // public updateDiscount(headerDiscount: number): SOHeader {
  //   return this.updateDiscountAmount(headerDiscount);
  // }

  public updateAddresses(
    billingAddressId: number | null,
    shippingAddressId: number | null
  ): void {
    this.addresses = this.addresses.updateAddresses(
      billingAddressId,
      shippingAddressId
    );
    this.updatedAt = new Date();
  }

  public updateShippingDetails(
    shipViaCode: string | null,
    fobCode: string | null
  ): void {
    this.metadata = this.metadata.updateShippingDetails(
      shipViaCode,
      fobCode
    );
    this.updatedAt = new Date();
  }

  public updateNotes(
    headerNote: string | null,
    internalNote: string | null
  ): void {
    this.metadata = this.metadata.updateNotes(headerNote, internalNote);
    this.updatedAt = new Date();
  }

  public updateMetadata(data: any): void {
    this.metadata = this.metadata.update(data);
    this.updatedAt = new Date();
  }

  public updateDates(data: {
    orderDate?: Date;
    requestDate?: Date | null;
    needByDate?: Date | null;
  }): void {
    if (data.orderDate !== undefined) {
      this.orderDate = data.orderDate;
    }
    if (data.requestDate !== undefined) {
      this.requestDate = data.requestDate;
    }
    if (data.needByDate !== undefined) {
      this.needByDate = data.needByDate;
    }
    this.updatedAt = new Date();
  }

  public updateStatus(status: string): void {
    this.status = SOStatus.create(status);
    this.updatedAt = new Date();
  }

  private recalculatePricing(lines: SOLine[]): SOPricing {
    const sumLineTotal = lines.reduce(
      (sum, line) => sum + line.getTotalAmount(),
      0
    );
    const totalLinesTaxAmount = lines.reduce(
      (sum, line) => sum + line.getTaxAmount(),
      0
    );
    const subtotalAmount = lines.reduce(
      (sum, line) => sum + line.getSubtotal(),
      0
    );
    const totalLinesDiscountAmount = lines.reduce(
      (sum, line) => sum + line.getDiscountAmount(),
      0
    );

    return this.pricing.recalculate(sumLineTotal, totalLinesTaxAmount, subtotalAmount, totalLinesDiscountAmount);
  }

  private recalculatePricingInPlace(): void {
    // Filter out deleted lines when calculating
    const activeLines = this.lines.filter(l => l.getRowMode() !== RowMode.DELETED);

    const sumLineTotal = activeLines.reduce(
      (sum, line) => sum + line.getTotalAmount(),
      0
    );
    const totalLinesTaxAmount = activeLines.reduce(
      (sum, line) => sum + line.getTaxAmount(),
      0
    );
    const subtotalAmount = activeLines.reduce(
      (sum, line) => sum + line.getSubtotal(),
      0
    );
    const totalLinesDiscountAmount = activeLines.reduce(
      (sum, line) => sum + line.getDiscountAmount(),
      0
    );

    this.pricing = this.pricing.recalculate(sumLineTotal, totalLinesTaxAmount, subtotalAmount, totalLinesDiscountAmount);
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
      // Spread pricing fields directly
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
