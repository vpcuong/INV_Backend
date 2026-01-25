import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryBuilderService } from '@/common/filtering';
import { ItemFilterDto } from '../dto/item-filter.dto';
import { ModelFilterDto } from '../dto/model-filter.dto';
import { SkuFilterDto } from '../dto/sku-filter.dto';
import {
  mapItemResponse,
  mapItemsResponse,
  mapModelResponse,
  mapModelsResponse,
  mapSkuResponse,
  mapSkusResponse,
} from '@/common/utils/response-mapper.util';

@Injectable()
export class ItemQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService
  ) {}

  /**
   * Find all items with filtering, sorting, and pagination
   */
  async findAllWithFilters(filterDto: ItemFilterDto) {
    // Configure what fields can be searched, filtered, and sorted
    const config = {
      searchableFields: ['code', 'desc'],
      filterableFields: [
        'status',
        'categoryId',
        'itemTypeId',
        'materialId',
        'fabricSupId',
        'isManufactured',
        'isPurchasable',
        'isSellable',
        'uomCode',
      ],
      sortableFields: [
        'code',
        'desc',
        'createdAt',
        'updatedAt',
        'purchasingPrice',
        'sellingPrice',
      ],
      defaultSort: [{ field: 'code', order: 'asc' as const }],
      maxLimit: 100,
      relations: this.buildRelations(filterDto),
    };

    // Build Prisma query from FilterDto
    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Apply quick filters from ItemFilterDto
    this.applyQuickFilters(query, filterDto);

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.client.item.findMany(query),
      this.prisma.client.item.count({ where: query.where }),
    ]);

    return this.queryBuilder.buildPaginatedResponse(
      data,
      total,
      filterDto.page || 1,
      filterDto.limit
    );
  }

  /**
   * Apply quick filters from ItemFilterDto
   */
  private applyQuickFilters(query: any, filterDto: ItemFilterDto) {
    query.where.AND = query.where.AND || [];

    // Filter by status
    if (filterDto.status) {
      query.where.AND.push({ status: filterDto.status });
    }

    // Filter by categoryId
    if (filterDto.categoryId !== undefined) {
      query.where.AND.push({ categoryId: filterDto.categoryId });
    }

    // Filter by itemTypeId
    if (filterDto.itemTypeId !== undefined) {
      query.where.AND.push({ itemTypeId: filterDto.itemTypeId });
    }

    // Filter by materialId
    if (filterDto.materialId !== undefined) {
      query.where.AND.push({ materialId: filterDto.materialId });
    }

    // Filter by fabricSupId
    if (filterDto.fabricSupId !== undefined) {
      query.where.AND.push({ fabricSupId: filterDto.fabricSupId });
    }

    // Filter by isManufactured
    if (filterDto.isManufactured !== undefined) {
      query.where.AND.push({ isManufactured: filterDto.isManufactured });
    }

    // Filter by isPurchasable
    if (filterDto.isPurchasable !== undefined) {
      query.where.AND.push({ isPurchasable: filterDto.isPurchasable });
    }

    // Filter by isSellable
    if (filterDto.isSellable !== undefined) {
      query.where.AND.push({ isSellable: filterDto.isSellable });
    }

    // Quick search by code
    if (filterDto.code) {
      query.where.AND.push({
        code: {
          contains: filterDto.code,
          mode: 'insensitive',
        },
      });
    }

    // Filter by uomCode
    if (filterDto.uomCode) {
      query.where.AND.push({ uomCode: filterDto.uomCode });
    }

    // Filter by purchasing price range
    if (
      filterDto.minPurchasingPrice !== undefined ||
      filterDto.maxPurchasingPrice !== undefined
    ) {
      const priceFilter: any = {};

      if (filterDto.minPurchasingPrice !== undefined) {
        priceFilter.gte = filterDto.minPurchasingPrice;
      }

      if (filterDto.maxPurchasingPrice !== undefined) {
        priceFilter.lte = filterDto.maxPurchasingPrice;
      }

      query.where.AND.push({ purchasingPrice: priceFilter });
    }

    // Filter by selling price range
    if (
      filterDto.minSellingPrice !== undefined ||
      filterDto.maxSellingPrice !== undefined
    ) {
      const priceFilter: any = {};

      if (filterDto.minSellingPrice !== undefined) {
        priceFilter.gte = filterDto.minSellingPrice;
      }

      if (filterDto.maxSellingPrice !== undefined) {
        priceFilter.lte = filterDto.maxSellingPrice;
      }

      query.where.AND.push({ sellingPrice: priceFilter });
    }
  }

  /**
   * Tìm Item theo ID
   *
   * @param id - ID của Item
   * @param includeRelations - Có include các relations không (default: true)
   * @returns Item với các relations cơ bản
   * @throws NotFoundException - Khi không tìm thấy Item
   */
  async findById(id: number, includeRelations: boolean = true) {
    const item = await this.prisma.client.item.findUnique({
      where: { id },
      include: includeRelations
        ? {
            category: true,
            itemType: true,
            uom: true,
            material: true,
            fabricCustomer: true,
          }
        : undefined,
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return item;
  }

  /**
   * Tìm Item theo publicId
   *
   * @param publicId - Public ID (ULID) của Item
   * @returns Item với các relations cơ bản
   * @throws NotFoundException - Khi không tìm thấy Item
   */
  async findByPublicId(publicId: string) {
    const item = await this.prisma.client.item.findUnique({
      where: { publicId },
      include: {
        category: true,
        itemType: true,
        uom: true,
        material: true,
        fabricCustomer: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item not found`);
    }

    return mapItemResponse(item);
  }

  /**
   * Tìm Item với đầy đủ thông tin (models, skus, uoms) theo publicId
   *
   * @param publicId - Public ID (ULID) của Item
   * @returns Item với tất cả children (models, skus, uoms) và relations
   * @throws NotFoundException - Khi không tìm thấy Item
   */
  async findCompleteByPublicId(publicId: string) {
    const item = await this.prisma.client.item.findUnique({
      where: { publicId },
      include: {
        category: true,
        itemType: true,
        uom: true,
        material: true,
        fabricCustomer: true,
        models: {
          include: {
            customer: true,
            skus: {
              include: {
                color: true,
                size: true,
                gender: true,
                uom: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        },
        skus: {
          include: {
            color: true,
            size: true,
            gender: true,
            uom: true,
            model: {
              select: { id: true, publicId: true, code: true },
            },
          },
          orderBy: { id: 'asc' },
        },
        itemUoms: {
          include: {
            uom: true,
          },
          orderBy: { toBaseFactor: 'asc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Item not found`);
    }

    return mapItemResponse(item);
  }

  /**
   * Tìm Item với đầy đủ thông tin (models, skus, uoms)
   *
   * @param id - ID của Item
   * @returns Item với tất cả children (models, skus, uoms) và relations
   * @throws NotFoundException - Khi không tìm thấy Item
   */
  async findComplete(id: number) {
    const item = await this.prisma.client.item.findUnique({
      where: { id },
      include: {
        category: true,
        itemType: true,
        uom: true,
        material: true,
        fabricCustomer: true,
        models: {
          include: {
            customer: true,
            skus: {
              include: {
                color: true,
                size: true,
                gender: true,
                uom: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        },
        skus: {
          include: {
            color: true,
            size: true,
            gender: true,
            uom: true,
            model: {
              select: { id: true, code: true },
            },
          },
          orderBy: { id: 'asc' },
        },
        itemUoms: {
          include: {
            uom: true,
          },
          orderBy: { toBaseFactor: 'asc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return item;
  }

  /**
   * Build relations to include based on filter options
   */
  private buildRelations(filterDto: ItemFilterDto): string[] {
    const relations: string[] = ['category', 'itemType', 'uom', 'material'];

    // Include fabricCustomer if filtering by it or if we want full data
    if (filterDto.fabricSupId !== undefined) {
      relations.push('fabricCustomer');
    }

    return relations;
  }

  /**
   * Find all purchasable items with filtering
   */
  async findAllPurchasable(filterDto: ItemFilterDto) {
    const config = {
      searchableFields: ['code', 'desc'],
      filterableFields: [
        'status',
        'categoryId',
        'itemTypeId',
        'materialId',
        'uomCode',
      ],
      sortableFields: ['code', 'desc', 'purchasingPrice'],
      defaultSort: [{ field: 'code', order: 'asc' as const }],
      maxLimit: 100,
      relations: ['category', 'itemType', 'uom'],
    };

    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Apply quick filters
    this.applyQuickFilters(query, filterDto);

    // Add custom condition: only purchasable items
    query.where.AND = query.where.AND || [];
    query.where.AND.push({ isPurchasable: true });

    const [data, total] = await Promise.all([
      this.prisma.client.item.findMany(query),
      this.prisma.client.item.count({ where: query.where }),
    ]);

    if (filterDto.limit !== undefined && filterDto.limit !== null) {
      return this.queryBuilder.buildPaginatedResponse(
        data,
        total,
        filterDto.page || 1,
        filterDto.limit
      );
    } else {
      return { data, total };
    }
  }

  /**
   * Find all sellable items with filtering
   */
  async findAllSellable(filterDto: ItemFilterDto) {
    const config = {
      searchableFields: ['code', 'desc'],
      filterableFields: [
        'status',
        'categoryId',
        'itemTypeId',
        'materialId',
        'uomCode',
      ],
      sortableFields: ['code', 'desc', 'sellingPrice'],
      defaultSort: [{ field: 'code', order: 'asc' as const }],
      maxLimit: 100,
      relations: ['category', 'itemType', 'uom'],
    };

    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Apply quick filters
    this.applyQuickFilters(query, filterDto);

    // Add custom condition: only sellable items
    query.where.AND = query.where.AND || [];
    query.where.AND.push({ isSellable: true });

    const [data, total] = await Promise.all([
      this.prisma.client.item.findMany(query),
      this.prisma.client.item.count({ where: query.where }),
    ]);

    if (filterDto.limit !== undefined && filterDto.limit !== null) {
      return this.queryBuilder.buildPaginatedResponse(
        data,
        total,
        filterDto.page || 1,
        filterDto.limit
      );
    } else {
      return { data, total };
    }
  }

  /**
   * Find items by category with filtering
   */
  async findByCategory(categoryId: number, filterDto: ItemFilterDto) {
    const config = {
      searchableFields: ['code', 'desc'],
      filterableFields: ['status', 'itemTypeId', 'materialId', 'uomCode'],
      sortableFields: ['code', 'desc', 'createdAt'],
      defaultSort: [{ field: 'code', order: 'asc' as const }],
      maxLimit: 100,
      relations: ['category', 'itemType', 'uom'],
    };

    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Apply quick filters
    this.applyQuickFilters(query, filterDto);

    // Add category filter
    query.where.AND = query.where.AND || [];
    query.where.AND.push({ categoryId });

    const [data, total] = await Promise.all([
      this.prisma.client.item.findMany(query),
      this.prisma.client.item.count({ where: query.where }),
    ]);

    if (filterDto.limit !== undefined && filterDto.limit !== null) {
      return this.queryBuilder.buildPaginatedResponse(
        data,
        total,
        filterDto.page || 1,
        filterDto.limit
      );
    } else {
      return { data, total };
    }
  }

  /**
   * Find items by item type with filtering
   */
  async findByItemType(itemTypeId: number, filterDto: ItemFilterDto) {
    const config = {
      searchableFields: ['code', 'desc'],
      filterableFields: ['status', 'categoryId', 'materialId', 'uomCode'],
      sortableFields: ['code', 'desc', 'createdAt'],
      defaultSort: [{ field: 'code', order: 'asc' as const }],
      maxLimit: 100,
      relations: ['category', 'itemType', 'uom'],
    };

    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Apply quick filters
    this.applyQuickFilters(query, filterDto);

    // Add item type filter
    query.where.AND = query.where.AND || [];
    query.where.AND.push({ itemTypeId });

    const [data, total] = await Promise.all([
      this.prisma.client.item.findMany(query),
      this.prisma.client.item.count({ where: query.where }),
    ]);

    if (filterDto.limit !== undefined && filterDto.limit !== null) {
      return this.queryBuilder.buildPaginatedResponse(
        data,
        total,
        filterDto.page || 1,
        filterDto.limit
      );
    } else {
      return { data, total };
    }
  }

  // ==================== MODEL QUERIES ====================

  async findModelsByItemPublicId(
    itemPublicId: string,
    filterDto?: ModelFilterDto,
  ) {
    const item = await this.prisma.client.item.findUnique({
      where: { publicId: itemPublicId },
      select: { id: true },
    });

    if (!item) {
      throw new NotFoundException(`Item not found`);
    }

    const result = await this.findModelsByItemId(item.id, filterDto);

    // Transform data in paginated response
    if (result.data) {
      result.data = mapModelsResponse(result.data);
    }

    return result;
  }

  async findModelsByItemId(itemId: number, filterDto?: ModelFilterDto) {
    const where: any = { itemId };

    if (filterDto?.status) {
      where.status = filterDto.status;
    }

    if (filterDto?.search) {
      where.OR = [
        { code: { contains: filterDto.search, mode: 'insensitive' } },
        { desc: { contains: filterDto.search, mode: 'insensitive' } },
      ];
    }

    if (filterDto?.customerId !== undefined) {
      where.customerId = filterDto.customerId;
    }

    const [data, total] = await Promise.all([
      this.prisma.client.itemModel.findMany({
        where,
        include: {
          customer: true,
          item: {
            select: { id: true, publicId: true, code: true },
          },
        },
        orderBy: { id: 'desc' },
        skip: filterDto?.page && filterDto?.limit
          ? (filterDto.page - 1) * filterDto.limit
          : undefined,
        take: filterDto?.limit,
      }),
      this.prisma.client.itemModel.count({ where }),
    ]);

    if (filterDto?.limit) {
      return this.queryBuilder.buildPaginatedResponse(
        data,
        total,
        filterDto.page || 1,
        filterDto.limit
      );
    }

    return { data, total };
  }

  async findModelById(modelId: number) {
    const model = await this.prisma.client.itemModel.findUnique({
      where: { id: modelId },
      include: {
        customer: true,
        item: {
          select: { id: true, publicId: true, code: true },
        },
        skus: {
          include: {
            color: true,
            size: true,
            gender: true,
          },
        },
      },
    });

    if (!model) {
      throw new NotFoundException(`Model with ID ${modelId} not found`);
    }

    return model;
  }

  async findModelByPublicId(publicId: string) {
    const model = await this.prisma.client.itemModel.findUnique({
      where: { publicId },
      include: {
        customer: true,
        item: {
          select: { id: true, publicId: true, code: true },
        },
        skus: {
          include: {
            color: true,
            size: true,
            gender: true,
          },
        },
      },
    });

    if (!model) {
      throw new NotFoundException(`Model not found`);
    }

    return mapModelResponse(model);
  }

  async findAllModels(filterDto?: ModelFilterDto) {
    const where: any = {};

    if (filterDto?.status) {
      where.status = filterDto.status;
    }

    if (filterDto?.search) {
      where.OR = [
        { code: { contains: filterDto.search, mode: 'insensitive' } },
        { desc: { contains: filterDto.search, mode: 'insensitive' } },
      ];
    }

    if (filterDto?.customerId !== undefined) {
      where.customerId = filterDto.customerId;
    }

    if (filterDto?.itemId !== undefined) {
      where.itemId = filterDto.itemId;
    }

    const [data, total] = await Promise.all([
      this.prisma.client.itemModel.findMany({
        where,
        include: {
          customer: true,
          item: {
            select: { id: true, code: true },
          },
        },
        orderBy: { id: 'desc' },
        skip: filterDto?.page && filterDto?.limit
          ? (filterDto.page - 1) * filterDto.limit
          : undefined,
        take: filterDto?.limit,
      }),
      this.prisma.client.itemModel.count({ where }),
    ]);

    if (filterDto?.limit) {
      return this.queryBuilder.buildPaginatedResponse(
        data,
        total,
        filterDto.page || 1,
        filterDto.limit
      );
    }

    return { data, total };
  }

  // ==================== SKU QUERIES ====================

  async findSkusByItemId(itemId: number, filterDto?: SkuFilterDto) {
    const where: any = { itemId };

    this.applySkuFilters(where, filterDto);

    const [data, total] = await Promise.all([
      this.prisma.client.itemSKU.findMany({
        where,
        include: this.getSkuIncludes(),
        orderBy: { id: 'desc' },
        skip: filterDto?.page && filterDto?.limit
          ? (filterDto.page - 1) * filterDto.limit
          : undefined,
        take: filterDto?.limit,
      }),
      this.prisma.client.itemSKU.count({ where }),
    ]);

    if (filterDto?.limit) {
      return this.queryBuilder.buildPaginatedResponse(
        data,
        total,
        filterDto.page || 1,
        filterDto.limit
      );
    }

    return { data, total };
  }

  async findSkusByModelId(modelId: number, filterDto?: SkuFilterDto) {
    const where: any = { modelId };

    this.applySkuFilters(where, filterDto);

    const [data, total] = await Promise.all([
      this.prisma.client.itemSKU.findMany({
        where,
        include: this.getSkuIncludes(),
        orderBy: { id: 'desc' },
        skip: filterDto?.page && filterDto?.limit
          ? (filterDto.page - 1) * filterDto.limit
          : undefined,
        take: filterDto?.limit,
      }),
      this.prisma.client.itemSKU.count({ where }),
    ]);

    if (filterDto?.limit) {
      return this.queryBuilder.buildPaginatedResponse(
        data,
        total,
        filterDto.page || 1,
        filterDto.limit
      );
    }

    return { data, total };
  }

  async findSkuById(skuId: number) {
    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { id: skuId },
      include: {
        ...this.getSkuIncludes(),
        skuUoms: {
          include: { uom: true },
        },
      },
    });

    if (!sku) {
      throw new NotFoundException(`SKU with ID ${skuId} not found`);
    }

    return sku;
  }

  async findSkuByPublicId(publicId: string) {
    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { publicId },
      include: {
        ...this.getSkuIncludes(),
        skuUoms: {
          include: { uom: true },
        },
      },
    });

    if (!sku) {
      throw new NotFoundException(`SKU not found`);
    }

    return mapSkuResponse(sku);
  }

  async findSkusByItemPublicId(itemPublicId: string, filterDto?: SkuFilterDto) {
    const item = await this.prisma.client.item.findUnique({
      where: { publicId: itemPublicId },
      select: { id: true },
    });

    if (!item) {
      throw new NotFoundException(`Item not found`);
    }

    const result = await this.findSkusByItemId(item.id, filterDto);

    // Transform data in paginated response
    if (result.data) {
      result.data = mapSkusResponse(result.data);
    }

    return result;
  }

  async findSkusByModelPublicId(
    modelPublicId: string,
    filterDto?: SkuFilterDto,
  ) {
    const model = await this.prisma.client.itemModel.findUnique({
      where: { publicId: modelPublicId },
      select: { id: true },
    });

    if (!model) {
      throw new NotFoundException(`Model not found`);
    }

    const result = await this.findSkusByModelId(model.id, filterDto);

    // Transform data in paginated response
    if (result.data) {
      result.data = mapSkusResponse(result.data);
    }

    return result;
  }

  async findAllSkus(filterDto?: SkuFilterDto) {
    const where: any = {};

    if (filterDto?.itemId !== undefined) {
      where.itemId = filterDto.itemId;
    }

    if (filterDto?.modelId !== undefined) {
      where.modelId = filterDto.modelId;
    }

    this.applySkuFilters(where, filterDto);

    const [data, total] = await Promise.all([
      this.prisma.client.itemSKU.findMany({
        where,
        include: this.getSkuIncludes(),
        orderBy: { id: 'desc' },
        skip: filterDto?.page && filterDto?.limit
          ? (filterDto.page - 1) * filterDto.limit
          : undefined,
        take: filterDto?.limit,
      }),
      this.prisma.client.itemSKU.count({ where }),
    ]);

    if (filterDto?.limit) {
      return this.queryBuilder.buildPaginatedResponse(
        data,
        total,
        filterDto.page || 1,
        filterDto.limit
      );
    }

    return { data, total };
  }

  private applySkuFilters(where: any, filterDto?: SkuFilterDto) {
    if (!filterDto) return;

    if (filterDto.status) {
      where.status = filterDto.status;
    }

    if (filterDto.colorId !== undefined) {
      where.colorId = filterDto.colorId;
    }

    if (filterDto.genderId !== undefined) {
      where.genderId = filterDto.genderId;
    }

    if (filterDto.sizeId !== undefined) {
      where.sizeId = filterDto.sizeId;
    }

    if (filterDto.supplierId !== undefined) {
      where.supplierId = filterDto.supplierId;
    }

    if (filterDto.customerId !== undefined) {
      where.customerId = filterDto.customerId;
    }

    if (filterDto.search) {
      where.OR = [
        { skuCode: { contains: filterDto.search, mode: 'insensitive' } },
        { desc: { contains: filterDto.search, mode: 'insensitive' } },
        { pattern: { contains: filterDto.search, mode: 'insensitive' } },
      ];
    }
  }

  private getSkuIncludes() {
    return {
      item: {
        select: { id: true, publicId: true, code: true },
      },
      model: {
        select: { id: true, publicId: true, code: true },
      },
      color: true,
      gender: true,
      size: true,
      uom: true,
    };
  }

  // ==================== UOM QUERIES ====================

  async findUomsByItemPublicId(itemPublicId: string) {
    const item = await this.prisma.client.item.findUnique({
      where: { publicId: itemPublicId },
      select: { id: true, publicId: true, code: true, uomCode: true },
    });

    if (!item) {
      throw new NotFoundException(`Item not found`);
    }

    const uoms = await this.prisma.client.itemUOM.findMany({
      where: { itemId: item.id },
      include: {
        uom: true,
      },
      orderBy: { toBaseFactor: 'asc' },
    });

    return {
      item: {
        id: item.id,
        publicId: item.publicId,
        code: item.code,
        baseUomCode: item.uomCode,
      },
      uoms,
    };
  }

  async findUomsByItemId(itemId: number) {
    const item = await this.prisma.client.item.findUnique({
      where: { id: itemId },
      select: { id: true, publicId: true, code: true, uomCode: true },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    const uoms = await this.prisma.client.itemUOM.findMany({
      where: { itemId },
      include: {
        uom: true,
      },
      orderBy: { toBaseFactor: 'asc' },
    });

    return {
      item: {
        id: item.id,
        publicId: item.publicId,
        code: item.code,
        baseUomCode: item.uomCode,
      },
      uoms,
    };
  }

  async findUomByItemAndCode(itemId: number, uomCode: string) {
    const uom = await this.prisma.client.itemUOM.findUnique({
      where: {
        itemId_uomCode: { itemId, uomCode },
      },
      include: {
        uom: true,
        item: {
          select: { id: true, code: true, uomCode: true },
        },
      },
    });

    if (!uom) {
      throw new NotFoundException(
        `UOM ${uomCode} not found for item ${itemId}`
      );
    }

    return uom;
  }

  async findUomByItemPublicIdAndCode(itemPublicId: string, uomCode: string) {
    const item = await this.prisma.client.item.findUnique({
      where: { publicId: itemPublicId },
      select: { id: true },
    });

    if (!item) {
      throw new NotFoundException(`Item not found`);
    }

    return this.findUomByItemAndCode(item.id, uomCode);
  }
}
