import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryBuilderService, FilterDto } from '@/common/filtering';
import { ItemSkuFilterDto } from '../dto/item-sku-filter.dto';
import { ItemType } from '@/item-types/domain/item-type.entity';

@Injectable()
export class ItemSkuQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService
  ) {}

  /**
   * Find a single item SKU by ID with all relations
   */
  async findOne(id: number) {
    const relations = this.buildRelations({});
    const include: any = {};
    relations.forEach((rel) => (include[rel] = true));

    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { id },
      include,
    });

    if (!sku) {
      return null; // Or throw NotFoundException if preferred, but following QueryService pattern
    }

    return sku;
  }

  /**
   * Find all item SKUs with filtering, sorting, and pagination
   */
  async findAllWithFilters(filterDto: ItemSkuFilterDto) {
    // Configure what fields can be searched, filtered, and sorted
    const config = {
      searchableFields: ['skuCode', 'desc', 'pattern'],
      filterableFields: [
        'status',
        'itemId',
        'modelId',
        'colorId',
        'genderId',
        'sizeId',
        'supplierId',
        'customerId',
        'fabricSKUId',
        'uomCode',
        'materialId',
        'categoryId',
      ],
      sortableFields: [
        'skuCode',
        'createdAt',
        'updatedAt',
        'costPrice',
        'sellingPrice',
      ],
      defaultSort: [{ field: 'skuCode', order: 'asc' as const }],
      maxLimit: 100,
      relations: this.buildRelations(filterDto),
    };

    // Build Prisma query from FilterDto
    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Apply quick filters from ItemSkuFilterDto
    this.applyQuickFilters(query, filterDto);

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.client.itemSKU.findMany(query),
      this.prisma.client.itemSKU.count({ where: query.where }),
    ]);

    return this.queryBuilder.buildPaginatedResponse(
      data,
      total,
      filterDto.page || 1,
      filterDto.limit
    );
  }

  /**
   * Apply quick filters from ItemSkuFilterDto
   */
  private applyQuickFilters(query: any, filterDto: ItemSkuFilterDto) {
    query.where.AND = query.where.AND || [];

    // Filter by status
    if (filterDto.status) {
      query.where.AND.push({ status: filterDto.status });
    }

    // Filter by itemId
    if (filterDto.itemId !== undefined) {
      query.where.AND.push({ itemId: filterDto.itemId });
    }

    // Filter by categoryId (via item)
    if (filterDto.categoryId !== undefined) {
      query.where.AND.push({
        item: {
          categoryId: filterDto.categoryId,
        },
      });
    }

    // Filter by modelId
    if (filterDto.modelId !== undefined) {
      query.where.AND.push({ modelId: filterDto.modelId });
    }

    // Filter by colorId
    if (filterDto.colorId !== undefined) {
      query.where.AND.push({ colorId: filterDto.colorId });
    }

    // Filter by genderId
    if (filterDto.genderId !== undefined) {
      query.where.AND.push({ genderId: filterDto.genderId });
    }

    // Filter by sizeId
    if (filterDto.sizeId !== undefined) {
      query.where.AND.push({ sizeId: filterDto.sizeId });
    }

    // Filter by fabricSKUId
    if (filterDto.fabricSKUId !== undefined) {
      query.where.AND.push({ fabricSKUId: filterDto.fabricSKUId });
    }

    // Filter by materialId (via item)
    if (filterDto.materialId !== undefined) {
      query.where.AND.push({
        item: {
          materialId: filterDto.materialId,
        },
      });
    }

    // Quick search by skuCode
    if (filterDto.skuCode) {
      query.where.AND.push({
        skuCode: {
          contains: filterDto.skuCode,
          mode: 'insensitive',
        },
      });
    }
  }

  /**
   * Build relations to include based on filter options
   */
  private buildRelations(filterDto: any): string[] {
    const relations: string[] = [
      'color',
      'gender',
      'size',
      'uom',
      'fabric',
      'item',
      'model',
    ];

    return relations;
  }

  /**
   * Find all active SKUs with filtering
   */
  async findAllActive(filterDto: FilterDto) {
    const config = {
      searchableFields: ['skuCode', 'desc'],
      filterableFields: ['itemId', 'modelId', 'colorId', 'genderId', 'sizeId'],
      sortableFields: ['skuCode', 'createdAt'],
      defaultSort: [{ field: 'skuCode', order: 'asc' as const }],
      relations: this.buildRelations(filterDto),
    };

    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Add custom condition: only active SKUs
    query.where.AND = query.where.AND || [];
    query.where.AND.push({ status: 'active' });

    const [data, total] = await Promise.all([
      this.prisma.client.itemSKU.findMany(query),
      this.prisma.client.itemSKU.count({ where: query.where }),
    ]);

    return this.queryBuilder.buildPaginatedResponse(
      data,
      total,
      filterDto.page || 1,
      filterDto.limit || 10
    );
  }

  /**
   * Find SKUs by item ID with filtering
   */
  async findByItemId(itemId: number, filterDto: FilterDto) {
    const config = {
      searchableFields: ['skuCode', 'desc'],
      filterableFields: ['status', 'colorId', 'genderId', 'sizeId'],
      sortableFields: ['skuCode', 'costPrice', 'sellingPrice'],
      defaultSort: [{ field: 'skuCode', order: 'asc' as const }],
      relations: this.buildRelations(filterDto),
    };

    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Add item filter
    query.where.AND = query.where.AND || [];
    query.where.AND.push({ itemId });

    const [data, total] = await Promise.all([
      this.prisma.client.itemSKU.findMany(query),
      this.prisma.client.itemSKU.count({ where: query.where }),
    ]);

    return this.queryBuilder.buildPaginatedResponse(
      data,
      total,
      filterDto.page || 1,
      filterDto.limit || 10
    );
  }

  /**
   * Find SKUs by model ID with filtering
   */
  async findByModelId(modelId: number, filterDto: FilterDto) {
    const config = {
      searchableFields: ['skuCode', 'desc'],
      filterableFields: ['status', 'colorId', 'genderId', 'sizeId'],
      sortableFields: ['skuCode', 'costPrice', 'sellingPrice'],
      defaultSort: [{ field: 'skuCode', order: 'asc' as const }],
      relations: this.buildRelations(filterDto),
    };

    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Add model filter
    query.where.AND = query.where.AND || [];
    query.where.AND.push({ modelId });

    const [data, total] = await Promise.all([
      this.prisma.client.itemSKU.findMany(query),
      this.prisma.client.itemSKU.count({ where: query.where }),
    ]);

    return this.queryBuilder.buildPaginatedResponse(
      data,
      total,
      filterDto.page || 1,
      filterDto.limit || 10
    );
  }

  /**
   * Find SKUs by color ID with filtering
   */
  async findByColorId(colorId: number, filterDto: FilterDto) {
    const config = {
      searchableFields: ['skuCode', 'desc'],
      filterableFields: ['status', 'itemId', 'modelId', 'genderId', 'sizeId'],
      sortableFields: ['skuCode', 'createdAt'],
      defaultSort: [{ field: 'skuCode', order: 'asc' as const }],
      relations: this.buildRelations(filterDto),
    };

    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Add color filter
    query.where.AND = query.where.AND || [];
    query.where.AND.push({ colorId });

    const [data, total] = await Promise.all([
      this.prisma.client.itemSKU.findMany(query),
      this.prisma.client.itemSKU.count({ where: query.where }),
    ]);

    return this.queryBuilder.buildPaginatedResponse(
      data,
      total,
      filterDto.page || 1,
      filterDto.limit || 10
    );
  }

  /**
   * Find SKUs by supplier ID with filtering
   */
  async findBySupplierId(supplierId: number, filterDto: FilterDto) {
    const config = {
      searchableFields: ['skuCode', 'desc'],
      filterableFields: ['status', 'itemId', 'colorId', 'genderId', 'sizeId'],
      sortableFields: ['skuCode', 'costPrice'],
      defaultSort: [{ field: 'skuCode', order: 'asc' as const }],
      relations: this.buildRelations(filterDto),
    };

    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Add supplier filter
    query.where.AND = query.where.AND || [];
    query.where.AND.push({ supplierId });

    const [data, total] = await Promise.all([
      this.prisma.client.itemSKU.findMany(query),
      this.prisma.client.itemSKU.count({ where: query.where }),
    ]);

    return this.queryBuilder.buildPaginatedResponse(
      data,
      total,
      filterDto.page || 1,
      filterDto.limit || 10
    );
  }

  /**
   * Find SKUs by customer ID with filtering
   */
  async findByCustomerId(customerId: number, filterDto: FilterDto) {
    const config = {
      searchableFields: ['skuCode', 'desc'],
      filterableFields: ['status', 'itemId', 'colorId', 'genderId', 'sizeId'],
      sortableFields: ['skuCode', 'sellingPrice'],
      defaultSort: [{ field: 'skuCode', order: 'asc' as const }],
      relations: this.buildRelations(filterDto),
    };

    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Add customer filter
    query.where.AND = query.where.AND || [];
    query.where.AND.push({ customerId });

    const [data, total] = await Promise.all([
      this.prisma.client.itemSKU.findMany(query),
      this.prisma.client.itemSKU.count({ where: query.where }),
    ]);

    return this.queryBuilder.buildPaginatedResponse(
      data,
      total,
      filterDto.page || 1,
      filterDto.limit || 10
    );
  }

  /**
   * Find SKUs by category with optional filtering (like materialId)
   */
  async findByCategory(categoryId: number, filterDto: ItemSkuFilterDto) {
    const config = {
      searchableFields: ['skuCode', 'desc'],
      filterableFields: [
        'status',
        'colorId',
        'genderId',
        'sizeId',
        'materialId',
      ],
      sortableFields: ['skuCode', 'costPrice', 'sellingPrice'],
      defaultSort: [{ field: 'skuCode', order: 'asc' as const }],
      relations: this.buildRelations(filterDto),
    };

    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Apply quick filters (handles materialId and other filters)
    this.applyQuickFilters(query, filterDto);

    // Add category filter
    query.where.AND = query.where.AND || [];
    query.where.AND.push({
      item: {
        categoryId,
      },
    });

    // Include item with category relation
    query.include = query.include || {};
    // query.include = {
    //   ...query.include,
    //   color: true,
    //   gender: true,
    //   size: true,
    //   uom: true,
    const [data, total] = await Promise.all([
      this.prisma.client.itemSKU.findMany(query),
      this.prisma.client.itemSKU.count({ where: query.where }),
    ]);

    return this.queryBuilder.buildPaginatedResponse(
      data,
      total,
      filterDto.page || 1,
      filterDto.limit
    );
  }

  /**
   * Find SKUs by category and material with optional filtering
   */
  async findValidFabricSKUByMaterialColor(
    materialId: number,
    colorId: number,
    filterDto: ItemSkuFilterDto
  ) {
    const config = {
      searchableFields: ['skuCode', 'desc'],
      filterableFields: ['status', 'colorId', 'genderId', 'sizeId'],
      sortableFields: ['skuCode', 'costPrice', 'sellingPrice'],
      defaultSort: [{ field: 'skuCode', order: 'asc' as const }],
      relations: this.buildRelations(filterDto),
    };

    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Apply quick filters
    this.applyQuickFilters(query, filterDto);

    // Add category and material filters
    query.where.AND = query.where.AND || [];
    query.where.AND.push({
      item: {
        materialId,
        category: {
          type: 'FAB',
        },
      },
      colorId,
      status: 'active',
    });

    const data = await this.prisma.client.itemSKU.findMany(query);

    return this.queryBuilder.buildPaginatedResponse(
      data,
      data.length,
      filterDto.page || 1,
      filterDto.limit
    );
  }
}
