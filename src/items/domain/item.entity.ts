import { ItemStatus } from './item-status.enum';
import { ItemUOM } from './item-uom.value-object';

export interface ItemConstructorData {
  id: number;
  name: string;
  categoryId: number;
  itemTypeId: number;
  materialId?: number | null;
  model?: string | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  weightG?: number | null;
  notes?: string | null;
  status?: string | null;
  hasSku?: boolean;
  costPrice?: number | null;
  isManufactured?: boolean;
  isPurchasable?: boolean;
  isSellable?: boolean;
  sellingPrice?: number | null;
  uomCode?: string | null;
  itemUoms?: ItemUOM[];
}

export class Item {
  private id: number;
  private name: string;
  private categoryId: number;
  private itemTypeId: number;
  private materialId?: number | null;
  private model?: string | null;
  private lengthCm?: number | null;
  private widthCm?: number | null;
  private heightCm?: number | null;
  private weightG?: number | null;
  private notes?: string | null;
  private status: string | null;
  private hasSku: boolean;
  private costPrice?: number | null;
  private isManufactured: boolean;
  private isPurchasable: boolean;
  private isSellable: boolean;
  private sellingPrice?: number | null;
  private uomCode?: string | null;
  private itemUoms: ItemUOM[] = [];

  constructor(data: ItemConstructorData) {
    this.id = data.id;
    this.name = data.name;
    this.categoryId = data.categoryId;
    this.itemTypeId = data.itemTypeId;
    this.materialId = data.materialId;
    this.model = data.model;
    this.lengthCm = data.lengthCm;
    this.widthCm = data.widthCm;
    this.heightCm = data.heightCm;
    this.weightG = data.weightG;
    this.notes = data.notes;
    this.status = data.status ?? null;
    this.hasSku = data.hasSku ?? false;
    this.costPrice = data.costPrice;
    this.isManufactured = data.isManufactured ?? false;
    this.isPurchasable = data.isPurchasable ?? false;
    this.isSellable = data.isSellable ?? false;
    this.sellingPrice = data.sellingPrice;
    this.uomCode = data.uomCode;
    this.itemUoms = data.itemUoms ?? [];
  }

  /**
   * Business rule: Check if item can be deleted
   */
  public canBeDeleted(): boolean {
    return this.itemUoms.length === 0 && !this.hasSku;
  }

  /**
   * Business rule: Update item prices with validation
   */
  public updatePrice(costPrice?: number | null, sellingPrice?: number | null): void {
    if (costPrice !== undefined && costPrice !== null && costPrice < 0) {
      throw new Error('Cost price cannot be negative');
    }
    if (sellingPrice !== undefined && sellingPrice !== null && sellingPrice < 0) {
      throw new Error('Selling price cannot be negative');
    }
    if (
      costPrice &&
      sellingPrice &&
      sellingPrice < costPrice
    ) {
      console.warn(`Warning: Selling price (${sellingPrice}) is less than cost price (${costPrice})`);
    }

    if (costPrice !== undefined) {
      this.costPrice = costPrice;
    }
    if (sellingPrice !== undefined) {
      this.sellingPrice = sellingPrice;
    }
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
      this.name &&
      this.categoryId &&
      this.itemTypeId &&
      this.uomCode
    );
  }

  // Getters
  public getId(): number { return this.id; }
  public getName(): string { return this.name; }
  public getCategoryId(): number { return this.categoryId; }
  public getItemTypeId(): number { return this.itemTypeId; }
  public getMaterialId(): number | null | undefined { return this.materialId; }
  public getModel(): string | null | undefined { return this.model; }
  public getStatus(): string | null { return this.status; }
  public getUomCode(): string | null | undefined { return this.uomCode; }
  public getCostPrice(): number | null | undefined { return this.costPrice; }
  public getSellingPrice(): number | null | undefined { return this.sellingPrice; }
  public getIsPurchasable(): boolean { return this.isPurchasable; }
  public getIsSellable(): boolean { return this.isSellable; }
  public getIsManufactured(): boolean { return this.isManufactured; }
  public getHasSku(): boolean { return this.hasSku; }
  public getItemUOMs(): ItemUOM[] { return [...this.itemUoms]; }

  /**
   * Convert to persistence model (for Prisma)
   */
  public toPersistence(): any {
    return {
      id: this.id,
      name: this.name,
      categoryId: this.categoryId,
      itemTypeId: this.itemTypeId,
      materialId: this.materialId,
      model: this.model,
      lengthCm: this.lengthCm,
      widthCm: this.widthCm,
      heightCm: this.heightCm,
      weightG: this.weightG,
      notes: this.notes,
      status: this.status,
      hasSku: this.hasSku,
      costPrice: this.costPrice,
      isManufactured: this.isManufactured,
      isPurchasable: this.isPurchasable,
      isSellable: this.isSellable,
      sellingPrice: this.sellingPrice,
      uomCode: this.uomCode,
    };
  }

  /**
   * Create domain entity from persistence model
   */
  public static fromPersistence(data: any): Item {
    return new Item({
      id: data.id,
      name: data.name,
      categoryId: data.categoryId,
      itemTypeId: data.itemTypeId,
      materialId: data.materialId,
      model: data.model,
      lengthCm: data.lengthCm,
      widthCm: data.widthCm,
      heightCm: data.heightCm,
      weightG: data.weightG,
      notes: data.notes,
      status: data.status,
      hasSku: data.hasSku,
      costPrice: data.costPrice,
      isManufactured: data.isManufactured,
      isPurchasable: data.isPurchasable,
      isSellable: data.isSellable,
      sellingPrice: data.sellingPrice,
      uomCode: data.uomCode,
      itemUoms: data.itemUoms?.map((u: any) => ItemUOM.fromPersistence(u)) ?? [],
    });
  }
}