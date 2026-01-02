import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { QueryBuilderService, FilterDto } from '@/common/filtering';
import { SupplierFilterDto } from '../dto/supplier-filter.dto';

@Injectable()
export class SupplierQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
  ) {}

  /**
   * Find all suppliers with filtering, sorting, and pagination
   */
  async findAllWithFilters(filterDto: SupplierFilterDto) {
    // Configure what fields can be searched, filtered, and sorted
    const config = {
      searchableFields: ['code', 'name', 'email', 'phone', 'contactPerson', 'taxId'],
      filterableFields: [
        'status',
        'category',
        'isActive',
        'city',
        'province',
        'country',
        'rating',
      ],
      sortableFields: ['code', 'name', 'createdAt', 'updatedAt', 'sortOrder', 'rating'],
      defaultSort: [
        { field: 'sortOrder', order: 'asc' as const },
        { field: 'code', order: 'asc' as const },
      ],
      maxLimit: 100,
      relations: this.buildRelations(filterDto),
    };

    // Build Prisma query from FilterDto
    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Apply quick filters from SupplierFilterDto
    this.applyQuickFilters(query, filterDto);

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.client.supplier.findMany(query),
      this.prisma.client.supplier.count({ where: query.where }),
    ]);

    // Return paginated response
    return this.queryBuilder.buildPaginatedResponse(
      data,
      total,
      filterDto.page || 1,
      filterDto.limit || 10,
    );
  }

  /**
   * Apply quick filters from SupplierFilterDto
   */
  private applyQuickFilters(query: any, filterDto: SupplierFilterDto) {
    query.where.AND = query.where.AND || [];

    // Filter by status
    if (filterDto.status) {
      query.where.AND.push({ status: filterDto.status });
    }

    // Filter by category
    if (filterDto.category) {
      query.where.AND.push({ category: filterDto.category });
    }

    // Filter by isActive
    if (filterDto.isActive !== undefined) {
      query.where.AND.push({ isActive: filterDto.isActive });
    }

    // Filter by city
    if (filterDto.city) {
      query.where.AND.push({
        city: {
          contains: filterDto.city,
          mode: 'insensitive',
        },
      });
    }

    // Filter by province
    if (filterDto.province) {
      query.where.AND.push({
        province: {
          contains: filterDto.province,
          mode: 'insensitive',
        },
      });
    }

    // Filter by country
    if (filterDto.country) {
      query.where.AND.push({
        country: {
          contains: filterDto.country,
          mode: 'insensitive',
        },
      });
    }

    // Filter by rating range
    if (filterDto.minRating !== undefined) {
      query.where.AND.push({ rating: { gte: filterDto.minRating } });
    }

    if (filterDto.maxRating !== undefined) {
      query.where.AND.push({ rating: { lte: filterDto.maxRating } });
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

    // Quick search by name
    if (filterDto.name) {
      query.where.AND.push({
        name: {
          contains: filterDto.name,
          mode: 'insensitive',
        },
      });
    }
  }

  /**
   * Build relations to include based on filter options
   */
  private buildRelations(filterDto: SupplierFilterDto): string[] {
    const relations: string[] = [];

    return relations;
  }

  /**
   * Find all active suppliers with filtering
   */
  async findAllActive(filterDto: FilterDto) {
    const config = {
      searchableFields: ['code', 'name', 'email', 'phone'],
      filterableFields: ['status', 'category', 'city', 'country'],
      sortableFields: ['code', 'name', 'rating'],
      defaultSort: [{ field: 'name', order: 'asc' as const }],
    };

    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Add custom condition: only active suppliers
    query.where.AND = query.where.AND || [];
    query.where.AND.push({ isActive: true });

    const [data, total] = await Promise.all([
      this.prisma.client.supplier.findMany(query),
      this.prisma.client.supplier.count({ where: query.where }),
    ]);

    return this.queryBuilder.buildPaginatedResponse(
      data,
      total,
      filterDto.page || 1,
      filterDto.limit || 10,
    );
  }

  /**
   * Find suppliers by category with filtering
   */
  async findByCategory(category: string, filterDto: FilterDto) {
    const config = {
      searchableFields: ['code', 'name', 'email'],
      filterableFields: ['status', 'isActive', 'city', 'country'],
      sortableFields: ['code', 'name', 'rating'],
      defaultSort: [{ field: 'rating', order: 'desc' as const }],
    };

    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Add category filter
    query.where.AND = query.where.AND || [];
    query.where.AND.push({ category });

    const [data, total] = await Promise.all([
      this.prisma.client.supplier.findMany(query),
      this.prisma.client.supplier.count({ where: query.where }),
    ]);

    return this.queryBuilder.buildPaginatedResponse(
      data,
      total,
      filterDto.page || 1,
      filterDto.limit || 10,
    );
  }
}