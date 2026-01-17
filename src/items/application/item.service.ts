import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { Item } from '../domain/item.entity';
import { ItemUOM } from '../domain/item-uom.value-object';
import { IItemRepository } from '../domain/item.repository.interface';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';

/**
 * Application Service - Orchestrates use cases
 * Contains application logic but delegates business logic to domain entities
 */
@Injectable()
export class ItemApplicationService {
  constructor(
    @Inject('IItemRepository')
    private readonly itemRepository: IItemRepository
  ) {}

  /**
   * Use Case: Create new item
   */
  async createItem(dto: CreateItemDto): Promise<any> {
    // Create domain entity with business rules
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
      status: dto.status || 'active',
      purchasingPrice: dto.purchasingPrice,
      isManufactured: dto.isManufactured ?? false,
      isPurchasable: dto.isPurchasable ?? false,
      isSellable: dto.isSellable ?? false,
      sellingPrice: dto.sellingPrice,
      uomCode: dto.uomCode,
    });

    // Persist through repository
    const savedItem = await this.itemRepository.save(item);

    return this.toDto(savedItem);
  }

  /**
   * Use Case: Get all items
   */
  async findAll(filters?: any): Promise<any[]> {
    const items = await this.itemRepository.findAll(filters);
    return items.map((item) => this.toDto(item));
  }

  /**
   * Use Case: Get item by ID
   */
  async findOne(id: number): Promise<any> {
    const item = await this.findItemOrFail(id);
    return this.toDto(item);
  }

  /**
   * Use Case: Update item
   */
  async update(id: number, dto: UpdateItemDto): Promise<any> {
    const item = await this.findItemOrFail(id);

    // Apply updates (in real world, you might use a mapper)
    const updatedData = {
      ...item.toPersistence(),
      ...(dto.code !== undefined && { code: dto.code }),
      ...(dto.lengthCm !== undefined && { lengthCm: dto.lengthCm }),
      ...(dto.widthCm !== undefined && { widthCm: dto.widthCm }),
      ...(dto.heightCm !== undefined && { heightCm: dto.heightCm }),
      ...(dto.weightG !== undefined && { weightG: dto.weightG }),
      ...(dto.desc !== undefined && { desc: dto.desc }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      ...(dto.itemTypeId !== undefined && { itemTypeId: dto.itemTypeId }),
      ...(dto.materialId !== undefined && { materialId: dto.materialId }),
      ...(dto.fabricSupId !== undefined && { fabricSupId: dto.fabricSupId }),
      ...(dto.uomCode !== undefined && { uomCode: dto.uomCode }),
      ...(dto.isPurchasable !== undefined && {
        isPurchasable: dto.isPurchasable,
      }),
      ...(dto.isSellable !== undefined && { isSellable: dto.isSellable }),
      ...(dto.isManufactured !== undefined && {
        isManufactured: dto.isManufactured,
      }),
    };

    // Handle price updates with business logic
    if (dto.purchasingPrice !== undefined || dto.sellingPrice !== undefined) {
      item.updatePrice(dto.purchasingPrice, dto.sellingPrice);
      updatedData.purchasingPrice = item.getPurchasingPrice();
      updatedData.sellingPrice = item.getSellingPrice();
    }

    const updatedItem = Item.fromPersistence({
      ...updatedData,
      itemUoms: item.getItemUOMs(),
    });

    const result = await this.itemRepository.update(updatedItem);
    return this.toDto(result);
  }

  /**
   * Use Case: Delete item
   */
  async remove(id: number): Promise<void> {
    const item = await this.findItemOrFail(id);

    // Business rule: Check if item can be deleted
    if (!item.canBeDeleted()) {
      throw new ConflictException('Cannot delete item that has UOMs or SKUs');
    }

    await this.itemRepository.delete(id);
  }

  /**
   * Use Case: Update item price with business rules
   */
  async updatePrice(
    id: number,
    costPrice?: number,
    sellingPrice?: number
  ): Promise<any> {
    const item = await this.findItemOrFail(id);

    // Business logic encapsulated in domain entity
    item.updatePrice(costPrice, sellingPrice);

    const updated = await this.itemRepository.update(item);
    return this.toDto(updated);
  }

  /**
   * Use Case: Convert quantity between UOMs
   */
  async convertQuantity(
    itemId: number,
    fromUomCode: string,
    toUomCode: string,
    quantity: number
  ): Promise<number> {
    const item = await this.findItemOrFail(itemId);

    // Business logic in domain entity
    return item.convertQuantity(fromUomCode, toUomCode, quantity);
  }

  /**
   * Use Case: Activate item
   */
  async activate(id: number): Promise<any> {
    const item = await this.findItemOrFail(id);

    item.activate();

    const updated = await this.itemRepository.update(item);
    return this.toDto(updated);
  }

  /**
   * Use Case: Deactivate item
   */
  async deactivate(id: number): Promise<any> {
    const item = await this.findItemOrFail(id);

    item.deactivate();

    const updated = await this.itemRepository.update(item);
    return this.toDto(updated);
  }

  /**
   * Use Case: Set item to draft
   */
  async draft(id: number): Promise<any> {
    const item = await this.findItemOrFail(id);

    item.setDraft();

    const updated = await this.itemRepository.update(item);
    return this.toDto(updated);
  }

  /**
   * Helper: Find item or throw error
   */
  private async findItemOrFail(id: number): Promise<Item> {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  /**
   * Convert domain entity to DTO for response
   */
  private toDto(item: Item): any {
    return {
      id: item.getId(),
      code: item.getCode(),
      categoryId: item.getCategoryId(),
      itemTypeId: item.getItemTypeId(),
      materialId: item.getMaterialId(),
      fabricSupId: item.getfabricSupId(),
      lengthCm: item.getLengthCm(),
      widthCm: item.getWidthCm(),
      heightCm: item.getHeightCm(),
      weightG: item.getWeightG(),
      desc: item.getDesc(),
      status: item.getStatus(),
      uomCode: item.getUomCode(),
      purchasingPrice: item.getPurchasingPrice(),
      sellingPrice: item.getSellingPrice(),
      isPurchasable: item.getIsPurchasable(),
      isSellable: item.getIsSellable(),
      isManufactured: item.getIsManufactured(),
      itemUoms: item.getItemUOMs().map((uom) => ({
        uomCode: uom.getUomCode(),
        toBaseFactor: uom.getToBaseFactor(),
        roundingPrecision: uom.getRoundingPrecision(),
        isPurchasingUom: uom.getIsPurchasingUom(),
        isSalesUom: uom.getIsSalesUom(),
        isManufacturingUom: uom.getIsManufacturingUom(),
        desc: uom.getDesc(),
      })),
    };
  }
}
