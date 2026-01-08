import { ItemUOM } from './item-uom.value-object';

export interface ItemConstructorData {
  id: number;
  code: string;
  categoryId: number;
  itemTypeId: number;
  materialId?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  weightG?: number | null;
  desc?: string | null;
  status?: string | null;
  purchasingPrice?: number | null;
  isManufactured?: boolean;
  isPurchasable?: boolean;
  isSellable?: boolean;
  sellingPrice?: number | null;
  uomCode?: string | null;
  itemUoms?: ItemUOM[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Item {
  private id: number;
  private code: string;
  private categoryId: number;
  private itemTypeId: number;
  private materialId?: number | null;
  private lengthCm?: number | null;
  private widthCm?: number | null;
  private heightCm?: number | null;
  private weightG?: number | null;
  private desc?: string | null;
  private status: string | null;
  private purchasingPrice?: number | null;
  private isManufactured: boolean;
  private isPurchasable: boolean;
  private isSellable: boolean;
  private sellingPrice?: number | null;
  private uomCode?: string | null;
  private itemUoms: ItemUOM[] = [];
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(data: ItemConstructorData) {
    this.id = data.id;
    this.code = data.code;
    this.categoryId = data.categoryId;
    this.itemTypeId = data.itemTypeId;
    this.materialId = data.materialId;
    this.lengthCm = data.lengthCm;
    this.widthCm = data.widthCm;
    this.heightCm = data.heightCm;
    this.weightG = data.weightG;
    this.desc = data.desc;
    this.status = data.status ?? 'active';
    this.purchasingPrice = data.purchasingPrice;
    this.isManufactured = data.isManufactured ?? false;
    this.isPurchasable = data.isPurchasable ?? false;
    this.isSellable = data.isSellable ?? false;
    this.sellingPrice = data.sellingPrice;
    this.uomCode = data.uomCode;
    this.itemUoms = data.itemUoms ?? [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Business rule: Check if item can be deleted
   */
  public canBeDeleted(): boolean {
    return this.itemUoms.length === 0;
  }

  /**
   * Business rule: Update item prices with validation
   */
  public updatePrice(purchasingPrice?: number | null, sellingPrice?: number | null): void {
    if (purchasingPrice !== undefined && purchasingPrice !== null && purchasingPrice < 0) {
      throw new Error('Purchasing price cannot be negative');
    }
    if (sellingPrice !== undefined && sellingPrice !== null && sellingPrice < 0) {
      throw new Error('Selling price cannot be negative');
    }
    if (
      purchasingPrice &&
      sellingPrice &&
      sellingPrice < purchasingPrice
    ) {
      console.warn(`Warning: Selling price (${sellingPrice}) is less than purchasing price (${purchasingPrice})`);
    }

    if (purchasingPrice !== undefined) {
      this.purchasingPrice = purchasingPrice;
    }
    if (sellingPrice !== undefined) {
      this.sellingPrice = sellingPrice;
    }
    this.updatedAt = new Date();
  }

  /**
   * Business rule: Add UOM to item
   */
  public addUOM(uom: ItemUOM): void {
    if (this.hasUOM(uom.getUomCode())) {
      throw new Error(`UOM ${uom.getUomCode()} already exists for this item`);
    }
    if (uom.getUomCode() === this.uomCode) {
      throw new Error('Cannot add base UOM as ItemUOM');
    }
    this.itemUoms.push(uom);
  }

  /**
   * Business rule: Remove UOM from item
   */
  public removeUOM(uomCode: string): void {
    const index = this.itemUoms.findIndex(u => u.getUomCode() === uomCode);
    if (index === -1) {
      throw new Error(`UOM ${uomCode} not found`);
    }
    this.itemUoms.splice(index, 1);
  }

  /**
   * Check if item has specific UOM
   */
  public hasUOM(uomCode: string): boolean {
    return this.itemUoms.some(u => u.getUomCode() === uomCode);
  }

  /**
   * Business logic: Convert quantity between UOMs
   */
  public convertQuantity(
    fromUomCode: string,
    toUomCode: string,
    quantity: number,
  ): number {
    // No conversion needed if UOMs are the same
    if (fromUomCode === toUomCode) {
      return quantity;
    }

    const fromUom = this.findUOM(fromUomCode);
    const toUom = this.findUOM(toUomCode);

    if (!fromUom) {
      throw new Error(`From UOM ${fromUomCode} not found for this item`);
    }
    if (!toUom) {
      throw new Error(`To UOM ${toUomCode} not found for this item`);
    }

    return fromUom.convertTo(toUom, quantity);
  }

  /**
   * Find UOM by code
   */
  private findUOM(uomCode: string): ItemUOM | undefined {
    return this.itemUoms.find(u => u.getUomCode() === uomCode);
  }

  /**
   * Validate if item data is complete for activation
   */
  private isValid(): boolean {
    return !!(
      this.code &&
      this.categoryId &&
      this.itemTypeId &&
      this.uomCode
    );
  }

  // Getters
  public getId(): number { return this.id; }
  public getCode(): string { return this.code; }
  public getCategoryId(): number { return this.categoryId; }
  public getItemTypeId(): number { return this.itemTypeId; }
  public getMaterialId(): number | null | undefined { return this.materialId; }
  public getLengthCm(): number | null | undefined { return this.lengthCm; }
  public getWidthCm(): number | null | undefined { return this.widthCm; }
  public getHeightCm(): number | null | undefined { return this.heightCm; }
  public getWeightG(): number | null | undefined { return this.weightG; }
  public getDesc(): string | null | undefined { return this.desc; }
  public getStatus(): string | null { return this.status; }
  public getUomCode(): string | null | undefined { return this.uomCode; }
  public getPurchasingPrice(): number | null | undefined { return this.purchasingPrice; }
  public getSellingPrice(): number | null | undefined { return this.sellingPrice; }
  public getIsPurchasable(): boolean { return this.isPurchasable; }
  public getIsSellable(): boolean { return this.isSellable; }
  public getIsManufactured(): boolean { return this.isManufactured; }
  public getItemUOMs(): ItemUOM[] { return [...this.itemUoms]; }
  public getCreatedAt(): Date | undefined { return this.createdAt; }
  public getUpdatedAt(): Date | undefined { return this.updatedAt; }

  /**
   * Convert to persistence model (for Prisma)
   */
  public toPersistence(): any {
    return {
      id: this.id,
      code: this.code,
      categoryId: this.categoryId,
      itemTypeId: this.itemTypeId,
      materialId: this.materialId,
      lengthCm: this.lengthCm,
      widthCm: this.widthCm,
      heightCm: this.heightCm,
      weightG: this.weightG,
      desc: this.desc,
      status: this.status,
      purchasingPrice: this.purchasingPrice,
      isManufactured: this.isManufactured,
      isPurchasable: this.isPurchasable,
      isSellable: this.isSellable,
      sellingPrice: this.sellingPrice,
      uomCode: this.uomCode,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create domain entity from persistence model
   */
  public static fromPersistence(data: any): Item {
    return new Item({
      id: data.id,
      code: data.code,
      categoryId: data.categoryId,
      itemTypeId: data.itemTypeId,
      materialId: data.materialId,
      lengthCm: data.lengthCm,
      widthCm: data.widthCm,
      heightCm: data.heightCm,
      weightG: data.weightG,
      desc: data.desc,
      status: data.status,
      purchasingPrice: data.purchasingPrice,
      isManufactured: data.isManufactured,
      isPurchasable: data.isPurchasable,
      isSellable: data.isSellable,
      sellingPrice: data.sellingPrice,
      uomCode: data.uomCode,
      itemUoms: data.itemUoms?.map((u: any) => ItemUOM.fromPersistence(u)) ?? [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}