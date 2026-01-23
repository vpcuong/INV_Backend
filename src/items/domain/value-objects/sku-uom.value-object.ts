export interface SkuUOMData {
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
}

export class SkuUOM {
  private readonly id?: number;
  private readonly skuId: number;
  private readonly uomCode: string;
  private readonly toBaseFactor: number;
  private readonly roundingPrecision: number;
  private readonly isDefaultTransUom: boolean;
  private readonly isPurchasingUom: boolean;
  private readonly isSalesUom: boolean;
  private readonly isManufacturingUom: boolean;
  private readonly isActive: boolean;
  private readonly desc: string;

  constructor(data: SkuUOMData) {
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
  }

  private validateToBaseFactor(factor: number): void {
    if (factor <= 0) {
      throw new Error('toBaseFactor must be greater than 0');
    }
  }

  public convertTo(targetUom: SkuUOM, quantity: number): number {
    const baseQuantity = quantity * this.toBaseFactor;
    const result = baseQuantity / targetUom.toBaseFactor;
    return Number(result.toFixed(targetUom.roundingPrecision));
  }

  public isSameUOM(uomCode: string): boolean {
    return this.uomCode === uomCode;
  }

  // Getters
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

  public toPersistence(): any {
    return {
      id: this.id,
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
    };
  }

  public static fromPersistence(data: any): SkuUOM {
    return new SkuUOM({
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
    });
  }
}
