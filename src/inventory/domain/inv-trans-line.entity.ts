import {
  InvalidInventoryLineException,
  InvalidQuantityException,
} from './exceptions/inventory-domain.exception';
import { RowMode } from '../../common/enums/row-mode.enum';

export interface InvTransLineConstructorData {
  id?: number;
  publicId?: string;
  headerId?: number;
  lineNum: number;
  itemSkuId: number;
  quantity: number;
  uomCode: string;
  toBaseFactor: number;
  baseQty: number;
  baseUomCode: string;
  note?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class InvTransLine {
  private id?: number;
  private publicId?: string;
  private headerId?: number;
  private lineNum: number;
  private itemSkuId: number;
  private quantity: number;
  private uomCode: string;
  private toBaseFactor: number;
  private baseQty?: number;
  private baseUomCode: string;
  private note?: string | null;
  private createdAt?: Date;
  private updatedAt?: Date;
  private rowMode?: RowMode;

  constructor(data: InvTransLineConstructorData) {
    this.validateRequiredFields(data);

    this.id = data.id;
    this.publicId = data.publicId;
    this.headerId = data.headerId;
    this.lineNum = data.lineNum;
    this.itemSkuId = data.itemSkuId;
    this.quantity = data.quantity;
    this.uomCode = data.uomCode;
    this.toBaseFactor = data.toBaseFactor ?? 1;
    this.baseQty = data.baseQty ?? (data.quantity * this.toBaseFactor);
    this.baseUomCode = data.baseUomCode;
    this.note = data.note;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    // Mark as NEW if no id (same pattern as SOLine)
    if (!data.id) {
      this.rowMode = RowMode.NEW;
    }
  }

  private validateRequiredFields(data: InvTransLineConstructorData): void {
    if (!data.lineNum || data.lineNum <= 0) {
      throw new InvalidInventoryLineException(
        'Line number is required and must be greater than 0'
      );
    }
    if (!data.itemSkuId) {
      throw new InvalidInventoryLineException('Item SKU ID is required');
    }
    if (!data.quantity || data.quantity <= 0) {
      throw new InvalidQuantityException('Quantity', data.quantity);
    }
    if (!data.uomCode) {
      throw new InvalidInventoryLineException('UOM code is required');
    }

    if (!data.baseUomCode) {
      throw new InvalidInventoryLineException('Base UOM code is required');
    }
  }

  // Getters
  public getId(): number | undefined {
    return this.id;
  }

  public getPublicId(): string | undefined {
    return this.publicId;
  }

  public getHeaderId(): number | undefined {
    return this.headerId;
  }

  public getLineNum(): number {
    return this.lineNum;
  }

  public getItemSkuId(): number {
    return this.itemSkuId;
  }

  public getQuantity(): number {
    return this.quantity;
  }

  public getUomCode(): string {
    return this.uomCode;
  }

  public getBaseUomCode(): string {
    return this.baseUomCode;
  }

  public getToBaseFactor(): number {
    return this.toBaseFactor;
  }

  public getBaseQty(): number {
    return this.baseQty;
  }

  public getNote(): string | null | undefined {
    return this.note;
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  public getRowMode(): RowMode | undefined {
    return this.rowMode;
  }

  // Business methods
  public updateQuantity(quantity: number): void {
    if (quantity <= 0) {
      throw new InvalidQuantityException('Quantity', quantity);
    }
    this.quantity = quantity;
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
    this.updatedAt = new Date();
  }

  public updateNote(note: string | null): void {
    this.note = note;
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
    this.updatedAt = new Date();
  }

  public markDeleted(): void {
    this.rowMode = RowMode.DELETED;
  }

  public setLineNum(lineNum: number): void {
    this.lineNum = lineNum;
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
    this.updatedAt = new Date();
  }

  public updateItemSku(itemSkuId: number): void {
    if (!itemSkuId) {
      throw new InvalidInventoryLineException('Item SKU ID is required');
    }
    this.itemSkuId = itemSkuId;
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
    this.updatedAt = new Date();
  }

  public updateUomCode(uomCode: string): void {
    if (!uomCode) {
      throw new InvalidInventoryLineException('UOM code is required');
    }
    this.uomCode = uomCode;
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
    this.updatedAt = new Date();
  }

  // Persistence methods
  public toPersistence(): any {
    return {
      id: this.id,
      publicId: this.publicId, // Prisma will ignore if undefined on create
      headerId: this.headerId,
      lineNum: this.lineNum,
      itemSkuId: this.itemSkuId,
      quantity: this.quantity,
      uomCode: this.uomCode,
      toBaseFactor: this.toBaseFactor,
      baseQty: this.baseQty,
      baseUomCode: this.baseUomCode,
      note: this.note,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPersistence(data: any): InvTransLine {
    return new InvTransLine({
      id: data.id,
      publicId: data.publicId,
      headerId: data.headerId,
      lineNum: data.lineNum,
      itemSkuId: data.itemSkuId,
      quantity: Number(data.quantity),
      uomCode: data.uomCode,
      toBaseFactor: Number(data.toBaseFactor),
      baseQty: Number(data.baseQty),
      baseUomCode: data.baseUomCode,
      note: data.note,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
