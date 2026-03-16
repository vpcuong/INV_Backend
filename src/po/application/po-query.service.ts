import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FindPOsDto, POCursorFilterDto } from '../dto/find-pos.dto';

const PO_LINES_INCLUDE = {
  sku: {
    include: {
      color: true,
      gender: true,
      size: true,
    },
  },
  uom: true,
};

@Injectable()
export class POQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindPOsDto): Promise<any[]> {
    const { skip, take, supplierId, status, type } = params;

    return this.prisma.client.pOHeader.findMany({
      skip,
      take,
      where: {
        ...(supplierId && { supplierId }),
        ...(status && { status: status as any }),
        ...(type && { type: type as any }),
      },
      include: {
        supplier: true,
        lines: {
          orderBy: { lineNum: 'asc' },
          include: PO_LINES_INCLUDE,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySupplierId(supplierId: number): Promise<any[]> {
    return this.prisma.client.pOHeader.findMany({
      where: { supplierId },
      include: {
        supplier: true,
        lines: {
          orderBy: { lineNum: 'asc' },
          include: PO_LINES_INCLUDE,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllWithCursor(filterDto: POCursorFilterDto) {
    const limit = filterDto.limit ?? 20;
    const where: any = {};

    if (filterDto.supplierId) where.supplierId = filterDto.supplierId;
    if (filterDto.status) where.status = filterDto.status;
    if (filterDto.type) where.type = filterDto.type;
    if (filterDto.fromDate || filterDto.toDate) {
      where.orderDate = {};
      if (filterDto.fromDate) where.orderDate.gte = new Date(filterDto.fromDate);
      if (filterDto.toDate) where.orderDate.lte = new Date(filterDto.toDate);
    }

    if (filterDto.cursor) {
      const decoded = JSON.parse(Buffer.from(filterDto.cursor, 'base64url').toString());
      where.AND = [
        ...(where.AND ?? []),
        {
          OR: [
            { orderDate: { gt: new Date(decoded.orderDate) } },
            { orderDate: { equals: new Date(decoded.orderDate) }, poNum: { gt: decoded.poNum } },
          ],
        },
      ];
    }

    const data = await this.prisma.client.pOHeader.findMany({
      where,
      include: {
        supplier: true,
        lines: { include: PO_LINES_INCLUDE, orderBy: { lineNum: 'asc' } },
      },
      orderBy: [{ orderDate: 'asc' }, { poNum: 'asc' }],
      take: limit + 1,
    });

    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, limit) : data;
    const lastItem = items[items.length - 1];

    const nextCursor =
      hasMore && lastItem
        ? Buffer.from(
            JSON.stringify({ orderDate: lastItem.orderDate, poNum: lastItem.poNum })
          ).toString('base64url')
        : null;

    return { data: items, nextCursor, hasMore };
  }

  async findById(id: number): Promise<any> {
    const result = await this.prisma.client.pOHeader.findUnique({
      where: { id },
      include: {
        supplier: true,
        lines: {
          include: PO_LINES_INCLUDE,
          orderBy: { lineNum: 'asc' },
        },
      },
    });

    if (!result) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    return result;
  }
}
