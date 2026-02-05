import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvTransFilterDto } from '../dto/inv-trans-filter.dto';
import { QueryBuilderService } from '../../common/filtering/query-builder.service';

@Injectable()
export class InventoryQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService
  ) {}

  async findAll(filterDto: InvTransFilterDto): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filterDto.type) {
      where.type = filterDto.type;
    }
    if (filterDto.status) {
      where.status = filterDto.status;
    }
    if (filterDto.fromWarehouseId) {
      where.fromWarehouseId = filterDto.fromWarehouseId;
    }
    if (filterDto.toWarehouseId) {
      where.toWarehouseId = filterDto.toWarehouseId;
    }
    if (filterDto.referenceType) {
      where.referenceType = filterDto.referenceType;
    }
    if (filterDto.referenceNum) {
      where.referenceNum = { contains: filterDto.referenceNum, mode: 'insensitive' };
    }
    if (filterDto.transactionDateFrom || filterDto.transactionDateTo) {
      where.transactionDate = {};
      if (filterDto.transactionDateFrom) {
        where.transactionDate.gte = new Date(filterDto.transactionDateFrom);
      }
      if (filterDto.transactionDateTo) {
        where.transactionDate.lte = new Date(filterDto.transactionDateTo);
      }
    }
    if (filterDto.search) {
      where.OR = [
        { transNum: { contains: filterDto.search, mode: 'insensitive' } },
        { referenceNum: { contains: filterDto.search, mode: 'insensitive' } },
        { note: { contains: filterDto.search, mode: 'insensitive' } },
      ];
    }

    // Build order by
    const orderBy: any = {};
    if (filterDto.sortBy) {
      orderBy[filterDto.sortBy] = filterDto.sortOrder || 'desc';
    } else {
      orderBy.transactionDate = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.client.invTransHeader.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          fromWarehouse: {
            select: { id: true, code: true, name: true },
          },
          toWarehouse: {
            select: { id: true, code: true, name: true },
          },
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
          _count: {
            select: { lines: true },
          },
        },
      }),
      this.prisma.client.invTransHeader.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findByPublicId(publicId: string): Promise<any | null> {
    return this.prisma.client.invTransHeader.findUnique({
      where: { publicId },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
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
