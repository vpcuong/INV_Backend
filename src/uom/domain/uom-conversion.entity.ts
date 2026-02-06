import { RowMode } from '../../common/enums/row-mode.enum';
import { InvalidUomFactorException } from './exceptions/uom-domain.exception';

export interface UomConversionConstructorData {
  uomCode: string;
  toBaseFactor: number;
  isActive?: boolean;
}

export interface UpdateUomConversionData {
  toBaseFactor?: number;
  isActive?: boolean;
}

export class UomConversion {
  private uomCode: string;
  private toBaseFactor: number;
  private isActive: boolean;
  private rowMode: RowMode | null = null;

  constructor(data: UomConversionConstructorData) {
    this.validate(data);

    this.uomCode = data.uomCode;
    this.toBaseFactor = data.toBaseFactor;
    this.isActive = data.isActive ?? true;
  }

  private validate(data: UomConversionConstructorData): void {
    if (data.toBaseFactor <= 0) {
      throw new InvalidUomFactorException(data.toBaseFactor);
    }
  }

  // Domain methods
  public update(data: UpdateUomConversionData): void {
    if (data.toBaseFactor !== undefined) {
      this.setFactor(data.toBaseFactor);
    }
    if (data.isActive !== undefined) {
      this.isActive = data.isActive;
      this.rowMode = this.rowMode === RowMode.NEW ? RowMode.NEW : RowMode.UPDATED;
    }
  }

  public setFactor(factor: number): void {
    if (factor <= 0) {
      throw new InvalidUomFactorException(factor);
    }
    this.toBaseFactor = factor;
    this.rowMode = this.rowMode === RowMode.NEW ? RowMode.NEW : RowMode.UPDATED;
  }

  // Getters
  public getUomCode(): string {
    return this.uomCode;
  }

  public getToBaseFactor(): number {
    return this.toBaseFactor;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getRowMode(): RowMode | null {
    return this.rowMode;
  }

  // RowMode helpers
  public markAsNew(): void {
    this.rowMode = RowMode.NEW;
  }

  public markUpdated(): void {
    if (this.rowMode !== RowMode.NEW) {
      this.rowMode = RowMode.UPDATED;
    }
  }

  public markDeleted(): void {
    this.rowMode = RowMode.DELETED;
  }

  public clearRowMode(): void {
    this.rowMode = null;
  }

  // Factory method
  public static create(data: UomConversionConstructorData): UomConversion {
    return new UomConversion(data);
  }
}