import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryBuilderService, RelationConfig } from '../../common/filtering';
import { SOFilterDto } from '../dto/so-filter.dto';

@Injectable()
export class SOQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService
  ) {}

  /**
   * Find all sales orders with filtering, sorting, and pagination
   */
  async findAllWithFilters(filterDto: SOFilterDto) {
    const config = {
      searchableFields: [
        'soNum',
        'customerPoNum',
        'headerNote',
        'internalNote',
      ],
      filterableFields: [
        'orderStatus',
        'customerId',
        'channel',
        'soNum',
        'customerPoNum',
        'currencyCode',
        'paymentTermCode',
      ],
      sortableFields: [
        'soNum',
        'orderDate',
        'totalAmount',
        'createdAt',
        'updatedAt',
      ],
      defaultSort: [
        { field: 'orderDate', order: 'desc' as const },
        { field: 'soNum', order: 'desc' as const },
      ],
      maxLimit: 100,
      relations: this.buildRelations(filterDto),
    };

    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Apply quick filters
    this.applyQuickFilters(query, filterDto);
    console.log('query');
    console.log(query);
    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.client.sOHeader.findMany(query),
      this.prisma.client.sOHeader.count({ where: query.where }),
    ]);

    return this.queryBuilder.buildPaginatedResponse(
      data,
      total,
      filterDto.page || 1,
      filterDto.limit
    );
  }

  /**
   * Apply custom quick filters
   */
  private applyQuickFilters(query: any, filterDto: SOFilterDto): void {
    const where = query.where;

    // Date range filters
    if (filterDto.orderDateFrom || filterDto.orderDateTo) {
      where.orderDate = {};
      if (filterDto.orderDateFrom) {
        where.orderDate.gte = new Date(filterDto.orderDateFrom);
      }
      if (filterDto.orderDateTo) {
        where.orderDate.lte = new Date(filterDto.orderDateTo);
      }
    }

    // Order total range
    if (
      filterDto.minOrderTotal !== undefined ||
      filterDto.maxOrderTotal !== undefined
    ) {
      where.totalAmount = {};
      if (filterDto.minOrderTotal !== undefined) {
        where.totalAmount.gte = filterDto.minOrderTotal;
      }
      if (filterDto.maxOrderTotal !== undefined) {
        where.totalAmount.lte = filterDto.maxOrderTotal;
      }
    }
  }

  /**
   * Build relations to include
   * Now supports nested relations with full Prisma include syntax
   */
  private buildRelations(filterDto: SOFilterDto): RelationConfig[] {
    return [
      'customer',
      'billingAddress',
      'shippingAddress',
      {
        lines: {
          include: {
            itemSku: {
              include: {
                color: true,
                gender: true,
                size: true,
              },
            },
            uom: true,
          },
          orderBy: {
            lineNum: 'asc',
          },
        },
      },
    ];
  }

  /**
   * Convert RelationConfig array to Prisma include object
   * Helper for direct Prisma queries (not using query builder)
   */
  private relationsToInclude(relations: RelationConfig[]): any {
    const include: any = {};
    relations.forEach((relation) => {
      if (typeof relation === 'string') {
        include[relation] = true;
      } else {
        Object.assign(include, relation);
      }
    });
    return include;
  }

  /**
   * Find sales orders by customer
   */
  async findByCustomer(customerId: number, filterDto: SOFilterDto) {
    filterDto.customerId = customerId;
    return this.findAllWithFilters(filterDto);
  }

  /**
   * Find sales orders by status
   */
  async findByStatus(orderStatus: string, filterDto: SOFilterDto) {
    filterDto.orderStatus = orderStatus;
    return this.findAllWithFilters(filterDto);
  }

  /**
   * Find open sales orders
   */
  async findOpen(filterDto: SOFilterDto) {
    return this.findByStatus('OPEN', filterDto);
  }

  /**
   * Find orders on hold
   */
  async findOnHold(filterDto: SOFilterDto) {
    return this.findByStatus('ON_HOLD', filterDto);
  }

  /**
   * Get sales order summary statistics
   */
  async getSummary(customerId?: number) {
    const where: any = {};
    if (customerId) {
      where.customerId = customerId;
    }

    const [totalOrders, openOrders, totalValue, openValue] = await Promise.all([
      this.prisma.client.sOHeader.count({ where }),
      this.prisma.client.sOHeader.count({
        where: { ...where, orderStatus: 'OPEN' },
      }),
      this.prisma.client.sOHeader.aggregate({
        where,
        _sum: { totalAmount: true },
      }),
      this.prisma.client.sOHeader.aggregate({
        where: { ...where, orderStatus: 'OPEN' },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalOrders,
      openOrders,
      totalValue: totalValue._sum.totalAmount || 0,
      openValue: openValue._sum.totalAmount || 0,
    };
  }

  /**
   * Search sales orders by text query
   */
  async search(query: string, customerId?: number) {
    const where: any = {
      OR: [
        { soNum: { contains: query, mode: 'insensitive' } },
        { customerPoNum: { contains: query, mode: 'insensitive' } },
        { headerNote: { contains: query, mode: 'insensitive' } },
        { internalNote: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (customerId) {
      where.customerId = customerId;
    }

    const relations = this.buildRelations({} as SOFilterDto);
    console.log(relations);
    const data = await this.prisma.client.sOHeader.findMany({
      where,
      include: this.relationsToInclude(relations),
      orderBy: [
        { orderDate: 'desc' },
        { soNum: 'desc' },
      ],
      take: 50, // Limit search results
    });

    return data;
  }
}
