import { InvalidItemUOMException } from '../exceptions/item-domain.exception';

export interface ItemUomConstructorData {
  itemId: number;
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

export interface UpdateItemUomData {
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
 * ItemUom Entity
 * Represents the unit of measure configuration for a specific Item
 * 
 * Note: ItemUOM uses composite primary key (itemId, uomCode)
 */
export class ItemUom {
  private itemId: number;
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

  constructor(data: ItemUomConstructorData) {
    this.validateRequiredFields(data);
    this.validateToBaseFactor(data.toBaseFactor);

    this.itemId = data.itemId;
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

  private validateRequiredFields(data: ItemUomConstructorData): void {
    if (!data.itemId) {
      throw new InvalidItemUOMException('Item ID is required');
    }
    if (!data.uomCode || data.uomCode.trim() === '') {
      throw new InvalidItemUOMException('UOM code is required');
    }
  }

  private validateToBaseFactor(factor: number): void {
    if (factor <= 0) {
      throw new InvalidItemUOMException(
        `toBaseFactor must be greater than 0, got ${factor}`,
      );
    }
  }

  /**
   * Update the Item UOM with new data
   * @param data - Partial data to update
   */
  public update(data: UpdateItemUomData): void {
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
  public convertTo(targetUom: ItemUom, quantity: number): number {
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
  public getItemId(): number {
    return this.itemId;
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
      itemId: this.itemId,
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

  public static fromPersistence(data: any): ItemUom {
    return new ItemUom({
      itemId: data.itemId,
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
