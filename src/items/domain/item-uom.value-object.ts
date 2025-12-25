export interface ItemUOMData {
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
}

export class ItemUOM {
  private readonly itemId: number;
  private readonly uomCode: string;
  private readonly toBaseFactor: number;
  private readonly roundingPrecision: number;
  private readonly isDefaultTransUom: boolean;
  private readonly isPurchasingUom: boolean;
  private readonly isSalesUom: boolean;
  private readonly isManufacturingUom: boolean;
  private readonly isActive: boolean;
  private readonly desc: string;

  constructor(data: ItemUOMData) {
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
  }

  private validateToBaseFactor(factor: number): void {
    if (factor <= 0) {
      throw new Error('toBaseFactor must be greater than 0');
    }
  }

  /**
   * Convert quantity from this UOM to target UOM
   */
  public convertTo(targetUom: ItemUOM, quantity: number): number {
    // Convert to base UOM first
    const baseQuantity = quantity * this.toBaseFactor;
    // Convert from base to target UOM
    const result = baseQuantity / targetUom.toBaseFactor;
    // Apply rounding precision of target UOM
    return Number(result.toFixed(targetUom.roundingPrecision));
  }

  /**
   * Check if this is the same UOM
   */
  public isSameUOM(uomCode: string): boolean {
    return this.uomCode === uomCode;
  }

  // Getters
  public getItemId(): number { return this.itemId; }
  public getUomCode(): string { return this.uomCode; }
  public getToBaseFactor(): number { return this.toBaseFactor; }
  public getRoundingPrecision(): number { return this.roundingPrecision; }
  public getIsDefaultTransUom(): boolean { return this.isDefaultTransUom; }
  public getIsPurchasingUom(): boolean { return this.isPurchasingUom; }
  public getIsSalesUom(): boolean { return this.isSalesUom; }
  public getIsManufacturingUom(): boolean { return this.isManufacturingUom; }
  public getIsActive(): boolean { return this.isActive; }
  public getDesc(): string { return this.desc; }

  /**
   * Convert to persistence model
   */
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
    };
  }

  /**
   * Create from persistence model
   */
  public static fromPersistence(data: any): ItemUOM {
    return new ItemUOM({
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
    });
  }
}