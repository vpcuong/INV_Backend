import { RowMode } from '../../common/enums/row-mode.enum';
import { InvalidUomException } from './exceptions/uom-domain.exception';

export interface UomConstructorData {
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateUomData {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export class Uom {
  private code: string;
  private name: string;
  private description: string | null;
  private isActive: boolean;
  private rowMode: RowMode | null = null;

  constructor(data: UomConstructorData) {
    this.validate(data);

    this.code = data.code;
    this.name = data.name;
    this.description = data.description ?? null;
    this.isActive = data.isActive ?? true;
  }

  private validate(data: UomConstructorData): void {
    if (!data.code || data.code.trim() === '') {
      throw new InvalidUomException('UOM code is required');
    }
    if (!data.name || data.name.trim() === '') {
      throw new InvalidUomException('UOM name is required');
    }
  }

  // Domain methods
  public update(data: UpdateUomData): void {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim() === '') {
        throw new InvalidUomException('UOM name is required');
      }
      this.name = data.name;
    }
    if (data.description !== undefined) {
      this.description = data.description;
    }
    if (data.isActive !== undefined) {
      this.isActive = data.isActive;
    }
    this.rowMode = this.rowMode === RowMode.NEW ? RowMode.NEW : RowMode.UPDATED;
  }

  public activate(): void {
    if (this.isActive) {
      throw new InvalidUomException('UOM is already active');
    }
    this.isActive = true;
    this.rowMode = this.rowMode === RowMode.NEW ? RowMode.NEW : RowMode.UPDATED;
  }

  public deactivate(): void {
    if (!this.isActive) {
      throw new InvalidUomException('UOM is already inactive');
    }
    this.isActive = false;
    this.rowMode = this.rowMode === RowMode.NEW ? RowMode.NEW : RowMode.UPDATED;
  }

  // Getters
  public getCode(): string {
    return this.code;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string | null {
    return this.description;
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
  public static create(data: UomConstructorData): Uom {
    return new Uom(data);
  }
}