import { Uom } from './uom.entity';
import { UomConversion } from './uom-conversion.entity';
import { RowMode } from '../../common/enums/row-mode.enum';
import {
  InvalidUomException,
  DuplicateUomCodeException,
  UomNotFoundException,
  UomConversionNotFoundException,
} from './exceptions/uom-domain.exception';

export interface UomClassConstructorData {
  code: string;
  name: string;
  description?: string | null;
  baseUomCode?: string | null;
  isActive?: boolean;
}

export interface UpdateUomClassData {
  name?: string;
  description?: string | null;
  baseUomCode?: string | null;
  isActive?: boolean;
}

export class UomClass {
  private code: string;
  private name: string;
  private description: string | null;
  private baseUomCode: string | null;
  private isActive: boolean;
  private rowMode: RowMode | null = null;
  private uoms: Uom[] = [];
  private conversions: UomConversion[] = [];

  constructor(data: UomClassConstructorData) {
    this.validate(data);

    this.code = data.code;
    this.name = data.name;
    this.description = data.description ?? null;
    this.baseUomCode = data.baseUomCode ?? null;
    this.isActive = data.isActive ?? true;
  }

  private validate(data: UomClassConstructorData): void {
    if (!data.code || data.code.trim() === '') {
      throw new InvalidUomException('UOM Class code is required');
    }
    if (!data.name || data.name.trim() === '') {
      throw new InvalidUomException('UOM Class name is required');
    }
  }

  // Domain methods
  public update(data: UpdateUomClassData): void {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim() === '') {
        throw new InvalidUomException('UOM Class name is required');
      }
      this.name = data.name;
    }
    if (data.description !== undefined) {
      this.description = data.description;
    }
    if (data.baseUomCode !== undefined) {
      this.baseUomCode = data.baseUomCode;
    }
    if (data.isActive !== undefined) {
      this.isActive = data.isActive;
    }
    this.rowMode = this.rowMode === RowMode.NEW ? RowMode.NEW : RowMode.UPDATED;
  }

  public addUom(uom: Uom, factor: number): void {
    if (this.uoms.some((u) => u.getCode() === uom.getCode())) {
      throw new DuplicateUomCodeException(uom.getCode(), this.code);
    }

    uom.markAsNew();
    this.uoms.push(uom);

    const conversion = new UomConversion({
      uomCode: uom.getCode(),
      toBaseFactor: factor,
    });
    conversion.markAsNew();
    this.conversions.push(conversion);

    this.rowMode = this.rowMode === RowMode.NEW ? RowMode.NEW : RowMode.UPDATED;
  }

  public updateUom(uomCode: string, data: { name?: string; description?: string | null; isActive?: boolean }): void {
    const uom = this.uoms.find((u) => u.getCode() === uomCode);
    if (!uom) {
      throw new UomNotFoundException(uomCode);
    }

    uom.update(data);
    this.rowMode = this.rowMode === RowMode.NEW ? RowMode.NEW : RowMode.UPDATED;
  }

  public removeUom(uomCode: string): void {
    const uomIndex = this.uoms.findIndex((u) => u.getCode() === uomCode);
    if (uomIndex === -1) {
      throw new UomNotFoundException(uomCode);
    }

    const uom = this.uoms[uomIndex];
    uom.markDeleted();

    const conversion = this.conversions.find((c) => c.getUomCode() === uomCode);
    if (conversion) {
      conversion.markDeleted();
    }

    this.rowMode = this.rowMode === RowMode.NEW ? RowMode.NEW : RowMode.UPDATED;
  }

  public updateConversion(uomCode: string, factor: number): void {
    const conversion = this.conversions.find((c) => c.getUomCode() === uomCode);
    if (!conversion) {
      throw new UomConversionNotFoundException(uomCode, this.code);
    }

    conversion.setFactor(factor);
    this.rowMode = this.rowMode === RowMode.NEW ? RowMode.NEW : RowMode.UPDATED;
  }

  public findUomByCode(uomCode: string): Uom | undefined {
    return this.uoms.find((u) => u.getCode() === uomCode);
  }

  public findConversionByUomCode(uomCode: string): UomConversion | undefined {
    return this.conversions.find((c) => c.getUomCode() === uomCode);
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

  public getBaseUomCode(): string | null {
    return this.baseUomCode;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getRowMode(): RowMode | null {
    return this.rowMode;
  }

  public getUoms(): Uom[] {
    return [...this.uoms];
  }

  public getConversions(): UomConversion[] {
    return [...this.conversions];
  }

  // Setters for hydration from persistence
  public setUoms(uoms: Uom[]): void {
    this.uoms = uoms;
  }

  public setConversions(conversions: UomConversion[]): void {
    this.conversions = conversions;
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
    this.uoms.forEach((u) => u.clearRowMode());
    this.conversions.forEach((c) => c.clearRowMode());
  }

  // Factory method
  public static create(data: {
    code: string;
    name: string;
    description?: string | null;
    baseUomCode?: string | null;
    isActive?: boolean;
    uoms?: Uom[];
    conversions?: UomConversion[];
  }): UomClass {
    const uomClass = new UomClass({
      code: data.code,
      name: data.name,
      description: data.description,
      baseUomCode: data.baseUomCode,
      isActive: data.isActive,
    });
    if (data.uoms) uomClass.setUoms(data.uoms);
    if (data.conversions) uomClass.setConversions(data.conversions);
    return uomClass;
  }
}