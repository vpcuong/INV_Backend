import { InvTransType, InvTransStatus } from '../enums/inv-trans.enum';
import { InvTransLine } from './inv-trans-line.entity';
import {
  InvalidInventoryTransactionException,
  InvalidWarehouseConfigException,
} from './exceptions/inventory-domain.exception';
import { RowMode } from '../../common/enums/row-mode.enum';

export interface InvTransHeaderConstructorData {
  id?: number;
  publicId?: string;
  transNum: string;
  type: InvTransType;
  status?: InvTransStatus;
  fromWarehouseId?: number | null;
  toWarehouseId?: number | null;
  referenceType?: string | null;
  referenceId?: number | null;
  referenceNum?: string | null;
  reasonCode?: string | null;
  transactionDate?: Date;
  note?: string | null;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  lines?: InvTransLine[];
}

export class InvTransHeader {
  private readonly id?: number;
  private readonly publicId?: string;
  private readonly transNum: string;
  private readonly type: InvTransType;
  private status: InvTransStatus;
  private fromWarehouseId?: number | null;
  private toWarehouseId?: number | null;
  private referenceType?: string | null;
  private referenceId?: number | null;
  private referenceNum?: string | null;
  private reasonCode?: string | null;
  private transactionDate: Date;
  private note?: string | null;
  private readonly createdBy: string;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private lines: InvTransLine[];

  private constructor(
    transNum: string,
    type: InvTransType,
    status: InvTransStatus,
    fromWarehouseId: number | null | undefined,
    toWarehouseId: number | null | undefined,
    referenceType: string | null | undefined,
    referenceId: number | null | undefined,
    referenceNum: string | null | undefined,
    reasonCode: string | null | undefined,
    transactionDate: Date,
    note: string | null | undefined,
    createdBy: string,
    createdAt: Date,
    updatedAt: Date,
    lines: InvTransLine[],
    id?: number,
    publicId?: string
  ) {
    this.transNum = transNum;
    this.type = type;
    this.status = status;
    this.fromWarehouseId = fromWarehouseId;
    this.toWarehouseId = toWarehouseId;
    this.referenceType = referenceType;
    this.referenceId = referenceId;
    this.referenceNum = referenceNum;
    this.reasonCode = reasonCode;
    this.transactionDate = transactionDate;
    this.note = note;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.lines = lines;
    this.id = id;
    this.publicId = publicId;

    this.validateBasicData();
    this.validateWarehouseByType();
  }

  private validateBasicData(): void {
    if (!this.transNum || this.transNum.trim() === '') {
      throw new InvalidInventoryTransactionException('Transaction number is required');
    }
    if (!this.createdBy || this.createdBy.trim() === '') {
      throw new InvalidInventoryTransactionException('Created by is required');
    }
  }

  /**
   * Validate warehouse configuration based on transaction type
   */
  private validateWarehouseByType(): void {
    switch (this.type) {
      case InvTransType.GOODS_RECEIPT:
        if (!this.toWarehouseId) {
          throw new InvalidWarehouseConfigException(
            InvTransType.GOODS_RECEIPT,
            'toWarehouseId is required'
          );
        }
        if (this.fromWarehouseId) {
          throw new InvalidWarehouseConfigException(
            InvTransType.GOODS_RECEIPT,
            'fromWarehouseId should be null'
          );
        }
        break;

      case InvTransType.GOODS_ISSUE:
        if (!this.fromWarehouseId) {
          throw new InvalidWarehouseConfigException(
            InvTransType.GOODS_ISSUE,
            'fromWarehouseId is required'
          );
        }
        if (this.toWarehouseId) {
          throw new InvalidWarehouseConfigException(
            InvTransType.GOODS_ISSUE,
            'toWarehouseId should be null'
          );
        }
        break;

      case InvTransType.STOCK_TRANSFER:
        if (!this.fromWarehouseId) {
          throw new InvalidWarehouseConfigException(
            InvTransType.STOCK_TRANSFER,
            'fromWarehouseId is required'
          );
        }
        if (!this.toWarehouseId) {
          throw new InvalidWarehouseConfigException(
            InvTransType.STOCK_TRANSFER,
            'toWarehouseId is required'
          );
        }
        if (this.fromWarehouseId === this.toWarehouseId) {
          throw new InvalidWarehouseConfigException(
            InvTransType.STOCK_TRANSFER,
            'Source and destination warehouse must be different'
          );
        }
        break;

      case InvTransType.ADJUSTMENT:
        if (!this.fromWarehouseId) {
          throw new InvalidWarehouseConfigException(
            InvTransType.ADJUSTMENT,
            'fromWarehouseId is required'
          );
        }
        if (!this.reasonCode) {
          throw new InvalidInventoryTransactionException(
            'Reason code is required for adjustments'
          );
        }
        break;
    }
  }

  public static create(data: InvTransHeaderConstructorData): InvTransHeader {
    return new InvTransHeader(
      data.transNum,
      data.type,
      data.status ?? InvTransStatus.DRAFT,
      data.fromWarehouseId,
      data.toWarehouseId,
      data.referenceType,
      data.referenceId,
      data.referenceNum,
      data.reasonCode,
      data.transactionDate ?? new Date(),
      data.note,
      data.createdBy,
      data.createdAt ?? new Date(),
      data.updatedAt ?? new Date(),
      data.lines ?? [],
      data.id,
      data.publicId
    );
  }

  // Getters
  public getId(): number | undefined {
    return this.id;
  }

  public getPublicId(): string | undefined {
    return this.publicId;
  }

  public getTransNum(): string {
    return this.transNum;
  }

  public getType(): InvTransType {
    return this.type;
  }

  public getStatus(): InvTransStatus {
    return this.status;
  }

  public getFromWarehouseId(): number | null | undefined {
    return this.fromWarehouseId;
  }

  public getToWarehouseId(): number | null | undefined {
    return this.toWarehouseId;
  }

  public getReferenceType(): string | null | undefined {
    return this.referenceType;
  }

  public getReferenceId(): number | null | undefined {
    return this.referenceId;
  }

  public getReferenceNum(): string | null | undefined {
    return this.referenceNum;
  }

  public getReasonCode(): string | null | undefined {
    return this.reasonCode;
  }

  public getTransactionDate(): Date {
    return this.transactionDate;
  }

  public getNote(): string | null | undefined {
    return this.note;
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

  public getLines(): InvTransLine[] {
    return [...this.lines.filter(l => l.getRowMode() !== RowMode.DELETED)];
  }

  public getAllLinesForPersistence(): InvTransLine[] {
    return [...this.lines];
  }

  public getTotalQuantity(): number {
    return this.getLines().reduce((sum, line) => sum + line.getQuantity(), 0);
  }

  // Business methods
  public complete(): void {
    if (this.status === InvTransStatus.CANCELLED) {
      throw new InvalidInventoryTransactionException(
        'Cannot complete a cancelled transaction'
      );
    }
    if (this.status === InvTransStatus.COMPLETED) {
      throw new InvalidInventoryTransactionException(
        'Transaction is already completed'
      );
    }
    if (this.getLines().length === 0) {
      throw new InvalidInventoryTransactionException(
        'Cannot complete transaction with no lines'
      );
    }
    this.status = InvTransStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  public cancel(): void {
    if (this.status === InvTransStatus.COMPLETED) {
      throw new InvalidInventoryTransactionException(
        'Cannot cancel a completed transaction'
      );
    }
    if (this.status === InvTransStatus.CANCELLED) {
      throw new InvalidInventoryTransactionException(
        'Transaction is already cancelled'
      );
    }
    this.status = InvTransStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  public addLine(line: InvTransLine): void {
    if (this.status !== InvTransStatus.DRAFT) {
      throw new InvalidInventoryTransactionException(
        'Can only add lines to draft transaction'
      );
    }
    this.lines.push(line);
    this.updatedAt = new Date();
  }

  public removeLine(lineNum: number): void {
    if (this.status !== InvTransStatus.DRAFT) {
      throw new InvalidInventoryTransactionException(
        'Can only remove lines from draft transaction'
      );
    }
    const lineIndex = this.lines.findIndex(l => l.getLineNum() === lineNum);
    if (lineIndex === -1) {
      throw new InvalidInventoryTransactionException(`Line ${lineNum} not found`);
    }

    const line = this.lines[lineIndex];
    if (line.getRowMode() === RowMode.NEW) {
      // If line was just created, remove it completely
      this.lines.splice(lineIndex, 1);
    } else {
      // If line exists in DB, mark for deletion
      line.markDeleted();
    }
    this.updatedAt = new Date();
  }

  public updateNote(note: string | null): void {
    if (this.status !== InvTransStatus.DRAFT) {
      throw new InvalidInventoryTransactionException(
        'Can only update draft transaction'
      );
    }
    this.note = note;
    this.updatedAt = new Date();
  }

  public updateTransactionDate(date: Date): void {
    if (this.status !== InvTransStatus.DRAFT) {
      throw new InvalidInventoryTransactionException(
        'Can only update draft transaction'
      );
    }
    this.transactionDate = date;
    this.updatedAt = new Date();
  }

  public updateReference(
    referenceType: string | null,
    referenceId: number | null,
    referenceNum: string | null
  ): void {
    if (this.status !== InvTransStatus.DRAFT) {
      throw new InvalidInventoryTransactionException(
        'Can only update draft transaction'
      );
    }
    this.referenceType = referenceType;
    this.referenceId = referenceId;
    this.referenceNum = referenceNum;
    this.updatedAt = new Date();
  }

  // Persistence methods
  public toPersistence(): any {
    return {
      id: this.id,
      publicId: this.publicId,
      transNum: this.transNum,
      type: this.type,
      status: this.status,
      fromWarehouseId: this.fromWarehouseId,
      toWarehouseId: this.toWarehouseId,
      referenceType: this.referenceType,
      referenceId: this.referenceId,
      referenceNum: this.referenceNum,
      reasonCode: this.reasonCode,
      transactionDate: this.transactionDate,
      note: this.note,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lines: this.lines.map(line => line.toPersistence()),
    };
  }

  public static fromPersistence(data: any): InvTransHeader {
    const lines = data.lines?.map((line: any) => InvTransLine.fromPersistence(line)) || [];

    return new InvTransHeader(
      data.transNum,
      data.type as InvTransType,
      data.status as InvTransStatus,
      data.fromWarehouseId,
      data.toWarehouseId,
      data.referenceType,
      data.referenceId,
      data.referenceNum,
      data.reasonCode,
      new Date(data.transactionDate),
      data.note,
      data.createdBy,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      lines,
      data.id,
      data.publicId
    );
  }
}
