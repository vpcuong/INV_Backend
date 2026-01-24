import { ItemUOM, ItemUOMData } from '../value-objects/item-uom.value-object';
import {
  ItemModel,
  ItemModelConstructorData,
  UpdateItemModelData,
} from '../entities/item-model.entity';
import {
  ItemSku,
  ItemSkuConstructorData,
  UpdateItemSkuData,
} from '../entities/item-sku.entity';
import {
  InvalidItemException,
  DuplicateItemModelCodeException,
  ItemModelNotFoundException,
  DuplicateSkuCodeException,
  ItemSkuNotFoundException,
  DuplicateItemUOMException,
  ItemUOMNotFoundException,
} from '../exceptions/item-domain.exception';
import { DomainEvent } from '../events';
import { ItemModelAddedEvent } from '../events/item-model-added.event';
import { ItemModelRemovedEvent } from '../events/item-model-removed.event';
import { ItemSkuAddedEvent } from '../events/item-sku-added.event';
import { ItemSkuRemovedEvent } from '../events/item-sku-removed.event';
import {
  ItemUomAddedEvent,
  ItemUomRemovedEvent,
} from '../events/item-uom-changed.event';

export enum ItemStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

export interface ItemConstructorData {
  id?: number;
  code: string;
  categoryId: number;
  itemTypeId: number;
  materialId?: number | null;
  fabricSupId?: number | null;
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
  models?: ItemModel[];
  skus?: ItemSku[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateItemData {
  code?: string;
  categoryId?: number;
  itemTypeId?: number;
  materialId?: number | null;
  fabricSupId?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  weightG?: number | null;
  desc?: string | null;
  purchasingPrice?: number | null;
  isManufactured?: boolean;
  isPurchasable?: boolean;
  isSellable?: boolean;
  sellingPrice?: number | null;
  uomCode?: string | null;
}

export interface CreateModelData {
  code: string;
  desc?: string | null;
  customerId?: number | null;
  status?: string;
}

export interface CreateSkuData {
  skuCode: string;
  colorId: number;
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

export interface CreateUomData {
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

/**
 * Item Aggregate Root
 *
 * Đây là Aggregate Root quản lý toàn bộ lifecycle của Item và các entities con:
 * - ItemModel: Các model/biến thể của Item
 * - ItemSku: Các SKU (Stock Keeping Unit) của Item
 * - ItemUOM: Các đơn vị đo lường của Item
 *
 * Tất cả thay đổi đối với Model, SKU, UOM phải đi qua Aggregate Root này
 * để đảm bảo tính nhất quán và business rules được enforce.
 *
 * @example
 * ```typescript
 * // Tạo Item mới
 * const item = new Item({
 *   code: 'ITEM001',
 *   categoryId: 1,
 *   itemTypeId: 1,
 * });
 *
 * // Thêm Model vào Item
 * const model = item.addModel({ code: 'MODEL001', desc: 'Model 1' });
 *
 * // Thêm SKU vào Model
 * const sku = item.addSku(model.getId(), { skuCode: 'SKU001', colorId: 1 });
 *
 * // Lấy domain events sau khi thực hiện các operations
 * const events = item.getDomainEvents();
 * ```
 */
export class Item {
  private id?: number;
  private code: string;
  private categoryId: number;
  private itemTypeId: number;
  private materialId?: number | null;
  private fabricSupId?: number | null;
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
  private createdAt?: Date;
  private updatedAt?: Date;

  // Child collections
  private itemUoms: ItemUOM[] = [];
  private models: ItemModel[] = [];
  private skus: ItemSku[] = [];

  // Domain events
  private domainEvents: DomainEvent[] = [];

  constructor(data: ItemConstructorData) {
    this.validateRequiredFields(data);

    this.id = data.id;
    this.code = data.code;
    this.categoryId = data.categoryId;
    this.itemTypeId = data.itemTypeId;
    this.materialId = data.materialId;
    this.fabricSupId = data.fabricSupId;
    this.lengthCm = data.lengthCm;
    this.widthCm = data.widthCm;
    this.heightCm = data.heightCm;
    this.weightG = data.weightG;
    this.desc = data.desc;
    this.status = data.status ?? ItemStatus.ACTIVE;
    this.purchasingPrice = data.purchasingPrice;
    this.isManufactured = data.isManufactured ?? false;
    this.isPurchasable = data.isPurchasable ?? false;
    this.isSellable = data.isSellable ?? false;
    this.sellingPrice = data.sellingPrice;
    this.uomCode = data.uomCode;
    this.itemUoms = data.itemUoms ?? [];
    this.models = data.models ?? [];
    this.skus = data.skus ?? [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Validate fields
   * @param data 
   */
  private validateRequiredFields(data: ItemConstructorData): void {
    if (!data.code || data.code.trim() === '') {
      throw new InvalidItemException('Item code is required');
    }
    if (!data.categoryId) {
      throw new InvalidItemException('Category ID is required');
    }
    if (!data.itemTypeId) {
      throw new InvalidItemException('Item Type ID is required');
    }
  }

  // ==================== ITEM OPERATIONS ====================

  /**
   * Update Item
   * @param data 
   */
  public update(data: UpdateItemData): void {
    if (data.code !== undefined) {
      if (!data.code || data.code.trim() === '') {
        throw new InvalidItemException('Item code is required');
      }
      this.code = data.code;
    }
    if (data.categoryId !== undefined) this.categoryId = data.categoryId;
    if (data.itemTypeId !== undefined) this.itemTypeId = data.itemTypeId;
    if (data.materialId !== undefined) this.materialId = data.materialId;
    if (data.fabricSupId !== undefined) this.fabricSupId = data.fabricSupId;
    if (data.lengthCm !== undefined) this.lengthCm = data.lengthCm;
    if (data.widthCm !== undefined) this.widthCm = data.widthCm;
    if (data.heightCm !== undefined) this.heightCm = data.heightCm;
    if (data.weightG !== undefined) this.weightG = data.weightG;
    if (data.desc !== undefined) this.desc = data.desc;
    if (data.purchasingPrice !== undefined)
      this.purchasingPrice = data.purchasingPrice;
    if (data.isManufactured !== undefined)
      this.isManufactured = data.isManufactured;
    if (data.isPurchasable !== undefined)
      this.isPurchasable = data.isPurchasable;
    if (data.isSellable !== undefined) this.isSellable = data.isSellable;
    if (data.sellingPrice !== undefined) this.sellingPrice = data.sellingPrice;
    if (data.uomCode !== undefined) this.uomCode = data.uomCode;

    this.updatedAt = new Date();
  }
  /**
   * Activate Item
   */
  public activate(): void {
    this.status = ItemStatus.ACTIVE;
    this.updatedAt = new Date();
  }
  /**
   * Deactivate Item
   */
  public deactivate(): void {
    this.status = ItemStatus.INACTIVE;
    this.updatedAt = new Date();
  }
  /**
   * Set Item to draft
   */
  public setDraft(): void {
    this.status = ItemStatus.DRAFT;
    this.updatedAt = new Date();
  }
  /**
   * Check if Item can be deleted
   * @returns boolean
   */
  public canBeDeleted(): boolean {
    return (
      this.itemUoms.length === 0 &&
      this.models.length === 0 &&
      this.skus.length === 0
    );
  }

  // ==================== MODEL OPERATIONS ====================

  /**
   * Thêm Model mới vào Item
   *
   * Model đại diện cho một biến thể/phiên bản của Item, thường được dùng
   * để phân biệt các dòng sản phẩm theo khách hàng hoặc đặc điểm riêng.
   *
   * @param data - Dữ liệu để tạo Model mới
   * @param data.code - Mã Model (bắt buộc, phải unique trong Item)
   * @param data.desc - Mô tả Model
   * @param data.customerId - ID khách hàng liên kết (nếu có)
   * @param data.status - Trạng thái Model (mặc định: 'active')
   * @returns ItemModel - Model vừa được tạo
   * @throws DuplicateItemModelCodeException - Khi mã Model đã tồn tại trong Item
   *
   * @emits ItemModelAddedEvent - Event được phát ra sau khi thêm Model thành công
   *
   * @example
   * ```typescript
   * const model = item.addModel({
   *   code: 'MODEL-ABC',
   *   desc: 'Model cho khách hàng ABC',
   *   customerId: 123,
   * });
   * ```
   */
  public addModel(data: CreateModelData): ItemModel {
    // Check for duplicate code
    if (this.models.some((m) => m.getCode() === data.code)) {
      throw new DuplicateItemModelCodeException(data.code);
    }

    const model = new ItemModel({
      itemId: this.id!,
      code: data.code,
      desc: data.desc,
      customerId: data.customerId,
      status: data.status,
    });

    this.models.push(model);
    this.updatedAt = new Date();

    // Add domain event
    this.domainEvents.push(
      new ItemModelAddedEvent(this.id!, model.getId() ?? 0, model.getCode()),
    );

    return model;
  }

  /**
   * Cập nhật thông tin Model đã tồn tại
   *
   * @param modelId - ID của Model cần cập nhật
   * @param data - Dữ liệu cần cập nhật
   * @param data.code - Mã Model mới (nếu thay đổi, phải unique)
   * @param data.desc - Mô tả mới
   * @param data.customerId - ID khách hàng mới
   * @param data.status - Trạng thái mới
   * @returns ItemModel - Model sau khi cập nhật
   * @throws ItemModelNotFoundException - Khi không tìm thấy Model với ID đã cho
   * @throws DuplicateItemModelCodeException - Khi mã Model mới đã tồn tại trong Item
   *
   * @example
   * ```typescript
   * const updatedModel = item.updateModel(1, {
   *   desc: 'Mô tả mới',
   *   status: 'inactive',
   * });
   * ```
   */
  public updateModel(modelId: number, data: UpdateItemModelData): ItemModel {
    const model = this.findModel(modelId);
    if (!model) {
      throw new ItemModelNotFoundException(modelId);
    }

    // Check for duplicate code if code is being updated
    if (data.code && data.code !== model.getCode()) {
      if (this.models.some((m) => m.getCode() === data.code)) {
        throw new DuplicateItemModelCodeException(data.code);
      }
    }

    model.update(data);
    this.updatedAt = new Date();
    return model;
  }

  /**
   * Xóa Model khỏi Item
   *
   * Lưu ý: Không thể xóa Model nếu còn SKU liên kết với Model đó.
   * Phải xóa tất cả SKU trước khi xóa Model.
   *
   * @param modelId - ID của Model cần xóa
   * @throws ItemModelNotFoundException - Khi không tìm thấy Model với ID đã cho
   * @throws InvalidItemException - Khi Model còn SKU liên kết
   *
   * @emits ItemModelRemovedEvent - Event được phát ra sau khi xóa Model thành công
   *
   * @example
   * ```typescript
   * // Xóa tất cả SKU của Model trước
   * item.getSkus()
   *   .filter(sku => sku.getModelId() === modelId)
   *   .forEach(sku => item.removeSku(sku.getId()));
   *
   * // Sau đó mới xóa Model
   * item.removeModel(modelId);
   * ```
   */
  public removeModel(modelId: number): void {
    const modelIndex = this.models.findIndex((m) => m.getId() === modelId);
    if (modelIndex === -1) {
      throw new ItemModelNotFoundException(modelId);
    }

    const model = this.models[modelIndex];

    // Check if model has SKUs
    const modelSkus = this.skus.filter((s) => s.getModelId() === modelId);
    if (modelSkus.length > 0) {
      throw new InvalidItemException(
        `Cannot remove model ${model.getCode()} because it has ${modelSkus.length} SKU(s)`,
      );
    }

    this.models.splice(modelIndex, 1);
    this.updatedAt = new Date();

    // Add domain event
    this.domainEvents.push(
      new ItemModelRemovedEvent(this.id!, modelId, model.getCode()),
    );
  }

  /**
   * findModel by modelId
   * @param modelId 
   * @returns ItemModel | undefined
   */
  public findModel(modelId: number): ItemModel | undefined {
    return this.models.find((m) => m.getId() === modelId);
  }

  /**
   * findModel by code
   * @param code 
   * @returns ItemModel | undefined
   */
  public findModelByCode(code: string): ItemModel | undefined {
    return this.models.find((m) => m.getCode() === code);
  }

  // ==================== SKU OPERATIONS ====================

  /**
   * Thêm SKU mới vào Item
   *
   * SKU (Stock Keeping Unit) là đơn vị quản lý kho, đại diện cho một
   * biến thể cụ thể của sản phẩm với các thuộc tính như màu sắc, size, v.v.
   *
   * SKU có thể thuộc về một Model cụ thể hoặc không (modelId = null).
   *
   * @param modelId - ID của Model chứa SKU (null nếu SKU không thuộc Model nào)
   * @param data - Dữ liệu để tạo SKU mới
   * @param data.skuCode - Mã SKU (bắt buộc, phải unique trong Item)
   * @param data.colorId - ID màu sắc (bắt buộc)
   * @param data.genderId - ID giới tính
   * @param data.sizeId - ID size
   * @param data.supplierId - ID nhà cung cấp
   * @param data.costPrice - Giá vốn
   * @param data.sellingPrice - Giá bán
   * @returns ItemSku - SKU vừa được tạo
   * @throws ItemModelNotFoundException - Khi modelId được cung cấp nhưng không tìm thấy Model
   * @throws DuplicateSkuCodeException - Khi mã SKU đã tồn tại trong Item
   *
   * @emits ItemSkuAddedEvent - Event được phát ra sau khi thêm SKU thành công
   *
   * @example
   * ```typescript
   * // Thêm SKU vào Model
   * const sku = item.addSku(modelId, {
   *   skuCode: 'SKU-RED-M',
   *   colorId: 1,
   *   sizeId: 2,
   *   costPrice: 100000,
   *   sellingPrice: 150000,
   * });
   *
   * // Thêm SKU không thuộc Model nào
   * const sku2 = item.addSku(null, {
   *   skuCode: 'SKU-DEFAULT',
   *   colorId: 1,
   * });
   * ```
   */
  public addSku(modelId: number | null, data: CreateSkuData): ItemSku {
    // Validate model exists if modelId is provided
    if (modelId !== null) {
      const model = this.findModel(modelId);
      if (!model) {
        throw new ItemModelNotFoundException(modelId);
      }
    }

    // Check for duplicate SKU code
    if (this.skus.some((s) => s.getSkuCode() === data.skuCode)) {
      throw new DuplicateSkuCodeException(data.skuCode);
    }

    const sku = new ItemSku({
      itemId: this.id,
      modelId: modelId,
      skuCode: data.skuCode,
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
    });

    this.skus.push(sku);
    this.updatedAt = new Date();

    // Add domain event
    this.domainEvents.push(
      new ItemSkuAddedEvent(
        this.id!,
        modelId,
        sku.getId() ?? 0,
        sku.getSkuCode(),
      ),
    );

    return sku;
  }

  /**
   * Cập nhật thông tin SKU đã tồn tại
   *
   * @param skuId - ID của SKU cần cập nhật
   * @param data - Dữ liệu cần cập nhật
   * @returns ItemSku - SKU sau khi cập nhật
   * @throws ItemSkuNotFoundException - Khi không tìm thấy SKU với ID đã cho
   *
   * @example
   * ```typescript
   * const updatedSku = item.updateSku(1, {
   *   costPrice: 120000,
   *   sellingPrice: 180000,
   *   status: 'inactive',
   * });
   * ```
   */
  public updateSku(skuId: number, data: UpdateItemSkuData): ItemSku {
    const sku = this.findSku(skuId);
    if (!sku) {
      throw new ItemSkuNotFoundException(skuId);
    }

    sku.update(data);
    this.updatedAt = new Date();
    return sku;
  }

  /**
   * Xóa SKU khỏi Item
   *
   * @param skuId - ID của SKU cần xóa
   * @throws ItemSkuNotFoundException - Khi không tìm thấy SKU với ID đã cho
   *
   * @emits ItemSkuRemovedEvent - Event được phát ra sau khi xóa SKU thành công
   *
   * @example
   * ```typescript
   * item.removeSku(1);
   * ```
   */
  public removeSku(skuId: number): void {
    const skuIndex = this.skus.findIndex((s) => s.getId() === skuId);
    if (skuIndex === -1) {
      throw new ItemSkuNotFoundException(skuId);
    }

    const sku = this.skus[skuIndex];
    this.skus.splice(skuIndex, 1);
    this.updatedAt = new Date();

    // Add domain event
    this.domainEvents.push(
      new ItemSkuRemovedEvent(this.id!, skuId, sku.getSkuCode()),
    );
  }

  /**
   * Tìm SKU theo ID
   *
   * @param skuId - ID của SKU cần tìm
   * @returns ItemSku | undefined - SKU tìm được hoặc undefined nếu không tồn tại
   */
  public findSku(skuId: number): ItemSku | undefined {
    return this.skus.find((s) => s.getId() === skuId);
  }

  /**
   * Tìm SKU theo mã SKU
   *
   * @param code - Mã SKU cần tìm
   * @returns ItemSku | undefined - SKU tìm được hoặc undefined nếu không tồn tại
   */
  public findSkuByCode(code: string): ItemSku | undefined {
    return this.skus.find((s) => s.getSkuCode() === code);
  }

  // ==================== UOM OPERATIONS ====================

  /**
   * Thêm đơn vị đo lường (UOM) mới vào Item
   *
   * UOM được sử dụng để quản lý các đơn vị đo lường khác nhau của Item,
   * cho phép chuyển đổi giữa các đơn vị (ví dụ: từ Hộp sang Cái).
   *
   * Lưu ý: Không thể thêm UOM trùng với base UOM của Item.
   *
   * @param data - Dữ liệu để tạo UOM mới
   * @param data.uomCode - Mã UOM (bắt buộc, phải unique và khác base UOM)
   * @param data.toBaseFactor - Hệ số chuyển đổi sang base UOM (bắt buộc)
   * @param data.roundingPrecision - Độ chính xác làm tròn
   * @param data.isDefaultTransUom - Có phải UOM giao dịch mặc định không
   * @param data.isPurchasingUom - Có phải UOM mua hàng không
   * @param data.isSalesUom - Có phải UOM bán hàng không
   * @param data.isManufacturingUom - Có phải UOM sản xuất không
   * @returns ItemUOM - UOM vừa được tạo
   * @throws InvalidItemException - Khi thêm UOM trùng với base UOM
   * @throws DuplicateItemUOMException - Khi mã UOM đã tồn tại trong Item
   *
   * @emits ItemUomAddedEvent - Event được phát ra sau khi thêm UOM thành công
   *
   * @example
   * ```typescript
   * // Item có base UOM là 'PCS' (cái)
   * const boxUom = item.addUOM({
   *   uomCode: 'BOX',
   *   toBaseFactor: 12, // 1 BOX = 12 PCS
   *   isPurchasingUom: true,
   * });
   * ```
   */
  public addUOM(data: CreateUomData): ItemUOM {
    // Check if base UOM
    if (data.uomCode === this.uomCode) {
      throw new InvalidItemException('Cannot add base UOM as ItemUOM');
    }

    // Check for duplicate
    if (this.hasUOM(data.uomCode)) {
      throw new DuplicateItemUOMException(data.uomCode);
    }

    const uom = new ItemUOM({
      itemId: this.id!,
      uomCode: data.uomCode,
      toBaseFactor: data.toBaseFactor,
      roundingPrecision: data.roundingPrecision,
      isDefaultTransUom: data.isDefaultTransUom,
      isPurchasingUom: data.isPurchasingUom,
      isSalesUom: data.isSalesUom,
      isManufacturingUom: data.isManufacturingUom,
      isActive: data.isActive,
      desc: data.desc,
    });

    this.itemUoms.push(uom);
    this.updatedAt = new Date();

    // Add domain event
    this.domainEvents.push(new ItemUomAddedEvent(this.id!, data.uomCode));

    return uom;
  }

  /**
   * Xóa UOM khỏi Item
   *
   * @param uomCode - Mã UOM cần xóa
   * @throws ItemUOMNotFoundException - Khi không tìm thấy UOM với mã đã cho
   *
   * @emits ItemUomRemovedEvent - Event được phát ra sau khi xóa UOM thành công
   *
   * @example
   * ```typescript
   * item.removeUOM('BOX');
   * ```
   */
  public removeUOM(uomCode: string): void {
    const index = this.itemUoms.findIndex((u) => u.getUomCode() === uomCode);
    if (index === -1) {
      throw new ItemUOMNotFoundException(uomCode);
    }

    this.itemUoms.splice(index, 1);
    this.updatedAt = new Date();

    // Add domain event
    this.domainEvents.push(new ItemUomRemovedEvent(this.id!, uomCode));
  }

  /**
   * Kiểm tra Item có UOM với mã đã cho không
   *
   * @param uomCode - Mã UOM cần kiểm tra
   * @returns boolean - true nếu tồn tại, false nếu không
   */
  public hasUOM(uomCode: string): boolean {
    return this.itemUoms.some((u) => u.getUomCode() === uomCode);
  }

  /**
   * Tìm UOM theo mã
   *
   * @param uomCode - Mã UOM cần tìm
   * @returns ItemUOM | undefined - UOM tìm được hoặc undefined nếu không tồn tại
   */
  public findUOM(uomCode: string): ItemUOM | undefined {
    return this.itemUoms.find((u) => u.getUomCode() === uomCode);
  }

  /**
   * Chuyển đổi số lượng giữa hai đơn vị đo lường
   *
   * Sử dụng để chuyển đổi số lượng từ UOM này sang UOM khác dựa trên
   * hệ số chuyển đổi (toBaseFactor) đã được định nghĩa.
   *
   * @param fromUomCode - Mã UOM nguồn
   * @param toUomCode - Mã UOM đích
   * @param quantity - Số lượng cần chuyển đổi
   * @returns number - Số lượng sau khi chuyển đổi
   * @throws ItemUOMNotFoundException - Khi không tìm thấy UOM nguồn hoặc đích
   *
   * @example
   * ```typescript
   * // 1 BOX = 12 PCS, 1 CARTON = 10 BOX = 120 PCS
   * const pcsQuantity = item.convertQuantity('BOX', 'PCS', 5); // = 60
   * const cartonQuantity = item.convertQuantity('PCS', 'CARTON', 240); // = 2
   * ```
   */
  public convertQuantity(
    fromUomCode: string,
    toUomCode: string,
    quantity: number,
  ): number {
    if (fromUomCode === toUomCode) {
      return quantity;
    }

    const fromUom = this.findUOM(fromUomCode);
    const toUom = this.findUOM(toUomCode);

    if (!fromUom) {
      throw new ItemUOMNotFoundException(fromUomCode);
    }
    if (!toUom) {
      throw new ItemUOMNotFoundException(toUomCode);
    }

    return fromUom.convertTo(toUom, quantity);
  }

  // ==================== DOMAIN EVENTS ====================

  /**
   * Lấy danh sách Domain Events đã được phát sinh
   *
   * Domain Events được tạo ra khi có các thay đổi quan trọng trong Aggregate
   * (thêm/xóa Model, SKU, UOM). Events này nên được publish sau khi
   * persist Aggregate thành công.
   *
   * @returns DomainEvent[] - Danh sách các events (bản copy, không phải reference)
   *
   * @example
   * ```typescript
   * const item = await repository.findById(1);
   * item.addModel({ code: 'MODEL001' });
   * await repository.saveWithChildren(item);
   *
   * // Publish events sau khi save thành công
   * for (const event of item.getDomainEvents()) {
   *   eventBus.emit(event.constructor.name, event);
   * }
   * item.clearDomainEvents();
   * ```
   */
  public getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  /**
   * Xóa tất cả Domain Events đã được phát sinh
   *
   * Nên gọi method này sau khi đã publish tất cả events để tránh
   * publish trùng lặp trong các lần save tiếp theo.
   */
  public clearDomainEvents(): void {
    this.domainEvents = [];
  }

  // ==================== GETTERS ====================

  public getId(): number | undefined {
    return this.id;
  }

  public getCode(): string {
    return this.code;
  }

  public getCategoryId(): number {
    return this.categoryId;
  }

  public getItemTypeId(): number {
    return this.itemTypeId;
  }

  public getMaterialId(): number | null | undefined {
    return this.materialId;
  }

  public getFabricSupId(): number | null | undefined {
    return this.fabricSupId;
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

  public getStatus(): string | null {
    return this.status;
  }

  public getUomCode(): string | null | undefined {
    return this.uomCode;
  }

  public getPurchasingPrice(): number | null | undefined {
    return this.purchasingPrice;
  }

  public getSellingPrice(): number | null | undefined {
    return this.sellingPrice;
  }

  public getIsPurchasable(): boolean {
    return this.isPurchasable;
  }

  public getIsSellable(): boolean {
    return this.isSellable;
  }

  public getIsManufactured(): boolean {
    return this.isManufactured;
  }

  public getItemUOMs(): ItemUOM[] {
    return [...this.itemUoms];
  }

  public getModels(): ItemModel[] {
    return [...this.models];
  }

  public getSkus(): ItemSku[] {
    return [...this.skus];
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  // ==================== PERSISTENCE ====================

  /**
   * Chuyển đổi Aggregate thành dạng plain object để lưu vào database
   *
   * Method này chỉ serialize các field của Item, không bao gồm
   * các child collections (models, skus, uoms). Các children được
   * sync riêng trong repository.
   *
   * @returns Plain object chứa dữ liệu Item để persist
   */
  public toPersistence(): any {
    return {
      id: this.id,
      code: this.code,
      categoryId: this.categoryId,
      itemTypeId: this.itemTypeId,
      materialId: this.materialId,
      fabricSupId: this.fabricSupId,
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
   * Khôi phục Aggregate từ dữ liệu database
   *
   * Factory method để tạo Item instance từ dữ liệu đã được load từ database.
   * Bao gồm cả việc khôi phục các child collections (models, skus, uoms).
   *
   * @param data - Dữ liệu từ database (bao gồm cả relations)
   * @returns Item - Instance của Item Aggregate được khôi phục
   *
   * @example
   * ```typescript
   * const data = await prisma.item.findUnique({
   *   where: { id: 1 },
   *   include: { models: true, skus: true, itemUoms: true },
   * });
   * const item = Item.fromPersistence(data);
   * ```
   */
  public static fromPersistence(data: any): Item {
    return new Item({
      id: data.id,
      code: data.code,
      categoryId: data.categoryId,
      itemTypeId: data.itemTypeId,
      materialId: data.materialId,
      fabricSupId: data.fabricSupId,
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
      itemUoms:
        data.itemUoms?.map((u: any) => ItemUOM.fromPersistence(u)) ?? [],
      models:
        data.models?.map((m: any) => ItemModel.fromPersistence(m)) ?? [],
      skus: data.skus?.map((s: any) => ItemSku.fromPersistence(s)) ?? [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
