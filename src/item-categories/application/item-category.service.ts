import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IItemCategoryRepository } from '../domain/item-category.repository.interface';
import { ItemCategory } from '../domain/item-category.entity';
import { ITEM_CATEGORY_REPOSITORY } from '../constant/item-category.token';
import { CreateProductCategoryDto } from '../dto/create-item-category.dto';
import { UpdateProductCategoryDto } from '../dto/update-item-category.dto';

@Injectable()
export class ItemCategoryService {
  constructor(
    @Inject(ITEM_CATEGORY_REPOSITORY)
    private readonly repository: IItemCategoryRepository
  ) {}

  async create(dto: CreateProductCategoryDto): Promise<ItemCategory> {
    // Check if code already exists
    const existing = await this.repository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(
        `Item category with code '${dto.code}' already exists`
      );
    }

    const category = new ItemCategory({
      code: dto.code,
      desc: dto.desc,
      isActive: true,
      type: dto.type,
    });

    return this.repository.create(category);
  }

  async findOne(id: number): Promise<ItemCategory> {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new NotFoundException(`Item category with ID ${id} not found`);
    }
    return category;
  }

  async update(
    id: number,
    dto: UpdateProductCategoryDto
  ): Promise<ItemCategory> {
    const category = await this.findOne(id);

    // Business logic: update details through domain entity
    category.updateDetails({
      desc: dto.desc,
      type: dto.type,
    });

    return this.repository.update(category);
  }

  async activate(id: number): Promise<ItemCategory> {
    const category = await this.findOne(id);
    category.activate();
    return this.repository.update(category);
  }

  async deactivate(id: number): Promise<ItemCategory> {
    const category = await this.findOne(id);
    category.deactivate();
    return this.repository.update(category);
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id); // Check if exists
    await this.repository.delete(id);
  }
}
