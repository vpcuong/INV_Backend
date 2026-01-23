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

  // ==================== PRIVATE HELPERS ====================

  private async publishEvents(item: Item): Promise<void> {
    const events = item.getDomainEvents();
    for (const event of events) {
      this.eventEmitter.emit(event.eventName, event);
    }
    item.clearDomainEvents();
  }
}
