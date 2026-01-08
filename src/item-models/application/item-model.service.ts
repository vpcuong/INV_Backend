import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ItemModel } from '../domain/item-model.entity';
import { IItemModelRepository } from '../domain/item-model.repository.interface';
import { ITEM_MODEL_REPOSITORY } from '../constant/item-model.token';
import { CreateItemModelDto } from '../dto/create-item-model.dto';
import { UpdateItemModelDto } from '../dto/update-item-model.dto';
import {
  InvalidItemModelException,
  DuplicateItemModelCodeException,
  InvalidItemModelStatusException,
} from '../domain/exceptions/item-model-domain.exception';

/**
 * Application Service - Orchestrates ItemModel use cases
 */
@Injectable()
export class ItemModelService {
  constructor(
    @Inject(ITEM_MODEL_REPOSITORY)
    private readonly modelRepository: IItemModelRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Use Case: Create new ItemModel
   */
  async create(createDto: CreateItemModelDto): Promise<any> {
    try {
      // Check for duplicate code
      const existing = await this.modelRepository.findByCode(createDto.code);
      if (existing) {
        throw new DuplicateItemModelCodeException(createDto.code);
      }

      // Verify item exists
      const item = await this.prisma.client.item.findUnique({
        where: { id: createDto.itemId },
      });
      if (!item) {
        throw new BadRequestException(`Item with ID ${createDto.itemId} not found`);
      }

      // Create domain entity
      const itemModel = new ItemModel({
        itemId: createDto.itemId,
        code: createDto.code,
        desc: createDto.desc,
        status: createDto.status,
      });

      const saved = await this.modelRepository.create(itemModel);

      return this.findOneWithRelations(saved.getId()!);
    } catch (error) {
      if (
        error instanceof InvalidItemModelException ||
        error instanceof DuplicateItemModelCodeException
      ) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  /**
   * Use Case: Get all ItemModels
   */
  async findAll(): Promise<any[]> {
    const models = await this.modelRepository.findAll();

    const modelsWithRelations = await Promise.all(
      models.map(async (model) => this.findOneWithRelations(model.getId()!))
    );

    return modelsWithRelations;
  }

  /**
   * Use Case: Get ItemModel by ID
   */
  async findOne(id: number): Promise<any> {
    const model = await this.modelRepository.findOne(id);

    if (!model) {
      throw new NotFoundException(`Item model with ID ${id} not found`);
    }

    return this.findOneWithRelations(id);
  }

  /**
   * Use Case: Get ItemModels by Item ID
   */
  async findByItemId(itemId: number): Promise<any[]> {
    const models = await this.modelRepository.findByItemId(itemId);

    const modelsWithRelations = await Promise.all(
      models.map(async (model) => this.findOneWithRelations(model.getId()!))
    );

    return modelsWithRelations;
  }

  /**
   * Use Case: Update ItemModel
   */
  async update(id: number, updateDto: UpdateItemModelDto): Promise<any> {
    const model = await this.modelRepository.findOne(id);

    if (!model) {
      throw new NotFoundException(`Item model with ID ${id} not found`);
    }

    try {
      // Check for duplicate code if changing code
      if (updateDto.code && updateDto.code !== model.getCode()) {
        const existing = await this.modelRepository.findByCode(updateDto.code);
        if (existing && existing.getId() !== id) {
          throw new DuplicateItemModelCodeException(updateDto.code);
        }
      }

      // Update details
      if (updateDto.desc !== undefined) {
        model.updateDetails(updateDto.desc);
      }

      // Note: Code cannot be updated in this implementation to maintain data integrity
      // If you need to change code, consider creating a new model

      const updated = await this.modelRepository.update(id, model);
      return this.findOneWithRelations(updated.getId()!);
    } catch (error) {
      if (error instanceof DuplicateItemModelCodeException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  /**
   * Use Case: Activate ItemModel
   */
  async activate(id: number): Promise<any> {
    const model = await this.modelRepository.findOne(id);

    if (!model) {
      throw new NotFoundException(`Item model with ID ${id} not found`);
    }

    model.activate();
    const updated = await this.modelRepository.update(id, model);
    return this.findOneWithRelations(updated.getId()!);
  }

  /**
   * Use Case: Deactivate ItemModel
   */
  async deactivate(id: number): Promise<any> {
    const model = await this.modelRepository.findOne(id);

    if (!model) {
      throw new NotFoundException(`Item model with ID ${id} not found`);
    }

    model.deactivate();
    const updated = await this.modelRepository.update(id, model);
    return this.findOneWithRelations(updated.getId()!);
  }

  /**
   * Use Case: Mark ItemModel as draft
   */
  async draft(id: number): Promise<any> {
    const model = await this.modelRepository.findOne(id);

    if (!model) {
      throw new NotFoundException(`Item model with ID ${id} not found`);
    }

    model.draft();
    const updated = await this.modelRepository.update(id, model);
    return this.findOneWithRelations(updated.getId()!);
  }

  /**
   * Use Case: Delete ItemModel
   */
  async remove(id: number): Promise<any> {
    const model = await this.modelRepository.findOne(id);

    if (!model) {
      throw new NotFoundException(`Item model with ID ${id} not found`);
    }

    const deleted = await this.modelRepository.remove(id);
    return this.toDto(deleted);
  }

  /**
   * Get model with all relations
   */
  private async findOneWithRelations(id: number): Promise<any> {
    const model = await this.prisma.client.itemModel.findUnique({
      where: { id },
      include: {
        item: {
          include: {
            category: true,
            itemType: true,
            material: true,
          },
        },
      },
    });

    if (!model) {
      throw new NotFoundException(`Item model with ID ${id} not found`);
    }

    return model;
  }

  /**
   * Convert domain entity to DTO
   */
  private toDto(model: ItemModel): any {
    return {
      id: model.getId(),
      itemId: model.getItemId(),
      code: model.getCode(),
      desc: model.getDesc(),
      status: model.getStatus(),
      createdAt: model.getCreatedAt(),
      updatedAt: model.getUpdatedAt(),
    };
  }
}
