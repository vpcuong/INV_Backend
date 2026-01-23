import {
  InvalidItemSkuException,
  InvalidPriceException,
  InvalidDimensionException,
} from '../exceptions/item-domain.exception';

export enum ItemSkuStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface ItemSkuConstructorData {
  id?: number;
  skuCode: string;
  itemId?: number | null;
  modelId?: number | null;
  colorId?: number | null;
  genderId?: number | null;
  sizeId?: number | null;
  supplierId?: number | null;
  customerId?: number | null;
  fabricSKUId?: number | null;
  pattern?: string | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  weightG?: number | null;
  desc?: string | null;
  status?: string;
  costPrice?: number | null;
  sellingPrice?: number | null;
  uomCode?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateItemSkuData {
  colorId?: number | null;
  genderId?: number | null;
  sizeId?: number | null;
  supplierId?: number | null;
  customerId?: number | null;
  fabricSKUId?: number | null;
  pattern?: string | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  weightG?: number | null;
  desc?: string | null;
  status?: string;
  costPrice?: number | null;
  sellingPrice?: number | null;
  uomCode?: string | null;
}

/**
 * ItemSku Entity
 */
export class ItemSku {
  private id?: number;
  private skuCode: string;
  private itemId?: number | null;
  private modelId?: number | null;
  private colorId?: number | null;
  private genderId?: number | null;
  private sizeId?: number | null;
  private supplierId?: number | null;
  private customerId?: number | null;
  private fabricSKUId?: number | null;
  private pattern?: string | null;
  private lengthCm?: number | null;
  private widthCm?: number | null;
  private heightCm?: number | null;
  private weightG?: number | null;
  private desc?: string | null;
  private status: string;
  private costPrice?: number | null;
  private sellingPrice?: number | null;
  private uomCode?: string | null;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(data: ItemSkuConstructorData) {
    this.validateRequiredFields(data);
    this.validatePrices(data.costPrice, data.sellingPrice);
    this.validateDimensions(data);

    this.id = data.id;
    this.skuCode = data.skuCode;
    this.itemId = data.itemId;
    this.modelId = data.modelId;
    this.colorId = data.colorId;
    this.genderId = data.genderId;
    this.sizeId = data.sizeId;
    this.supplierId = data.supplierId;
    this.customerId = data.customerId;
    this.fabricSKUId = data.fabricSKUId;
    this.pattern = data.pattern;
    this.lengthCm = data.lengthCm;
    this.widthCm = data.widthCm;
    this.heightCm = data.heightCm;
    this.weightG = data.weightG;
    this.desc = data.desc;
    this.status = data.status ?? ItemSkuStatus.ACTIVE;
    this.costPrice = data.costPrice ?? 0;
    this.sellingPrice = data.sellingPrice ?? 0;
    this.uomCode = data.uomCode;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  private validateRequiredFields(data: ItemSkuConstructorData): void {
    if (!data.skuCode || data.skuCode.trim() === '') {
      throw new InvalidItemSkuException('SKU code is required');
    }
    if (!data.colorId) {
      throw new InvalidItemSkuException('Color is required');
    }
  }

  private validatePrices(
    costPrice?: number | null,
    sellingPrice?: number | null,
  ): void {
    if (costPrice !== undefined && costPrice !== null && costPrice < 0) {
      throw new InvalidPriceException('Cost price', costPrice);
    }
    if (
      sellingPrice !== undefined &&
      sellingPrice !== null &&
      sellingPrice < 0
    ) {
      throw new InvalidPriceException('Selling price', sellingPrice);
    }
  }

  private validateDimensions(data: {
    lengthCm?: number | null;
    widthCm?: number | null;
    heightCm?: number | null;
    weightG?: number | null;
  }): void {
    if (
      data.lengthCm !== undefined &&
      data.lengthCm !== null &&
      data.lengthCm < 0
    ) {
      throw new InvalidDimensionException('Length', data.lengthCm);
    }
    if (
      data.widthCm !== undefined &&
      data.widthCm !== null &&
      data.widthCm < 0
    ) {
      throw new InvalidDimensionException('Width', data.widthCm);
    }
    if (
      data.heightCm !== undefined &&
      data.heightCm !== null &&
      data.heightCm < 0
    ) {
      throw new InvalidDimensionException('Height', data.heightCm);
    }
    if (
      data.weightG !== undefined &&
      data.weightG !== null &&
      data.weightG < 0
    ) {
      throw new InvalidDimensionException('Weight', data.weightG);
    }
  }

  public update(data: UpdateItemSkuData): void {
    if (data.costPrice !== undefined || data.sellingPrice !== undefined) {
      this.validatePrices(
        data.costPrice ?? this.costPrice,
        data.sellingPrice ?? this.sellingPrice,
      );
    }

    this.validateDimensions({
      lengthCm: data.lengthCm,
      widthCm: data.widthCm,
      heightCm: data.heightCm,
      weightG: data.weightG,
    });

    if (data.colorId !== undefined) this.colorId = data.colorId;
    if (data.genderId !== undefined) this.genderId = data.genderId;
    if (data.sizeId !== undefined) this.sizeId = data.sizeId;
    if (data.supplierId !== undefined) this.supplierId = data.supplierId;
    if (data.customerId !== undefined) this.customerId = data.customerId;
    if (data.fabricSKUId !== undefined) this.fabricSKUId = data.fabricSKUId;
    if (data.pattern !== undefined) this.pattern = data.pattern;
    if (data.lengthCm !== undefined) this.lengthCm = data.lengthCm;
    if (data.widthCm !== undefined) this.widthCm = data.widthCm;
    if (data.heightCm !== undefined) this.heightCm = data.heightCm;
    if (data.weightG !== undefined) this.weightG = data.weightG;
    if (data.desc !== undefined) this.desc = data.desc;
    if (data.costPrice !== undefined) this.costPrice = data.costPrice;
    if (data.sellingPrice !== undefined) this.sellingPrice = data.sellingPrice;
    if (data.uomCode !== undefined) this.uomCode = data.uomCode;
    if (data.status !== undefined) {
      if (
        data.status !== ItemSkuStatus.ACTIVE &&
        data.status !== ItemSkuStatus.INACTIVE
      ) {
        throw new InvalidItemSkuException(`Invalid status: ${data.status}`);
      }
      this.status = data.status;
    }

    this.updatedAt = new Date();
  }

  public activate(): void {
    this.status = ItemSkuStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  public deactivate(): void {
    this.status = ItemSkuStatus.INACTIVE;
    this.updatedAt = new Date();
  }

  public isActive(): boolean {
    return this.status === ItemSkuStatus.ACTIVE;
  }

  // Getters
  public getId(): number | undefined {
    return this.id;
  }

  public getSkuCode(): string {
    return this.skuCode;
  }

  public getItemId(): number | null | undefined {
    return this.itemId;
  }

  public getModelId(): number | null | undefined {
    return this.modelId;
  }

  public getColorId(): number | null | undefined {
    return this.colorId;
  }

  public getGenderId(): number | null | undefined {
    return this.genderId;
  }

  public getSizeId(): number | null | undefined {
    return this.sizeId;
  }

  public getSupplierId(): number | null | undefined {
    return this.supplierId;
  }

  public getCustomerId(): number | null | undefined {
    return this.customerId;
  }

  public getFabricSKUId(): number | null | undefined {
    return this.fabricSKUId;
  }

  public getPattern(): string | null | undefined {
    return this.pattern;
  }

  public getLengthCm(): number | null | undefined {
    return this.lengthCm;
  }

  public getWidthCm(): number | null | undefined {
    return this.widthCm;
  }

  public getHeightCm(): number | null | undefined {
    return this.heightCm;
  }

  public getWeightG(): number | null | undefined {
    return this.weightG;
  }

  public getDesc(): string | null | undefined {
    return this.desc;
  }

  public getStatus(): string {
    return this.status;
  }

  public getCostPrice(): number | null | undefined {
    return this.costPrice;
  }

  public getSellingPrice(): number | null | undefined {
    return this.sellingPrice;
  }

  public getUomCode(): string | null | undefined {
    return this.uomCode;
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  public toPersistence(): any {
    return {
      id: this.id || undefined,
      skuCode: this.skuCode,
      itemId: this.itemId,
      modelId: this.modelId,
      colorId: this.colorId,
      genderId: this.genderId,
      sizeId: this.sizeId,
      supplierId: this.supplierId,
      customerId: this.customerId,
      fabricSKUId: this.fabricSKUId,
      pattern: this.pattern,
      lengthCm: this.lengthCm,
      widthCm: this.widthCm,
      heightCm: this.heightCm,
      weightG: this.weightG,
      desc: this.desc,
      status: this.status,
      costPrice: this.costPrice,
      sellingPrice: this.sellingPrice,
      uomCode: this.uomCode,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPersistence(data: any): ItemSku {
    return new ItemSku({
      id: data.id,
      skuCode: data.skuCode,
      itemId: data.itemId,
      modelId: data.modelId,
      colorId: data.colorId,
      genderId: data.genderId,
      sizeId: data.sizeId,
      supplierId: data.supplierId,
      customerId: data.customerId,
      fabricSKUId: data.fabricSKUId,
      pattern: data.pattern,
      lengthCm: data.lengthCm,
      widthCm: data.widthCm,
      heightCm: data.heightCm,
      weightG: data.weightG,
      desc: data.desc,
      status: data.status,
      costPrice: data.costPrice,
      sellingPrice: data.sellingPrice,
      uomCode: data.uomCode,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
