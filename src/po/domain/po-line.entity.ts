import { POLineStatus } from './value-objects/po-status.vo';
import { InvalidPOLineException } from './exceptions/po-domain.exception';
import { RowMode } from '../../common/enums/row-mode.enum';

export { RowMode };

export interface POLineCreateData {
  skuId: number;
  description?: string;
  uomCode: string;
  orderQty: number;
  unitPrice: number;
  warehouseCode?: string;
  note?: string;
  createdBy?: string;
}

export interface POLinePersistenceData {
  id: number;
  publicId: string;
  poId: number;
  lineNum: number;
  skuId: number;
  description: string | null;
  uomCode: string;
  orderQty: any;
  unitPrice: any;
  lineAmount: any;
  receivedQty: any;
  warehouseCode: string | null;
  status: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  sku?: any;
  uom?: any;
}

export class POLine {
  private id: number;
  private publicId: string;
  private poId: number;
  private lineNum: number;
  private skuId: number;
  private description: string | null;
  private uomCode: string;
  private orderQty: number;
  private unitPrice: number;
  private lineAmount: number;
  private receivedQty: number;
  private warehouseCode: string | null;
  private status: POLineStatus;
  private note: string | null;
  private createdAt: Date;
  private updatedAt: Date;
  private createdBy: string | null;
  private _sku: any;
  private _uom: any;

  rowMode: RowMode = RowMode.UPDATED;

  private constructor(data: {
    id: number;
    publicId: string;
    poId: number;
    lineNum: number;
    skuId: number;
    description: string | null;
    uomCode: string;
    orderQty: number;
    unitPrice: number;
    lineAmount: number;
    receivedQty: number;
    warehouseCode: string | null;
    status: POLineStatus;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    sku?: any;
    uom?: any;
  }) {
    this.id = data.id;
    this.publicId = data.publicId;
    this.poId = data.poId;
    this.lineNum = data.lineNum;
    this.skuId = data.skuId;
    this.description = data.description;
    this.uomCode = data.uomCode;
    this.orderQty = data.orderQty;
    this.unitPrice = data.unitPrice;
    this.lineAmount = data.lineAmount;
    this.receivedQty = data.receivedQty;
    this.warehouseCode = data.warehouseCode;
    this.status = data.status;
    this.note = data.note;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.createdBy = data.createdBy;
    this._sku = data.sku;
    this._uom = data.uom;
  }

  public static create(
    data: POLineCreateData,
    lineNum: number,
    createdBy?: string
  ): POLine {
    if (data.orderQty <= 0) {
      throw new InvalidPOLineException(`orderQty must be > 0, got ${data.orderQty}`);
    }
    if (data.unitPrice < 0) {
      throw new InvalidPOLineException(`unitPrice cannot be negative: ${data.unitPrice}`);
    }

    const lineAmount = data.orderQty * data.unitPrice;

    const line = new POLine({
      id: 0,
      publicId: '',
      poId: 0,
      lineNum,
      skuId: data.skuId,
      description: data.description ?? null,
      uomCode: data.uomCode,
      orderQty: data.orderQty,
      unitPrice: data.unitPrice,
      lineAmount,
      receivedQty: 0,
      warehouseCode: data.warehouseCode ?? null,
      status: POLineStatus.open(),
      note: data.note ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: createdBy ?? null,
    });

    line.rowMode = RowMode.NEW;
    return line;
  }

  public static fromPersistence(data: POLinePersistenceData): POLine {
    return new POLine({
      id: data.id,
      publicId: data.publicId,
      poId: data.poId,
      lineNum: data.lineNum,
      skuId: data.skuId,
      description: data.description,
      uomCode: data.uomCode,
      orderQty: Number(data.orderQty),
      unitPrice: Number(data.unitPrice),
      lineAmount: Number(data.lineAmount),
      receivedQty: Number(data.receivedQty) || 0,
      warehouseCode: data.warehouseCode,
      status: POLineStatus.fromPersistence(data.status),
      note: data.note,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      createdBy: data.createdBy,
      sku: data.sku,
      uom: data.uom,
    });
  }

  /**
   * Add received quantity and auto-recalculate line status.
   * Returns new receivedQty after adding.
   */
  public addReceivedQty(additionalQty: number): void {
    if (additionalQty <= 0) {
      throw new InvalidPOLineException(`additionalQty must be > 0, got ${additionalQty}`);
    }
    if (this.status.isCancelled() || this.status.isReceived()) {
      throw new InvalidPOLineException(
        `Cannot receive on line with status ${this.status.getValue()}`
      );
    }

    this.receivedQty += additionalQty;
    this.recalculateStatus();
    this.rowMode = RowMode.UPDATED;
  }

  private recalculateStatus(): void {
    if (this.receivedQty >= this.orderQty) {
      this.status = POLineStatus.fromPersistence('RECEIVED');
    } else if (this.receivedQty > 0) {
      this.status = POLineStatus.fromPersistence('PARTIALLY_RECEIVED');
    }
  }

  public cancel(): void {
    this.status = this.status.transition('CANCELLED');
    this.rowMode = RowMode.UPDATED;
  }

  public markDeleted(): void {
    this.rowMode = RowMode.DELETED;
  }

  public updateFields(data: {
    skuId?: number;
    description?: string;
    uomCode?: string;
    orderQty?: number;
    unitPrice?: number;
    warehouseCode?: string;
    note?: string;
  }): void {
    if (data.skuId !== undefined) this.skuId = data.skuId;
    if (data.description !== undefined) this.description = data.description;
    if (data.uomCode !== undefined) this.uomCode = data.uomCode;
    if (data.warehouseCode !== undefined) this.warehouseCode = data.warehouseCode;
    if (data.note !== undefined) this.note = data.note;

    if (data.orderQty !== undefined || data.unitPrice !== undefined) {
      if (data.orderQty !== undefined) {
        if (data.orderQty <= 0) throw new InvalidPOLineException(`orderQty must be > 0`);
        this.orderQty = data.orderQty;
      }
      if (data.unitPrice !== undefined) {
        if (data.unitPrice < 0) throw new InvalidPOLineException(`unitPrice cannot be negative`);
        this.unitPrice = data.unitPrice;
      }
      this.lineAmount = this.orderQty * this.unitPrice;
    }

    this.rowMode = RowMode.UPDATED;
  }

  // Getters
  public getId(): number { return this.id; }
  public getPublicId(): string { return this.publicId; }
  public getPoId(): number { return this.poId; }
  public getLineNum(): number { return this.lineNum; }
  public getSkuId(): number { return this.skuId; }
  public getDescription(): string | null { return this.description; }
  public getUomCode(): string { return this.uomCode; }
  public getOrderQty(): number { return this.orderQty; }
  public getUnitPrice(): number { return this.unitPrice; }
  public getLineAmount(): number { return this.lineAmount; }
  public getReceivedQty(): number { return this.receivedQty; }
  public getWarehouseCode(): string | null { return this.warehouseCode; }
  public getStatus(): POLineStatus { return this.status; }
  public getNote(): string | null { return this.note; }
  public getCreatedBy(): string | null { return this.createdBy; }
  public getCreatedAt(): Date { return this.createdAt; }
  public getSku(): any { return this._sku; }
  public getUom(): any { return this._uom; }

  public toPersistence(): {
    id: number;
    poId: number;
    lineNum: number;
    skuId: number;
    description: string | null;
    uomCode: string;
    orderQty: number;
    unitPrice: number;
    lineAmount: number;
    receivedQty: number;
    warehouseCode: string | null;
    status: string;
    note: string | null;
    createdBy: string | null;
  } {
    return {
      id: this.id,
      poId: this.poId,
      lineNum: this.lineNum,
      skuId: this.skuId,
      description: this.description,
      uomCode: this.uomCode,
      orderQty: this.orderQty,
      unitPrice: this.unitPrice,
      lineAmount: this.lineAmount,
      receivedQty: this.receivedQty,
      warehouseCode: this.warehouseCode,
      status: this.status.toPersistence(),
      note: this.note,
      createdBy: this.createdBy,
    };
  }
}
