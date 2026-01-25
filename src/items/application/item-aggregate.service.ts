import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Item,
  CreateModelData,
  CreateSkuData,
  CreateUomData,
  UpdateItemData,
} from '../domain/aggregates/item.aggregate';
import { ItemModel, UpdateItemModelData } from '../domain/entities/item-model.entity';
import { ItemSku, UpdateItemSkuData } from '../domain/entities/item-sku.entity';
import { ItemUOM } from '../domain/value-objects/item-uom.value-object';
import { IItemRepository } from '../domain/item.repository.interface';
import {
  ItemNotFoundException,
  ItemModelNotFoundException,
  ItemSkuNotFoundException,
} from '../domain/exceptions/item-domain.exception';

export interface CreateItemDto {
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
  status?: string;
  purchasingPrice?: number | null;
  isManufactured?: boolean;
  isPurchasable?: boolean;
  isSellable?: boolean;
  sellingPrice?: number | null;
  uomCode?: string | null;
}

export interface UpdateItemDto {
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

export interface CreateModelDto {
  code: string;
  desc?: string | null;
  customerId?: number | null;
  status?: string;
}

export interface UpdateModelDto {
  code?: string;
  desc?: string | null;
  customerId?: number | null;
  status?: string;
}

export interface CreateSkuDto {
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

export interface UpdateSkuDto {
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

export interface CreateUomDto {
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

export interface UpdateUomDto {
  toBaseFactor?: number;
  roundingPrecision?: number;
  isDefaultTransUom?: boolean;
  isPurchasingUom?: boolean;
  isSalesUom?: boolean;
  isManufacturingUom?: boolean;
  isActive?: boolean;
  desc?: string;
}

@Injectable()
export class ItemAggregateService {
  constructor(
    @Inject('IItemRepository')
    private readonly repository: IItemRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ==================== ITEM OPERATIONS ====================

  async createItem(dto: CreateItemDto): Promise<Item> {
    // Check for duplicate code
    const exists = await this.repository.existsByCode(dto.code);
    if (exists) {
      throw new ConflictException(`Item with code ${dto.code} already exists`);
    }

    const item = new Item({
      code: dto.code,
      categoryId: dto.categoryId,
      itemTypeId: dto.itemTypeId,
      materialId: dto.materialId,
      fabricSupId: dto.fabricSupId,
      lengthCm: dto.lengthCm,
      widthCm: dto.widthCm,
      heightCm: dto.heightCm,
      weightG: dto.weightG,
      desc: dto.desc,
      status: dto.status,
      purchasingPrice: dto.purchasingPrice,
      isManufactured: dto.isManufactured,
      isPurchasable: dto.isPurchasable,
      isSellable: dto.isSellable,
      sellingPrice: dto.sellingPrice,
      uomCode: dto.uomCode,
    });

    const savedItem = await this.repository.save(item);
    await this.publishEvents(savedItem);
    return savedItem;
  }

  async updateItem(id: number, dto: UpdateItemDto): Promise<Item> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new ItemNotFoundException(id);
    }

    // Check for duplicate code if code is being updated
    if (dto.code && dto.code !== item.getCode()) {
      const exists = await this.repository.existsByCode(dto.code, id);
      if (exists) {
        throw new ConflictException(`Item with code ${dto.code} already exists`);
      }
    }

    item.update(dto as UpdateItemData);
    const savedItem = await this.repository.update(item);
    await this.publishEvents(savedItem);
    return savedItem;
  }

  async deleteItem(id: number): Promise<void> {
    const item = await this.repository.findByIdComplete(id);
    if (!item) {
      throw new ItemNotFoundException(id);
    }

    if (!item.canBeDeleted()) {
      throw new ConflictException(
        'Cannot delete item with existing models, SKUs, or UOMs',
      );
    }

    await this.repository.delete(id);
  }

  async activateItem(id: number): Promise<Item> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new ItemNotFoundException(id);
    }

    item.activate();
    return this.repository.update(item);
  }

  async deactivateItem(id: number): Promise<Item> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new ItemNotFoundException(id);
    }

    item.deactivate();
    return this.repository.update(item);
  }

  async setItemDraft(id: number): Promise<Item> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new ItemNotFoundException(id);
    }

    item.setDraft();
    return this.repository.update(item);
  }

  async getItemById(id: number): Promise<Item> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new ItemNotFoundException(id);
    }
    return item;
  }

  async getItemComplete(id: number): Promise<Item> {
    const item = await this.repository.findByIdComplete(id);
    if (!item) {
      throw new ItemNotFoundException(id);
    }
    return item;
  }

  // ==================== ITEM OPERATIONS BY PUBLIC ID ====================

  /**
   * Update item by publicId
   * @param publicId - ULID public identifier
   * @param dto - Update data
   */
  async updateItemByPublicId(publicId: string, dto: UpdateItemDto): Promise<Item> {
    const item = await this.repository.findByPublicId(publicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${publicId} not found`);
    }

    // Check for duplicate code if code is being updated
    if (dto.code && dto.code !== item.getCode()) {
      const exists = await this.repository.existsByCode(dto.code, item.getId());
      if (exists) {
        throw new ConflictException(`Item with code ${dto.code} already exists`);
      }
    }

    item.update(dto as UpdateItemData);
    const savedItem = await this.repository.update(item);
    await this.publishEvents(savedItem);
    return savedItem;
  }

  /**
   * Delete item by publicId
   * @param publicId - ULID public identifier
   */
  async deleteItemByPublicId(publicId: string): Promise<void> {
    const item = await this.repository.findByPublicIdComplete(publicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${publicId} not found`);
    }

    if (!item.canBeDeleted()) {
      throw new ConflictException(
        'Cannot delete item with existing models, SKUs, or UOMs',
      );
    }

    await this.repository.delete(item.getId()!);
  }

  /**
   * Activate item by publicId
   * @param publicId - ULID public identifier
   */
  async activateItemByPublicId(publicId: string): Promise<Item> {
    const item = await this.repository.findByPublicId(publicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${publicId} not found`);
    }

    item.activate();
    return this.repository.update(item);
  }

  /**
   * Deactivate item by publicId
   * @param publicId - ULID public identifier
   */
  async deactivateItemByPublicId(publicId: string): Promise<Item> {
    const item = await this.repository.findByPublicId(publicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${publicId} not found`);
    }

    item.deactivate();
    return this.repository.update(item);
  }

  /**
   * Set item to draft status by publicId
   * @param publicId - ULID public identifier
   */
  async setItemDraftByPublicId(publicId: string): Promise<Item> {
    const item = await this.repository.findByPublicId(publicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${publicId} not found`);
    }

    item.setDraft();
    return this.repository.update(item);
  }

  // ==================== MODEL OPERATIONS ====================

  async addModelToItem(itemId: number, dto: CreateModelDto): Promise<ItemModel> {
    const item = await this.repository.findByIdWithModels(itemId);
    if (!item) {
      throw new ItemNotFoundException(itemId);
    }

    // Check for duplicate model code globally
    const exists = await this.repository.existsModelByCode(dto.code);
    if (exists) {
      throw new ConflictException(`Model with code ${dto.code} already exists`);
    }

    const model = item.addModel(dto as CreateModelData);
    await this.repository.saveWithChildren(item);
    await this.publishEvents(item);

    return model;
  }

  async updateModel(
    itemId: number,
    modelId: number,
    dto: UpdateModelDto,
  ): Promise<ItemModel> {
    const item = await this.repository.findByIdWithModels(itemId);
    if (!item) {
      throw new ItemNotFoundException(itemId);
    }

    // Check for duplicate model code if code is being updated
    if (dto.code) {
      const exists = await this.repository.existsModelByCode(dto.code, modelId);
      if (exists) {
        throw new ConflictException(`Model with code ${dto.code} already exists`);
      }
    }

    const model = item.updateModel(modelId, dto as UpdateItemModelData);
    await this.repository.saveWithChildren(item);
    await this.publishEvents(item);

    return model;
  }

  async removeModel(itemId: number, modelId: number): Promise<void> {
    const item = await this.repository.findByIdComplete(itemId);
    if (!item) {
      throw new ItemNotFoundException(itemId);
    }

    item.removeModel(modelId);
    await this.repository.saveWithChildren(item);
    await this.publishEvents(item);
  }

  async activateModel(itemId: number, modelId: number): Promise<ItemModel> {
    const item = await this.repository.findByIdWithModels(itemId);
    if (!item) {
      throw new ItemNotFoundException(itemId);
    }

    const model = item.findModel(modelId);
    if (!model) {
      throw new ItemModelNotFoundException(modelId);
    }

    model.activate();
    await this.repository.saveWithChildren(item);
    return model;
  }

  async deactivateModel(itemId: number, modelId: number): Promise<ItemModel> {
    const item = await this.repository.findByIdWithModels(itemId);
    if (!item) {
      throw new ItemNotFoundException(itemId);
    }

    const model = item.findModel(modelId);
    if (!model) {
      throw new ItemModelNotFoundException(modelId);
    }

    model.deactivate();
    await this.repository.saveWithChildren(item);
    return model;
  }

  // ==================== MODEL OPERATIONS BY PUBLIC ID ====================

  /**
   * Add model to item by item's publicId
   * @param itemPublicId - Item's ULID public identifier
   * @param dto - Model creation data
   */
  async addModelToItemByPublicId(itemPublicId: string, dto: CreateModelDto): Promise<ItemModel> {
    const item = await this.repository.findByPublicIdComplete(itemPublicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${itemPublicId} not found`);
    }

    const exists = await this.repository.existsModelByCode(dto.code);
    if (exists) {
      throw new ConflictException(`Model with code ${dto.code} already exists`);
    }

    const model = item.addModel(dto as CreateModelData);
    await this.repository.saveWithChildren(item);
    await this.publishEvents(item);

    return model;
  }

  /**
   * Update model by publicIds
   * @param itemPublicId - Item's ULID public identifier
   * @param modelPublicId - Model's ULID public identifier
   * @param dto - Update data
   */
  async updateModelByPublicId(
    itemPublicId: string,
    modelPublicId: string,
    dto: UpdateModelDto,
  ): Promise<ItemModel> {
    const item = await this.repository.findByPublicIdComplete(itemPublicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${itemPublicId} not found`);
    }

    const model = item.findModelByPublicId(modelPublicId);
    if (!model) {
      throw new NotFoundException(`Model with publicId ${modelPublicId} not found`);
    }

    if (dto.code) {
      const exists = await this.repository.existsModelByCode(dto.code, model.getId());
      if (exists) {
        throw new ConflictException(`Model with code ${dto.code} already exists`);
      }
    }

    model.update(dto as UpdateItemModelData);
    await this.repository.saveWithChildren(item);
    await this.publishEvents(item);

    return model;
  }

  /**
   * Remove model by publicIds
   * @param itemPublicId - Item's ULID public identifier
   * @param modelPublicId - Model's ULID public identifier
   */
  async removeModelByPublicId(itemPublicId: string, modelPublicId: string): Promise<void> {
    const item = await this.repository.findByPublicIdComplete(itemPublicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${itemPublicId} not found`);
    }

    const model = item.findModelByPublicId(modelPublicId);
    if (!model) {
      throw new NotFoundException(`Model with publicId ${modelPublicId} not found`);
    }

    item.removeModel(model.getId()!);
    await this.repository.saveWithChildren(item);
    await this.publishEvents(item);
  }

  /**
   * Activate model by publicIds
   * @param itemPublicId - Item's ULID public identifier
   * @param modelPublicId - Model's ULID public identifier
   */
  async activateModelByPublicId(itemPublicId: string, modelPublicId: string): Promise<ItemModel> {
    const item = await this.repository.findByPublicIdComplete(itemPublicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${itemPublicId} not found`);
    }

    const model = item.findModelByPublicId(modelPublicId);
    if (!model) {
      throw new NotFoundException(`Model with publicId ${modelPublicId} not found`);
    }

    model.activate();
    await this.repository.saveWithChildren(item);
    return model;
  }

  /**
   * Deactivate model by publicIds
   * @param itemPublicId - Item's ULID public identifier
   * @param modelPublicId - Model's ULID public identifier
   */
  async deactivateModelByPublicId(itemPublicId: string, modelPublicId: string): Promise<ItemModel> {
    const item = await this.repository.findByPublicIdComplete(itemPublicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${itemPublicId} not found`);
    }

    const model = item.findModelByPublicId(modelPublicId);
    if (!model) {
      throw new NotFoundException(`Model with publicId ${modelPublicId} not found`);
    }

    model.deactivate();
    await this.repository.saveWithChildren(item);
    return model;
  }

  // ==================== SKU OPERATIONS ====================

  async addSkuToItem(
    itemId: number,
    modelId: number | null,
    dto: CreateSkuDto,
  ): Promise<ItemSku> {
    const item = await this.repository.findByIdComplete(itemId);
    if (!item) {
      throw new ItemNotFoundException(itemId);
    }

    // Check for duplicate SKU code globally
    const exists = await this.repository.existsSkuByCode(dto.skuCode);
    if (exists) {
      throw new ConflictException(`SKU with code ${dto.skuCode} already exists`);
    }

    const sku = item.addSku(modelId, dto as CreateSkuData);
    await this.repository.saveWithChildren(item);
    await this.publishEvents(item);

    return sku;
  }

  async updateSku(
    itemId: number,
    skuId: number,
    dto: UpdateSkuDto,
  ): Promise<ItemSku> {
    const item = await this.repository.findByIdComplete(itemId);
    if (!item) {
      throw new ItemNotFoundException(itemId);
    }

    const sku = item.updateSku(skuId, dto as UpdateItemSkuData);
    await this.repository.saveWithChildren(item);
    await this.publishEvents(item);

    return sku;
  }

  async removeSku(itemId: number, skuId: number): Promise<void> {
    const item = await this.repository.findByIdComplete(itemId);
    if (!item) {
      throw new ItemNotFoundException(itemId);
    }

    item.removeSku(skuId);
    await this.repository.saveWithChildren(item);
    await this.publishEvents(item);
  }

  async activateSku(itemId: number, skuId: number): Promise<ItemSku> {
    const item = await this.repository.findByIdComplete(itemId);
    if (!item) {
      throw new ItemNotFoundException(itemId);
    }

    const sku = item.findSku(skuId);
    if (!sku) {
      throw new ItemSkuNotFoundException(skuId);
    }

    sku.activate();
    await this.repository.saveWithChildren(item);
    return sku;
  }

  async deactivateSku(itemId: number, skuId: number): Promise<ItemSku> {
    const item = await this.repository.findByIdComplete(itemId);
    if (!item) {
      throw new ItemNotFoundException(itemId);
    }

    const sku = item.findSku(skuId);
    if (!sku) {
      throw new ItemSkuNotFoundException(skuId);
    }

    sku.deactivate();
    await this.repository.saveWithChildren(item);
    return sku;
  }

  // ==================== SKU OPERATIONS BY PUBLIC ID ====================

  /**
   * Add SKU to item by publicIds (without model)
   * @param itemPublicId - Item's ULID public identifier
   * @param dto - SKU creation data
   */
  async addSkuToItemByPublicId(
    itemPublicId: string,
    modelPublicId: string | null,
    dto: CreateSkuDto,
  ): Promise<ItemSku> {
    const item = await this.repository.findByPublicIdComplete(itemPublicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${itemPublicId} not found`);
    }

    let modelId: number | null = null;
    if (modelPublicId) {
      const model = item.findModelByPublicId(modelPublicId);
      if (!model) {
        throw new NotFoundException(`Model with publicId ${modelPublicId} not found`);
      }
      modelId = model.getId()!;
    }

    const exists = await this.repository.existsSkuByCode(dto.skuCode);
    if (exists) {
      throw new ConflictException(`SKU with code ${dto.skuCode} already exists`);
    }

    const sku = item.addSku(modelId, dto as CreateSkuData);
    await this.repository.saveWithChildren(item);
    await this.publishEvents(item);

    return sku;
  }

  /**
   * Update SKU by publicIds
   * @param itemPublicId - Item's ULID public identifier
   * @param skuPublicId - SKU's ULID public identifier
   * @param dto - Update data
   */
  async updateSkuByPublicId(
    itemPublicId: string,
    skuPublicId: string,
    dto: UpdateSkuDto,
  ): Promise<ItemSku> {
    const item = await this.repository.findByPublicIdComplete(itemPublicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${itemPublicId} not found`);
    }

    const sku = item.findSkuByPublicId(skuPublicId);
    if (!sku) {
      throw new NotFoundException(`SKU with publicId ${skuPublicId} not found`);
    }

    sku.update(dto as UpdateItemSkuData);
    await this.repository.saveWithChildren(item);
    await this.publishEvents(item);

    return sku;
  }

  /**
   * Remove SKU by publicIds
   * @param itemPublicId - Item's ULID public identifier
   * @param skuPublicId - SKU's ULID public identifier
   */
  async removeSkuByPublicId(itemPublicId: string, skuPublicId: string): Promise<void> {
    const item = await this.repository.findByPublicIdComplete(itemPublicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${itemPublicId} not found`);
    }

    const sku = item.findSkuByPublicId(skuPublicId);
    if (!sku) {
      throw new NotFoundException(`SKU with publicId ${skuPublicId} not found`);
    }

    item.removeSku(sku.getId()!);
    await this.repository.saveWithChildren(item);
    await this.publishEvents(item);
  }

  /**
   * Activate SKU by publicIds
   * @param itemPublicId - Item's ULID public identifier
   * @param skuPublicId - SKU's ULID public identifier
   */
  async activateSkuByPublicId(itemPublicId: string, skuPublicId: string): Promise<ItemSku> {
    const item = await this.repository.findByPublicIdComplete(itemPublicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${itemPublicId} not found`);
    }

    const sku = item.findSkuByPublicId(skuPublicId);
    if (!sku) {
      throw new NotFoundException(`SKU with publicId ${skuPublicId} not found`);
    }

    sku.activate();
    await this.repository.saveWithChildren(item);
    return sku;
  }

  /**
   * Deactivate SKU by publicIds
   * @param itemPublicId - Item's ULID public identifier
   * @param skuPublicId - SKU's ULID public identifier
   */
  async deactivateSkuByPublicId(itemPublicId: string, skuPublicId: string): Promise<ItemSku> {
    const item = await this.repository.findByPublicIdComplete(itemPublicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${itemPublicId} not found`);
    }

    const sku = item.findSkuByPublicId(skuPublicId);
    if (!sku) {
      throw new NotFoundException(`SKU with publicId ${skuPublicId} not found`);
    }

    sku.deactivate();
    await this.repository.saveWithChildren(item);
    return sku;
  }

  // ==================== UOM OPERATIONS ====================

  async addUomToItem(itemId: number, dto: CreateUomDto): Promise<ItemUOM> {
    const item = await this.repository.findById(itemId);
    if (!item) {
      throw new ItemNotFoundException(itemId);
    }

    const uom = item.addUOM(dto as CreateUomData);
    await this.repository.saveWithChildren(item);
    await this.publishEvents(item);

    return uom;
  }

  async removeUom(itemId: number, uomCode: string): Promise<void> {
    const item = await this.repository.findById(itemId);
    if (!item) {
      throw new ItemNotFoundException(itemId);
    }

    item.removeUOM(uomCode);
    await this.repository.saveWithChildren(item);
    await this.publishEvents(item);
  }

  // ==================== UOM OPERATIONS BY PUBLIC ID ====================

  /**
   * Add UOM to item by item's publicId
   * @param itemPublicId - Item's ULID public identifier
   * @param dto - UOM creation data
   */
  async addUomToItemByPublicId(itemPublicId: string, dto: CreateUomDto): Promise<ItemUOM> {
    const item = await this.repository.findByPublicId(itemPublicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${itemPublicId} not found`);
    }

    const uom = item.addUOM(dto as CreateUomData);
    await this.repository.saveWithChildren(item);
    await this.publishEvents(item);

    return uom;
  }

  /**
   * Remove UOM from item by item's publicId
   * @param itemPublicId - Item's ULID public identifier
   * @param uomCode - UOM code to remove
   */
  async removeUomByPublicId(itemPublicId: string, uomCode: string): Promise<void> {
    const item = await this.repository.findByPublicId(itemPublicId);
    if (!item) {
      throw new NotFoundException(`Item with publicId ${itemPublicId} not found`);
    }

    item.removeUOM(uomCode);
    await this.repository.saveWithChildren(item);
    await this.publishEvents(item);
  }

  // ==================== PRIVATE HELPERS ====================

  private async publishEvents(item: Item): Promise<void> {
    const events = item.getDomainEvents();
    for (const event of events) {
      this.eventEmitter.emit(event.eventName, event);
    }
    item.clearDomainEvents();
  }
}
