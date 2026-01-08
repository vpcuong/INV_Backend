import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { ItemType } from '../domain/item-type.entity';
import { IItemTypeRepository } from '../domain/item-type.repository.interface';
import { ITEM_TYPE_REPOSITORY } from '../constant/item-type.token';
import { CreateItemTypeDto } from '../dto/create-item-type.dto';
import { UpdateItemTypeDto } from '../dto/update-item-type.dto';

@Injectable()
export class ItemTypeService {
  constructor(
    @Inject(ITEM_TYPE_REPOSITORY)
    private readonly itemTypeRepository: IItemTypeRepository,
  ) {}

  async create(createItemTypeDto: CreateItemTypeDto): Promise<ItemType> {
    // Check if code already exists (if provided)
    if (createItemTypeDto.code) {
      const existing = await this.itemTypeRepository.findByCode(createItemTypeDto.code);
      if (existing) {
        throw new ConflictException(`Item type with code ${createItemTypeDto.code} already exists`);
      }
    }

    const itemType = new ItemType({
      code: createItemTypeDto.code,
      desc: createItemTypeDto.description,
    });

    return this.itemTypeRepository.create(itemType);
  }

  async findAll(): Promise<ItemType[]> {
    return this.itemTypeRepository.findAll();
  }

  async findOne(id: number): Promise<ItemType> {
    const itemType = await this.itemTypeRepository.findOne(id);
    if (!itemType) {
      throw new NotFoundException(`Item type with ID ${id} not found`);
    }
    return itemType;
  }

  async update(id: number, updateItemTypeDto: UpdateItemTypeDto): Promise<ItemType> {
    const itemType = await this.findOne(id);

    // If updating code, check for conflicts
    if (updateItemTypeDto.code && updateItemTypeDto.code !== itemType.getCode()) {
      const existing = await this.itemTypeRepository.findByCode(updateItemTypeDto.code);
      if (existing && existing.getId() !== id) {
        throw new ConflictException(`Item type with code ${updateItemTypeDto.code} already exists`);
      }
    }

    // Update item type entity
    itemType.updateDetails({
      code: updateItemTypeDto.code,
      desc: updateItemTypeDto.description,
    });

    return this.itemTypeRepository.update(id, itemType);
  }

  async activate(id: number): Promise<ItemType> {
    await this.findOne(id); // Check if item type exists
    return this.itemTypeRepository.activate(id);
  }

  async deactivate(id: number): Promise<ItemType> {
    await this.findOne(id); // Check if item type exists
    return this.itemTypeRepository.deactivate(id);
  }

  async remove(id: number): Promise<ItemType> {
    await this.findOne(id); // Check if item type exists
    return this.itemTypeRepository.remove(id);
  }
}