import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ItemSku } from '../domain/item-sku.entity';
import { IItemSkuRepository } from '../domain/item-sku.repository.interface';
import { ITEM_SKU_REPOSITORY } from '../constant/item-sku.token';
import { CreateItemSkuDto } from '../dto/create-item-sku.dto';
import { UpdateItemSkuDto } from '../dto/update-item-sku.dto';

/**
 * Application Service - Orchestrates ItemSKU use cases
 */
@Injectable()
export class ItemSkuService {
  constructor(
    @Inject(ITEM_SKU_REPOSITORY)
    private readonly skuRepository: IItemSkuRepository,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Use Case: Create new ItemSKU
   */
  async create(createDto: CreateItemSkuDto): Promise<any> {
    try {
      // Generate SKU code if not provided
      const skuCode =
        createDto.skuCode ||
        (await this.generateSkuCode(
          createDto.itemId,
          createDto.modelId,
          createDto.colorId,
          createDto.genderId,
          createDto.sizeId
        ));

      // Check for duplicate SKU code
      const existing = await this.skuRepository.findBySkuCode(skuCode);
      if (existing) {
        throw new ConflictException(`SKU code ${skuCode} already exists`);
      }

      // Create domain entity
      const itemSku = new ItemSku({
        skuCode: skuCode,
        itemId: createDto.itemId,
        modelId: createDto.modelId,
        colorId: createDto.colorId ?? null,
        genderId: createDto.genderId ?? null,
        sizeId: createDto.sizeId ?? null,
        supplierId: createDto.supplierId ?? null,
        customerId: createDto.customerId ?? null,
        fabricSKUId: createDto.fabricSKUId ?? null,
        pattern: createDto.pattern,
        lengthCm: createDto.lengthCm,
        widthCm: createDto.widthCm,
        heightCm: createDto.heightCm,
        weightG: createDto.weightG,
        desc: createDto.desc,
        status: createDto.status,
        costPrice: createDto.costPrice,
        sellingPrice: createDto.sellingPrice,
        uomCode: createDto.uomCode,
      });

      const saved = await this.skuRepository.create(itemSku);

      // Fetch with relations for response
      return this.findOneWithRelations(saved.getId()!);
    } catch (error) {
      // Re-throw ConflictException and domain exceptions as-is
      // DomainExceptionFilter will automatically handle domain exceptions
      throw error;
    }
  }

  /**
   * Use Case: Get all ItemSKUs
   */
  async findAll(): Promise<any[]> {
    const skus = await this.skuRepository.findAll();

    // Get full details with relations for each SKU
    const skusWithRelations = await Promise.all(
      skus.map(async (sku) => this.findOneWithRelations(sku.getId()!))
    );

    return skusWithRelations;
  }

  /**
   * Use Case: Get ItemSKU by ID
   */
  async findOne(id: number): Promise<any> {
    const sku = await this.skuRepository.findOne(id);

    if (!sku) {
      throw new NotFoundException(`Item SKU with ID ${id} not found`);
    }

    return this.toDetailedDto(sku);
  }

  /**
   * Use Case: Get ItemSKUs by Item ID
   */
  async findByItemId(itemId: number): Promise<any[]> {
    const skus = await this.skuRepository.findByItemId(itemId);

    const skusWithRelations = await Promise.all(
      skus.map(async (sku) => this.findOneWithRelations(sku.getId()!))
    );

    return skusWithRelations;
  }

  /**
   * Use Case: Get ItemSKUs by Model ID
   */
  async findByModelId(modelId: number): Promise<any[]> {
    const skus = await this.skuRepository.findByModelId(modelId);

    const skusWithRelations = await Promise.all(
      skus.map(async (sku) => this.findOneWithRelations(sku.getId()!))
    );

    return skusWithRelations;
  }

  /**
   * Use Case: Update ItemSKU
   */
  async update(id: number, updateDto: UpdateItemSkuDto): Promise<any> {
    const sku = await this.skuRepository.findOne(id);

    if (!sku) {
      throw new NotFoundException(`Item SKU with ID ${id} not found`);
    }

    // Update prices if provided
    if (
      updateDto.costPrice !== undefined ||
      updateDto.sellingPrice !== undefined
    ) {
      sku.updatePrices(updateDto.costPrice, updateDto.sellingPrice);
    }

    // Update dimensions if provided
    if (
      updateDto.lengthCm !== undefined ||
      updateDto.widthCm !== undefined ||
      updateDto.heightCm !== undefined ||
      updateDto.weightG !== undefined
    ) {
      sku.updateDimensions({
        lengthCm: updateDto.lengthCm,
        widthCm: updateDto.widthCm,
        heightCm: updateDto.heightCm,
        weightG: updateDto.weightG,
      });
    }

    // Update details if provided
    if (updateDto.desc !== undefined || updateDto.pattern !== undefined) {
      sku.updateDetails(updateDto.desc, updateDto.pattern);
    }

    // Update relations if provided
    if (
      updateDto.supplierId !== undefined ||
      updateDto.customerId !== undefined ||
      updateDto.fabricSKUId !== undefined
    ) {
      sku.updateRelations(
        updateDto.supplierId,
        updateDto.customerId,
        updateDto.fabricSKUId
      );
    }

    // Update classification if provided
    if (updateDto.genderId !== undefined || updateDto.sizeId !== undefined) {
      sku.updateClassification(updateDto.genderId, updateDto.sizeId);
    }

    // Update UOM if provided
    if (updateDto.uomCode !== undefined) {
      sku.updateUom(updateDto.uomCode);
    }

    // Update status if provided
    if (updateDto.status !== undefined) {
      sku.updateStatus(updateDto.status);
    }

    const updated = await this.skuRepository.update(id, sku);
    return this.findOneWithRelations(updated.getId()!);
  }

  /**
   * Use Case: Activate ItemSKU
   */
  async activate(id: number): Promise<any> {
    const sku = await this.skuRepository.findOne(id);

    if (!sku) {
      throw new NotFoundException(`Item SKU with ID ${id} not found`);
    }

    sku.activate();
    const updated = await this.skuRepository.update(id, sku);
    return this.findOneWithRelations(updated.getId()!);
  }

  /**
   * Use Case: Deactivate ItemSKU
   */
  async deactivate(id: number): Promise<any> {
    const sku = await this.skuRepository.findOne(id);

    if (!sku) {
      throw new NotFoundException(`Item SKU with ID ${id} not found`);
    }

    sku.deactivate();
    const updated = await this.skuRepository.update(id, sku);
    return this.findOneWithRelations(updated.getId()!);
  }

  /**
   * Use Case: Delete ItemSKU
   */
  async remove(id: number): Promise<any> {
    const sku = await this.skuRepository.findOne(id);

    if (!sku) {
      throw new NotFoundException(`Item SKU with ID ${id} not found`);
    }

    const deleted = await this.skuRepository.remove(id);
    return this.toDto(deleted);
  }

  /**
   * Generate SKU code based on item attributes
   */
  private async generateSkuCode(
    itemId?: number | null,
    modelId?: number | null,
    colorId?: number,
    genderId?: number,
    sizeId?: number
  ): Promise<string> {
    // const [color, gender, size, model] = await Promise.all([
    //   colorId
    //     ? this.prisma.client.color.findUnique({ where: { id: colorId } })
    //     : null,
    //   genderId
    //     ? this.prisma.client.gender.findUnique({ where: { id: genderId } })
    //     : null,
    //   sizeId
    //     ? this.prisma.client.size.findUnique({ where: { id: sizeId } })
    //     : null,
    //   modelId
    //     ? this.prisma.client.itemModel.findUnique({
    //         where: { id: modelId },
    //         include: {
    //           item: {
    //             include: {
    //               itemType: true,
    //               material: true,
    //             },
    //           },
    //         },
    //       })
    //     : null,
    // ]);

    // if (!color || !gender || !size) {
    //   throw new BadRequestException('Invalid color, gender, or size ID');
    // }

    // let itemTypeCode = 'NOTYPE';
    // let materialCode = 'NOMAT';

    // if (model?.item) {
    //   itemTypeCode = model.item.itemType?.code || 'NOTYPE';
    //   materialCode = model.item.material?.code || 'NOMAT';
    // }

    // const skuCode = `${itemTypeCode}-${materialCode}-${color.code}-${gender.code}-${size.code}`.trim();
    return '';
  }

  /**
   * Get SKU with all relations
   */
  private async findOneWithRelations(id: number): Promise<any> {
    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { id },
      include: {
        color: true,
        gender: true,
        size: true,
        uom: true,
      },
    });

    if (!sku) {
      throw new NotFoundException(`Item SKU with ID ${id} not found`);
    }

    return sku;
  }

  /**
   * Convert domain entity to DTO
   */
  private toDto(sku: ItemSku): any {
    return {
      id: sku.getId(),
      skuCode: sku.getSkuCode(),
      itemId: sku.getItemId(),
      modelId: sku.getModelId(),
      colorId: sku.getColorId(),
      genderId: sku.getGenderId(),
      sizeId: sku.getSizeId(),
      supplierId: sku.getSupplierId(),
      customerId: sku.getCustomerId(),
      fabricSKUId: sku.getFabricSKUId(),
      pattern: sku.getPattern(),
      lengthCm: sku.getLengthCm(),
      widthCm: sku.getWidthCm(),
      heightCm: sku.getHeightCm(),
      weightG: sku.getWeightG(),
      desc: sku.getDesc(),
      status: sku.getStatus(),
      costPrice: sku.getCostPrice(),
      sellingPrice: sku.getSellingPrice(),
      uomCode: sku.getUomCode(),
      createdAt: sku.getCreatedAt(),
      updatedAt: sku.getUpdatedAt(),
    };
  }

  /**
   * Convert domain entity to detailed DTO with relations
   */
  private async toDetailedDto(sku: ItemSku): Promise<any> {
    return this.findOneWithRelations(sku.getId()!);
  }
}
