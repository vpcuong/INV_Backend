import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvTransCursorFilterDto, InvTransFilterDto } from '../dto/inv-trans-filter.dto';
import { QueryBuilderService } from '../../common/filtering/query-builder.service';
import { FilterConfig } from '../../common/filtering/interfaces/filter-config.interface';

@Injectable()
export class InventoryQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService
  ) {}

  async findAll(filterDto: InvTransFilterDto) {
    const config: FilterConfig = {
      searchableFields: ['transNum', 'referenceNum', 'note'],
      filterableFields: [
        'type',
        'status',
        'fromWarehouseId',
        'toWarehouseId',
        'referenceType',
        'referenceNum',
        'createdBy',
      ],
      sortableFields: [
        'transNum',
        'type',
        'status',
        'transactionDate',
        'createdAt',
        'updatedAt',
      ],
      defaultSort: [{ field: 'transactionDate', order: 'desc' }],
      maxLimit: 100,
      relations: [
        {
          fromWarehouse: {
            select: { id: true, code: true, name: true },
          },
        },
        {
          toWarehouse: {
            select: { id: true, code: true, name: true },
          },
        },
        {
          lines: {
            include: {
              itemSku: {
                include: {
                  color: true,
                  size: true,
                },
              },
              uom: true,
            },
            orderBy: { lineNum: 'asc' },
          },
        },
        'reason',
      ],
    };

    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Apply quick filters (domain-specific filters beyond generic FilterDto)
    if (!query.where.AND) {
      query.where.AND = [];
    }
    if (filterDto.type) {
      query.where.AND.push({ type: filterDto.type });
    }
    if (filterDto.status) {
      query.where.AND.push({ status: filterDto.status });
    }
    if (filterDto.fromWarehouseId) {
      query.where.AND.push({ fromWarehouseId: filterDto.fromWarehouseId });
    }
    if (filterDto.toWarehouseId) {
      query.where.AND.push({ toWarehouseId: filterDto.toWarehouseId });
    }
    if (filterDto.referenceType) {
      query.where.AND.push({ referenceType: filterDto.referenceType });
    }
    if (filterDto.referenceNum) {
      query.where.AND.push({
        referenceNum: { contains: filterDto.referenceNum, mode: 'insensitive' },
      });
    }
    if (filterDto.transactionDateFrom || filterDto.transactionDateTo) {
      const dateFilter: any = {};
      if (filterDto.transactionDateFrom) {
        dateFilter.gte = new Date(filterDto.transactionDateFrom);
      }
      if (filterDto.transactionDateTo) {
        dateFilter.lte = new Date(filterDto.transactionDateTo);
      }
      query.where.AND.push({ transactionDate: dateFilter });
    }

    // Clean up empty AND array
    if (query.where.AND.length === 0) {
      delete query.where.AND;
    }

    const [data, total] = await Promise.all([
      this.prisma.client.invTransHeader.findMany(query),
      this.prisma.client.invTransHeader.count({ where: query.where }),
    ]);

    return this.queryBuilder.buildPaginatedResponse(
      data,
      total,
      filterDto.page || 1,
      filterDto.limit
    );
  }

  async findAllWithCursor(filterDto: InvTransCursorFilterDto) {
    const limit = filterDto.limit ?? 20;
    const where: any = {};

    if (filterDto.type) where.type = filterDto.type;
    if (filterDto.status) where.status = filterDto.status;
    if (filterDto.fromWarehouseId) where.fromWarehouseId = filterDto.fromWarehouseId;
    if (filterDto.toWarehouseId) where.toWarehouseId = filterDto.toWarehouseId;
    if (filterDto.referenceType) where.referenceType = filterDto.referenceType;
    if (filterDto.referenceNum) {
      where.referenceNum = { contains: filterDto.referenceNum, mode: 'insensitive' };
    }

    if (filterDto.transactionDateFrom || filterDto.transactionDateTo) {
      const dateFilter: any = {};
      if (filterDto.transactionDateFrom) dateFilter.gte = new Date(filterDto.transactionDateFrom);
      if (filterDto.transactionDateTo) dateFilter.lte = new Date(filterDto.transactionDateTo);
      where.transactionDate = dateFilter;
    }

    if (filterDto.search) {
      where.OR = [
        { transNum: { contains: filterDto.search, mode: 'insensitive' } },
        { referenceNum: { contains: filterDto.search, mode: 'insensitive' } },
        { note: { contains: filterDto.search, mode: 'insensitive' } },
      ];
    }

    if (filterDto.cursor) {
      const decoded = JSON.parse(Buffer.from(filterDto.cursor, 'base64url').toString());
      const cursorCondition = {
        OR: [
          { transactionDate: { gt: new Date(decoded.transactionDate) } },
          {
            transactionDate: { equals: new Date(decoded.transactionDate) },
            transNum: { gt: decoded.transNum },
          },
        ],
      };
      where.AND = [...(where.AND ?? []), cursorCondition];
    }

    const data = await this.prisma.client.invTransHeader.findMany({
      where,
      include: {
        fromWarehouse: { select: { id: true, code: true, name: true } },
        toWarehouse: { select: { id: true, code: true, name: true } },
        lines: {
          include: {
            itemSku: { include: { color: true, size: true } },
            uom: true,
          },
          orderBy: { lineNum: 'asc' },
        },
        reason: true,
      },
      orderBy: [{ transactionDate: 'asc' }, { transNum: 'asc' }],
      take: limit + 1,
    });

    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, limit) : data;
    const lastItem = items[items.length - 1];

    const nextCursor = hasMore && lastItem
      ? Buffer.from(JSON.stringify({
          transactionDate: lastItem.transactionDate,
          transNum: lastItem.transNum,
        })).toString('base64url')
      : null;

    return { data: items, nextCursor, hasMore, limit };
  }

  async findByPublicId(publicId: string): Promise<any | null> {
    return this.prisma.client.invTransHeader.findUnique({
      where: { publicId },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        reason: true,
        lines: {
          include: {
            itemSku: {
              include: {
                color: true,
                size: true,
                model: true,
              },
            },
            uom: true,
          },
          orderBy: { lineNum: 'asc' },
        },
      },
    });
  }
}
