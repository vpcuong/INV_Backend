import { POStatus } from './value-objects/po-status.vo';
import { POPricing } from './value-objects/po-pricing.vo';
import { POLine, POLineCreateData, POLinePersistenceData, RowMode } from './po-line.entity';
import { InvalidPOException } from './exceptions/po-domain.exception';

export interface POHeaderCreateData {
  poNum: string;
  supplierId: number;
  orderDate?: Date;
  expectedDate?: Date;
  currencyCode: string;
  exchangeRate?: number;
  note?: string;
  createdBy?: string;
  lines?: POLineCreateData[];
}

export interface POHeaderPersistenceData {
  id: number;
  publicId: string;
  poNum: string;
  supplierId: number;
  orderDate: Date;
  expectedDate: Date | null;
  status: string;
  currencyCode: string;
  exchangeRate: any;
  totalAmount: any;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  lines: POLinePersistenceData[];
  supplier?: any;
}

export class POHeader {
  private id: number;
  private publicId: string;
  private poNum: string;
  private supplierId: number;
  private orderDate: Date;
  private expectedDate: Date | null;
  private status: POStatus;
  private currencyCode: string;
  private pricing: POPricing;
  private note: string | null;
  private createdAt: Date;
  private updatedAt: Date;
  private createdBy: string | null;
  private lines: POLine[];
  private _deletedLines: POLine[] = [];
  private _supplier: any;

  private constructor(data: {
    id: number;
    publicId: string;
    poNum: string;
    supplierId: number;
    orderDate: Date;
    expectedDate: Date | null;
    status: POStatus;
    currencyCode: string;
    pricing: POPricing;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    lines: POLine[];
    supplier?: any;
  }) {
    this.id = data.id;
    this.publicId = data.publicId;
    this.poNum = data.poNum;
    this.supplierId = data.supplierId;
    this.orderDate = data.orderDate;
    this.expectedDate = data.expectedDate;
    this.status = data.status;
    this.currencyCode = data.currencyCode;
    this.pricing = data.pricing;
    this.note = data.note;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.createdBy = data.createdBy;
    this.lines = data.lines;
    this._supplier = data.supplier;
  }

  public static create(data: POHeaderCreateData): POHeader {
    const lines = (data.lines ?? []).map((lineData, idx) =>
      POLine.create(lineData, idx + 1, data.createdBy)
    );

    const pricing = POPricing.create({ exchangeRate: data.exchangeRate }).recalculate(
      lines.map((l) => ({ lineAmount: l.getLineAmount() }))
    );

    return new POHeader({
      id: 0,
      publicId: '',
      poNum: data.poNum,
      supplierId: data.supplierId,
      orderDate: data.orderDate ?? new Date(),
      expectedDate: data.expectedDate ?? null,
      status: POStatus.draft(),
      currencyCode: data.currencyCode,
      pricing,
      note: data.note ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: data.createdBy ?? null,
      lines,
    });
  }

  public static fromPersistence(data: POHeaderPersistenceData): POHeader {
    const lines = (data.lines ?? []).map((l) => POLine.fromPersistence(l));

    return new POHeader({
      id: data.id,
      publicId: data.publicId,
      poNum: data.poNum,
      supplierId: data.supplierId,
      orderDate: data.orderDate,
      expectedDate: data.expectedDate,
      status: POStatus.fromPersistence(data.status),
      currencyCode: data.currencyCode,
      pricing: POPricing.fromPersistence({
        totalAmount: data.totalAmount,
        exchangeRate: data.exchangeRate,
      }),
      note: data.note,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      createdBy: data.createdBy,
      lines,
      supplier: data.supplier,
    });
  }

  // ── Business methods ──────────────────────────────────────────────────────

  public approve(): void {
    this.status = this.status.approve();
  }

  public cancel(): void {
    this.status = this.status.cancel();
    for (const line of this.lines) {
      if (!line.getStatus().isFinal()) {
        line.cancel();
      }
    }
  }

  public close(): void {
    this.status = this.status.close();
  }

  public transitionStatus(next: string): void {
    this.status = this.status.transition(next);
  }

  public addLine(lineData: POLineCreateData): void {
    if (!this.status.isDraft()) {
      throw new InvalidPOException(
        `Cannot add line to PO in status ${this.status.getValue()}`
      );
    }

    const nextLineNum = this.lines.length + 1;
    const line = POLine.create(lineData, nextLineNum, this.createdBy ?? undefined);
    this.lines.push(line);
    this.recalculatePricing();
  }

  public removeLine(lineId: number): void {
    if (!this.status.isDraft()) {
      throw new InvalidPOException(
        `Cannot remove line from PO in status ${this.status.getValue()}`
      );
    }

    const line = this.lines.find((l) => l.getId() === lineId);
    if (!line) {
      throw new InvalidPOException(`Line with id ${lineId} not found`);
    }

    line.markDeleted();
    this._deletedLines.push(line);
    this.lines = this.lines.filter((l) => l.getId() !== lineId);
    this.recalculatePricing();
  }

  public updateLineReceivedQty(skuId: number, additionalQty: number): void {
    const line = this.lines.find((l) => l.getSkuId() === skuId);
    if (!line) {
      throw new InvalidPOException(`PO line with skuId ${skuId} not found`);
    }

    line.addReceivedQty(additionalQty);
    this.recalculatePOStatus();
  }

  private recalculatePOStatus(): void {
    const activeLines = this.lines.filter((l) => !l.getStatus().isCancelled());
    if (activeLines.length === 0) return;

    const allReceived = activeLines.every((l) => l.getStatus().isReceived());
    const someReceived = activeLines.some(
      (l) => l.getStatus().isReceived() || l.getStatus().isPartiallyReceived()
    );

    if (allReceived && this.status.canTransitionTo('RECEIVED')) {
      this.status = this.status.transition('RECEIVED');
    } else if (someReceived && this.status.canTransitionTo('PARTIALLY_RECEIVED')) {
      this.status = this.status.transition('PARTIALLY_RECEIVED');
    }
  }

  public recalculatePricing(): void {
    this.pricing = this.pricing.recalculate(
      this.lines.map((l) => ({ lineAmount: l.getLineAmount() }))
    );
  }

  public updateHeader(data: {
    supplierId?: number;
    orderDate?: Date;
    expectedDate?: Date;
    currencyCode?: string;
    exchangeRate?: number;
    note?: string;
  }): void {
    if (data.supplierId !== undefined) this.supplierId = data.supplierId;
    if (data.orderDate !== undefined) this.orderDate = data.orderDate;
    if (data.expectedDate !== undefined) this.expectedDate = data.expectedDate;
    if (data.currencyCode !== undefined) this.currencyCode = data.currencyCode;
    if (data.exchangeRate !== undefined) {
      this.pricing = this.pricing.setExchangeRate(data.exchangeRate);
    }
    if (data.note !== undefined) this.note = data.note;
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  public getId(): number { return this.id; }
  public getPublicId(): string { return this.publicId; }
  public getPoNum(): string { return this.poNum; }
  public getSupplierId(): number { return this.supplierId; }
  public getOrderDate(): Date { return this.orderDate; }
  public getExpectedDate(): Date | null { return this.expectedDate; }
  public getStatus(): POStatus { return this.status; }
  public getCurrencyCode(): string { return this.currencyCode; }
  public getPricing(): POPricing { return this.pricing; }
  public getNote(): string | null { return this.note; }
  public getCreatedBy(): string | null { return this.createdBy; }
  public getCreatedAt(): Date { return this.createdAt; }
  public getUpdatedAt(): Date { return this.updatedAt; }
  public getLines(): POLine[] { return this.lines; }
  /** Returns active + deleted lines — dùng cho repository khi persist */
  public getAllLinesForPersistence(): POLine[] { return [...this.lines, ...this._deletedLines]; }
  public getSupplier(): any { return this._supplier; }

  public toPersistence(): {
    id: number;
    poNum: string;
    supplierId: number;
    orderDate: Date;
    expectedDate: Date | null;
    status: string;
    currencyCode: string;
    exchangeRate: number;
    totalAmount: number;
    note: string | null;
    createdBy: string | null;
  } {
    const { totalAmount, exchangeRate } = this.pricing.toPersistence();
    return {
      id: this.id,
      poNum: this.poNum,
      supplierId: this.supplierId,
      orderDate: this.orderDate,
      expectedDate: this.expectedDate,
      status: this.status.toPersistence(),
      currencyCode: this.currencyCode,
      exchangeRate,
      totalAmount,
      note: this.note,
      createdBy: this.createdBy,
    };
  }
}
