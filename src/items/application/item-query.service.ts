import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryBuilderService } from '@/common/filtering';
import { ItemFilterDto } from '../dto/item-filter.dto';

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
}
