import { InvalidSkuUomException } from '../exceptions/item-domain.exception';

export interface SkuUomConstructorData {
  id?: number;
  skuId: number;
  uomCode: string;
  toBaseFactor: number;
  roundingPrecision?: number;
  isDefaultTransUom?: boolean;
  isPurchasingUom?: boolean;
  isSalesUom?: boolean;
  isManufacturingUom?: boolean;
  isActive?: boolean;
  desc?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateSkuUomData {
  toBaseFactor?: number;
  roundingPrecision?: number;
  isDefaultTransUom?: boolean;
  isPurchasingUom?: boolean;
  isSalesUom?: boolean;
  isManufacturingUom?: boolean;
  isActive?: boolean;
  desc?: string;
}

/**
 * SkuUom Entity
 * Represents the unit of measure configuration for a specific SKU
 */
export class SkuUom {
  private id?: number;
  private skuId: number;
  private uomCode: string;
  private toBaseFactor: number;
  private roundingPrecision: number;
  private isDefaultTransUom: boolean;
  private isPurchasingUom: boolean;
  private isSalesUom: boolean;
  private isManufacturingUom: boolean;
  private isActive: boolean;
  private desc: string;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(data: SkuUomConstructorData) {
    this.validateRequiredFields(data);
    this.validateToBaseFactor(data.toBaseFactor);

    this.id = data.id;
    this.skuId = data.skuId;
    this.uomCode = data.uomCode;
    this.toBaseFactor = data.toBaseFactor;
    this.roundingPrecision = data.roundingPrecision ?? 2;
    this.isDefaultTransUom = data.isDefaultTransUom ?? false;
    this.isPurchasingUom = data.isPurchasingUom ?? false;
    this.isSalesUom = data.isSalesUom ?? false;
    this.isManufacturingUom = data.isManufacturingUom ?? false;
    this.isActive = data.isActive ?? true;
    this.desc = data.desc ?? '';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  private validateRequiredFields(data: SkuUomConstructorData): void {
    if (!data.skuId) {
      throw new InvalidSkuUomException('SKU ID is required');
    }
    if (!data.uomCode || data.uomCode.trim() === '') {
      throw new InvalidSkuUomException('UOM code is required');
    }
  }

  private validateToBaseFactor(factor: number): void {
    if (factor <= 0) {
      throw new InvalidSkuUomException(
        `toBaseFactor must be greater than 0, got ${factor}`,
      );
    }
  }

  /**
   * Update the SKU UOM with new data
   * @param data - Partial data to update
   */
  public update(data: UpdateSkuUomData): void {
    if (data.toBaseFactor !== undefined) {
      this.validateToBaseFactor(data.toBaseFactor);
      this.toBaseFactor = data.toBaseFactor;
    }

    if (data.roundingPrecision !== undefined) {
      this.roundingPrecision = data.roundingPrecision;
    }
    if (data.isDefaultTransUom !== undefined) {
      this.isDefaultTransUom = data.isDefaultTransUom;
    }
    if (data.isPurchasingUom !== undefined) {
      this.isPurchasingUom = data.isPurchasingUom;
    }
    if (data.isSalesUom !== undefined) {
      this.isSalesUom = data.isSalesUom;
    }
    if (data.isManufacturingUom !== undefined) {
      this.isManufacturingUom = data.isManufacturingUom;
    }
    if (data.isActive !== undefined) {
      this.isActive = data.isActive;
    }
    if (data.desc !== undefined) {
      this.desc = data.desc;
    }

    this.updatedAt = new Date();
  }

  /**
   * Convert quantity from this UOM to another UOM
   * @param targetUom - The target UOM to convert to
   * @param quantity - The quantity to convert
   * @returns The converted quantity
   */
  public convertTo(targetUom: SkuUom, quantity: number): number {
    const baseQuantity = quantity * this.toBaseFactor;
    const result = baseQuantity / targetUom.toBaseFactor;
    return Number(result.toFixed(targetUom.roundingPrecision));
  }

  /**
   * Check if this UOM matches the given UOM code
   * @param uomCode - The UOM code to compare
   * @returns True if matches
   */
  public isSameUom(uomCode: string): boolean {
    return this.uomCode === uomCode;
  }

  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  public setAsDefaultTransUom(): void {
    this.isDefaultTransUom = true;
    this.updatedAt = new Date();
  }

  public unsetAsDefaultTransUom(): void {
    this.isDefaultTransUom = false;
    this.updatedAt = new Date();
  }

  //#region Getters
  public getId(): number | undefined {
    return this.id;
  }

  public getSkuId(): number {
    return this.skuId;
  }

  public getUomCode(): string {
    return this.uomCode;
  }

  public getToBaseFactor(): number {
    return this.toBaseFactor;
  }

  public getRoundingPrecision(): number {
    return this.roundingPrecision;
  }

  public getIsDefaultTransUom(): boolean {
    return this.isDefaultTransUom;
  }

  public getIsPurchasingUom(): boolean {
    return this.isPurchasingUom;
  }

  public getIsSalesUom(): boolean {
    return this.isSalesUom;
  }

  public getIsManufacturingUom(): boolean {
    return this.isManufacturingUom;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getDesc(): string {
    return this.desc;
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }
  //#endregion

  public toPersistence(): any {
    return {
      id: this.id || undefined,
      skuId: this.skuId,
      uomCode: this.uomCode,
      toBaseFactor: this.toBaseFactor,
      roundingPrecision: this.roundingPrecision,
      isDefaultTransUom: this.isDefaultTransUom,
      isPurchasingUom: this.isPurchasingUom,
      isSalesUom: this.isSalesUom,
      isManufacturingUom: this.isManufacturingUom,
      isActive: this.isActive,
      desc: this.desc,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPersistence(data: any): SkuUom {
    return new SkuUom({
      id: data.id,
      skuId: data.skuId,
      uomCode: data.uomCode,
      toBaseFactor: Number(data.toBaseFactor),
      roundingPrecision: data.roundingPrecision,
      isDefaultTransUom: data.isDefaultTransUom,
      isPurchasingUom: data.isPurchasingUom,
      isSalesUom: data.isSalesUom,
      isManufacturingUom: data.isManufacturingUom,
      isActive: data.isActive,
      desc: data.desc,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
