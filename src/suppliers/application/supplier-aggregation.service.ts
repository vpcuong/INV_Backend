import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { QueryBuilderService } from '@/common/filtering';
import {
  SupplierAggregationRequestDto,
  SupplierStatisticsResponse,
  SupplierAggregationResponse,
  AggregationGroup,
  AggregationType,
  AggregationField,
} from '../dto/supplier-aggregation.dto';

@Injectable()
export class SupplierAggregationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
  ) {}

  /**
   * Get comprehensive supplier statistics
   */
  async getStatistics(filterDto?: SupplierAggregationRequestDto): Promise<SupplierStatisticsResponse> {
    // Build base where clause from filters
    const whereClause = this.buildWhereClause(filterDto);

    // Execute all queries in parallel for performance
    const [
      total,
      active,
      inactive,
      blacklisted,
      ratingStats,
      byCategory,
      byStatus,
      byCountry,
      byProvince,
      byCity,
      ratingDistribution,
      createdThisMonth,
      createdThisYear,
      createdLastMonth,
      createdLastYear,
    ] = await Promise.all([
      // Total count
      this.prisma.client.supplier.count({ where: whereClause }),

      // Active count
      this.prisma.client.supplier.count({
        where: { ...whereClause, isActive: true },
      }),

      // Inactive count
      this.prisma.client.supplier.count({
        where: { ...whereClause, isActive: false },
      }),

      // Blacklisted count
      this.prisma.client.supplier.count({
        where: { ...whereClause, status: 'Blacklist' },
      }),

      // Rating statistics
      this.prisma.client.supplier.aggregate({
        where: whereClause,
        _avg: { rating: true },
        _min: { rating: true },
        _max: { rating: true },
        _count: { rating: true },
      }),

      // Group by category
      this.prisma.client.supplier.groupBy({
        by: ['category'],
        where: whereClause,
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
      }),

      // Group by status
      this.prisma.client.supplier.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { status: true },
        orderBy: { _count: { status: 'desc' } },
      }),

      // Group by country
      this.prisma.client.supplier.groupBy({
        by: ['country'],
        where: whereClause,
        _count: { country: true },
        orderBy: { _count: { country: 'desc' } },
      }),

      // Group by province (top 10)
      this.prisma.client.supplier.groupBy({
        by: ['province'],
        where: whereClause,
        _count: { province: true },
        orderBy: { _count: { province: 'desc' } },
        take: 10,
      }),

      // Group by city (top 10)
      this.prisma.client.supplier.groupBy({
        by: ['city'],
        where: whereClause,
        _count: { city: true },
        orderBy: { _count: { city: 'desc' } },
        take: 10,
      }),

      // Rating distribution
      this.getRatingDistribution(whereClause),

      // Created this month
      this.prisma.client.supplier.count({
        where: {
          ...whereClause,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // Created this year
      this.prisma.client.supplier.count({
        where: {
          ...whereClause,
          createdAt: {
            gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
      }),

      // Created last month
      this.prisma.client.supplier.count({
        where: {
          ...whereClause,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // Created last year
      this.prisma.client.supplier.count({
        where: {
          ...whereClause,
          createdAt: {
            gte: new Date(new Date().getFullYear() - 1, 0, 1),
            lt: new Date(new Date().getFullYear(), 0, 1),
          },
        },
      }),
    ]);

    // Count suppliers without rating
    const suppliersWithoutRating = await this.prisma.client.supplier.count({
      where: { ...whereClause, rating: null },
    });

    return {
      total,
      active,
      inactive,
      blacklisted,
      averageRating: ratingStats._avg.rating || 0,
      minRating: ratingStats._min.rating || 0,
      maxRating: ratingStats._max.rating || 0,
      suppliersWithRating: ratingStats._count.rating || 0,
      suppliersWithoutRating,
      byCategory: byCategory.map((item) => ({
        category: item.category || 'Unknown',
        count: item._count.category,
        percentage: total > 0 ? (item._count.category / total) * 100 : 0,
      })),
      byStatus: byStatus.map((item) => ({
        status: item.status || 'Unknown',
        count: item._count.status,
        percentage: total > 0 ? (item._count.status / total) * 100 : 0,
      })),
      byCountry: byCountry.map((item) => ({
        country: item.country || 'Unknown',
        count: item._count.country,
        percentage: total > 0 ? (item._count.country / total) * 100 : 0,
      })),
      byProvince: byProvince.map((item) => ({
        province: item.province || 'Unknown',
        count: item._count.province,
        percentage: total > 0 ? (item._count.province / total) * 100 : 0,
      })),
      byCity: byCity.map((item) => ({
        city: item.city || 'Unknown',
        count: item._count.city,
        percentage: total > 0 ? (item._count.city / total) * 100 : 0,
      })),
      ratingDistribution,
      createdThisMonth,
      createdThisYear,
      createdLastMonth,
      createdLastYear,
    };
  }

  /**
   * Get active status statistics
   * Returns count of active and inactive suppliers
   */
  async getActiveStatusStatistics(filterDto?: SupplierAggregationRequestDto) {
    // Build base where clause from filters (exclude isActive since we're counting both)
    const baseWhere = this.buildWhereClause(filterDto);

    // Remove isActive from where clause if it exists
    if (baseWhere.AND) {
      baseWhere.AND = baseWhere.AND.filter((condition: any) => !('isActive' in condition));
      if (baseWhere.AND.length === 0) {
        delete baseWhere.AND;
      }
    }

    // Count active and inactive suppliers in parallel
    const [activeCount, inactiveCount] = await Promise.all([
      this.prisma.client.supplier.count({
        where: { ...baseWhere, isActive: true },
      }),
      this.prisma.client.supplier.count({
        where: { ...baseWhere, isActive: false },
      }),
    ]);

    const total = activeCount + inactiveCount;

    return {
      total,
      active: activeCount,
      inactive: inactiveCount,
      activePercentage: total > 0 ? (activeCount / total) * 100 : 0,
      inactivePercentage: total > 0 ? (inactiveCount / total) * 100 : 0,
    };
  }

  /**
   * Get custom aggregations based on groupBy and metrics
   */
  async getCustomAggregation(
    requestDto: SupplierAggregationRequestDto,
  ): Promise<SupplierAggregationResponse> {
    const whereClause = this.buildWhereClause(requestDto);
    const groupBy = requestDto.groupBy || [];
    const metrics = requestDto.metrics || [AggregationType.COUNT];

    if (groupBy.length === 0) {
      // No grouping - return overall aggregation
      return this.getOverallAggregation(whereClause, metrics);
    }

    // Build Prisma groupBy query
    const groups = await this.executeGroupBy(whereClause, groupBy, metrics);

    // Get total count
    const total = await this.prisma.client.supplier.count({ where: whereClause });

    return {
      groups,
      total,
      appliedFilters: {
        groupBy,
        metrics,
      },
    };
  }

  /**
   * Get rating distribution
   */
  private async getRatingDistribution(whereClause: any) {
    const ranges = [
      { range: '0-1', min: 0, max: 1 },
      { range: '1-2', min: 1, max: 2 },
      { range: '2-3', min: 2, max: 3 },
      { range: '3-4', min: 3, max: 4 },
      { range: '4-5', min: 4, max: 5 },
    ];

    const total = await this.prisma.client.supplier.count({ where: whereClause });

    const distribution = await Promise.all(
      ranges.map(async ({ range, min, max }) => {
        const count = await this.prisma.client.supplier.count({
          where: {
            ...whereClause,
            rating: { gte: min, lt: max === 5 ? max + 0.1 : max },
          },
        });

        return {
          range,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        };
      }),
    );

    return distribution;
  }

  /**
   * Execute groupBy query with dynamic fields
   */
  private async executeGroupBy(
    whereClause: any,
    groupBy: AggregationField[],
    metrics: AggregationType[],
  ): Promise<AggregationGroup[]> {
    // Map AggregationField to actual database fields
    const groupByFields = groupBy.map((field) => this.mapAggregationField(field));

    // Build aggregation operations
    const aggregations: any = {};

    if (metrics.includes(AggregationType.COUNT)) {
      aggregations._count = { _all: true };
    }

    if (metrics.includes(AggregationType.AVG)) {
      aggregations._avg = { rating: true };
    }

    if (metrics.includes(AggregationType.SUM)) {
      aggregations._sum = { rating: true };
    }

    if (metrics.includes(AggregationType.MIN)) {
      aggregations._min = { rating: true };
    }

    if (metrics.includes(AggregationType.MAX)) {
      aggregations._max = { rating: true };
    }

    // Execute groupBy
    const results = await this.prisma.client.supplier.groupBy({
      by: groupByFields as any,
      where: whereClause,
      ...aggregations,
      orderBy: aggregations._count ? { _count: { _all: 'desc' as const } } : undefined,
    });

    // Transform results to AggregationGroup format
    return results.map((result: any) => {
      const group: AggregationGroup = {
        groupBy: {},
        count: result._count?._all || result._count || 0,
      };

      // Extract groupBy values
      groupByFields.forEach((field) => {
        group.groupBy[field] = result[field];
      });

      // Extract metrics
      if (result._sum) {
        group.sum = { rating: result._sum.rating || 0 };
      }

      if (result._avg) {
        group.avg = { rating: result._avg.rating || 0 };
      }

      if (result._min) {
        group.min = { rating: result._min.rating || 0 };
      }

      if (result._max) {
        group.max = { rating: result._max.rating || 0 };
      }

      return group;
    });
  }

  /**
   * Get overall aggregation (no grouping)
   */
  private async getOverallAggregation(
    whereClause: any,
    metrics: AggregationType[],
  ): Promise<SupplierAggregationResponse> {
    // Get count separately
    const count = await this.prisma.client.supplier.count({ where: whereClause });

    const aggregations: any = {};

    if (metrics.includes(AggregationType.AVG)) {
      aggregations._avg = { rating: true };
    }

    if (metrics.includes(AggregationType.SUM)) {
      aggregations._sum = { rating: true };
    }

    if (metrics.includes(AggregationType.MIN)) {
      aggregations._min = { rating: true };
    }

    if (metrics.includes(AggregationType.MAX)) {
      aggregations._max = { rating: true };
    }

    // Only run aggregate if we need metrics other than count
    const result = Object.keys(aggregations).length > 0
      ? await this.prisma.client.supplier.aggregate({
          where: whereClause,
          ...aggregations,
        })
      : null;

    const group: AggregationGroup = {
      groupBy: { overall: 'all' },
      count,
    };

    if (result?._sum) {
      group.sum = { rating: result._sum.rating || 0 };
    }

    if (result?._avg) {
      group.avg = { rating: result._avg.rating || 0 };
    }

    if (result?._min) {
      group.min = { rating: result._min.rating || 0 };
    }

    if (result?._max) {
      group.max = { rating: result._max.rating || 0 };
    }

    return {
      groups: [group],
      total: count,
      appliedFilters: {
        groupBy: [],
        metrics,
      },
    };
  }

  /**
   * Build where clause from filter DTO
   */
  private buildWhereClause(filterDto?: SupplierAggregationRequestDto): any {
    if (!filterDto) {
      return {};
    }

    const where: any = { AND: [] };

    // Apply quick filters
    if (filterDto.status) {
      where.AND.push({ status: filterDto.status });
    }

    if (filterDto.category) {
      where.AND.push({ category: filterDto.category });
    }

    if (filterDto.isActive !== undefined) {
      where.AND.push({ isActive: filterDto.isActive });
    }

    if (filterDto.city) {
      where.AND.push({ city: { contains: filterDto.city, mode: 'insensitive' } });
    }

    if (filterDto.province) {
      where.AND.push({ province: { contains: filterDto.province, mode: 'insensitive' } });
    }

    if (filterDto.country) {
      where.AND.push({ country: { contains: filterDto.country, mode: 'insensitive' } });
    }

    if (filterDto.minRating !== undefined) {
      where.AND.push({ rating: { gte: filterDto.minRating } });
    }

    if (filterDto.maxRating !== undefined) {
      where.AND.push({ rating: { lte: filterDto.maxRating } });
    }

    if (filterDto.code) {
      where.AND.push({ code: { contains: filterDto.code, mode: 'insensitive' } });
    }

    if (filterDto.name) {
      where.AND.push({ name: { contains: filterDto.name, mode: 'insensitive' } });
    }

    // Apply search
    if (filterDto.search) {
      where.AND.push({
        OR: [
          { code: { contains: filterDto.search, mode: 'insensitive' } },
          { name: { contains: filterDto.search, mode: 'insensitive' } },
          { email: { contains: filterDto.search, mode: 'insensitive' } },
          { phone: { contains: filterDto.search, mode: 'insensitive' } },
          { contactPerson: { contains: filterDto.search, mode: 'insensitive' } },
          { taxId: { contains: filterDto.search, mode: 'insensitive' } },
        ],
      });
    }

    // Clean up empty AND
    if (where.AND.length === 0) {
      delete where.AND;
    }

    return where;
  }

  /**
   * Map AggregationField enum to database field name
   */
  private mapAggregationField(field: AggregationField): string {
    const mapping: Record<AggregationField, string> = {
      [AggregationField.RATING]: 'rating',
      [AggregationField.STATUS]: 'status',
      [AggregationField.CATEGORY]: 'category',
      [AggregationField.COUNTRY]: 'country',
      [AggregationField.PROVINCE]: 'province',
      [AggregationField.CITY]: 'city',
      [AggregationField.IS_ACTIVE]: 'isActive',
      [AggregationField.CREATED_AT]: 'createdAt',
    };

    return mapping[field];
  }
}
