import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
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
    private readonly itemRepository: IItemRepository,
  ) {}

  /**
   * Use Case: Create new item
   */
  async createItem(dto: CreateItemDto): Promise<any> {
    // Create domain entity with business rules
    const item = new Item({
      id: 0, // Will be set by database
      name: dto.name,
      categoryId: dto.categoryId,
      itemTypeId: dto.itemTypeId,
      materialId: dto.materialId,
      model: dto.model,
      lengthCm: dto.lengthCm,
      widthCm: dto.widthCm,
      heightCm: dto.heightCm,
      weightG: dto.weightG,
      notes: dto.notes,
      status: dto.status || 'Draft',
      hasSku: dto.hasSku ?? false,
      costPrice: dto.costPrice,
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
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.model !== undefined && { model: dto.model }),
      ...(dto.lengthCm !== undefined && { lengthCm: dto.lengthCm }),
      ...(dto.widthCm !== undefined && { widthCm: dto.widthCm }),
      ...(dto.heightCm !== undefined && { heightCm: dto.heightCm }),
      ...(dto.weightG !== undefined && { weightG: dto.weightG }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.hasSku !== undefined && { hasSku: dto.hasSku }),
      ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      ...(dto.itemTypeId !== undefined && { itemTypeId: dto.itemTypeId }),
      ...(dto.materialId !== undefined && { materialId: dto.materialId }),
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
    if (dto.costPrice !== undefined || dto.sellingPrice !== undefined) {
      item.updatePrice(dto.costPrice, dto.sellingPrice);
      updatedData.costPrice = item.getCostPrice();
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
      throw new ConflictException(
        'Cannot delete item that has UOMs or SKUs',
      );
    }

    await this.itemRepository.delete(id);
  }

  /**
   * Use Case: Update item price with business rules
   */
  async updatePrice(
    id: number,
    costPrice?: number,
    sellingPrice?: number,
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
    quantity: number,
  ): Promise<number> {
    const item = await this.findItemOrFail(itemId);

    // Business logic in domain entity
    return item.convertQuantity(fromUomCode, toUomCode, quantity);
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
      name: item.getName(),
      categoryId: item.getCategoryId(),
      itemTypeId: item.getItemTypeId(),
      materialId: item.getMaterialId(),
      model: item.getModel(),
      status: item.getStatus(),
      uomCode: item.getUomCode(),
      costPrice: item.getCostPrice(),
      sellingPrice: item.getSellingPrice(),
      isPurchasable: item.getIsPurchasable(),
      isSellable: item.getIsSellable(),
      isManufactured: item.getIsManufactured(),
      hasSku: item.getHasSku(),
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