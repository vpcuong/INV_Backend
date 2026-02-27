import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  SOAnalyticsBaseDto,
  SORevenueAnalyticsDto,
  SOTopCustomersDto,
  SOTopSkusDto,
  RevenueGroupBy,
} from '../dto/so-analytics.dto';

@Injectable()
export class SOAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Shared helpers ────────────────────────────────────────────────────────

  private buildDateWhere(from?: string, to?: string, customerId?: number) {
    const where: any = {
      orderStatus: { notIn: ['CANCELLED', 'DRAFT'] },
    };
    if (from || to) {
      where.orderDate = {};
      if (from) where.orderDate.gte = new Date(from);
      if (to)   where.orderDate.lte = new Date(to);
    }
    if (customerId) where.customerId = customerId;
    return where;
  }

  private toNum(val: any): number {
    return Number(val ?? 0);
  }

  // ─── 1. Overview ───────────────────────────────────────────────────────────

  async getOverview(dto: SOAnalyticsBaseDto) {
    const where = this.buildDateWhere(dto.orderDateFrom, dto.orderDateTo, dto.customerId);

    const [totalAgg, byStatus] = await Promise.all([
      this.prisma.client.sOHeader.aggregate({
        where,
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
      this.prisma.client.sOHeader.groupBy({
        by: ['orderStatus'],
        where,
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
    ]);

    const totalOrders = totalAgg._count.id;
    const totalRevenue = this.toNum(totalAgg._sum.totalAmount);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const byStatusMap: Record<string, { count: number; revenue: number }> = {};
    for (const row of byStatus) {
      byStatusMap[row.orderStatus] = {
        count: row._count.id,
        revenue: this.toNum(row._sum.totalAmount),
      };
    }

    return {
      period: { from: dto.orderDateFrom ?? null, to: dto.orderDateTo ?? null },
      totalRevenue,
      totalOrders,
      avgOrderValue: Math.round(avgOrderValue),
      byStatus: byStatusMap,
    };
  }

  // ─── 2. Revenue series ─────────────────────────────────────────────────────

  async getRevenueSeries(dto: SORevenueAnalyticsDto) {
    const where = this.buildDateWhere(dto.orderDateFrom, dto.orderDateTo, dto.customerId);
    const groupBy = dto.groupBy ?? RevenueGroupBy.DAY;

    // Prisma không hỗ trợ DATE_TRUNC trực tiếp → dùng $queryRaw
    const truncFn = groupBy === RevenueGroupBy.DAY
      ? 'day'
      : groupBy === RevenueGroupBy.WEEK
        ? 'week'
        : 'month';

    // Build dynamic WHERE args
    const conditions: string[] = [`"orderStatus" NOT IN ('CANCELLED', 'DRAFT')`];
    const args: any[] = [];

    if (dto.orderDateFrom) {
      args.push(new Date(dto.orderDateFrom));
      conditions.push(`"orderDate" >= $${args.length}`);
    }
    if (dto.orderDateTo) {
      args.push(new Date(dto.orderDateTo));
      conditions.push(`"orderDate" <= $${args.length}`);
    }
    if (dto.customerId) {
      args.push(dto.customerId);
      conditions.push(`"customerId" = $${args.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const rows: any[] = await this.prisma.client.$queryRawUnsafe(
      `SELECT
        DATE_TRUNC('${truncFn}', "orderDate") AS period,
        COUNT(*)::int AS "orderCount",
        SUM("totalAmount")::float AS revenue
       FROM "SOHeader"
       WHERE ${whereClause}
       GROUP BY DATE_TRUNC('${truncFn}', "orderDate")
       ORDER BY period ASC`,
      ...args,
    );

    const totalRevenue = rows.reduce((sum, r) => sum + this.toNum(r.revenue), 0);
    const totalOrders = rows.reduce((sum, r) => sum + Number(r.orderCount), 0);

    return {
      period: { from: dto.orderDateFrom ?? null, to: dto.orderDateTo ?? null },
      groupBy,
      totalRevenue,
      totalOrders,
      series: rows.map((r) => ({
        date: r.period,
        revenue: this.toNum(r.revenue),
        orderCount: Number(r.orderCount),
      })),
    };
  }

  // ─── 3. Revenue by customer ────────────────────────────────────────────────

  async getRevenueByCustomer(dto: SOTopCustomersDto) {
    const where = this.buildDateWhere(dto.orderDateFrom, dto.orderDateTo);
    const limit = dto.limit ?? 10;

    const rows = await this.prisma.client.sOHeader.groupBy({
      by: ['customerId'],
      where,
      _count: { id: true },
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: limit,
    });

    if (rows.length === 0) {
      return { period: { from: dto.orderDateFrom ?? null, to: dto.orderDateTo ?? null }, customers: [] };
    }

    const customerIds = rows.map((r) => r.customerId);
    const customers = await this.prisma.client.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, customerCode: true, customerName: true },
    });
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    return {
      period: { from: dto.orderDateFrom ?? null, to: dto.orderDateTo ?? null },
      customers: rows.map((r) => {
        const customer = customerMap.get(r.customerId);
        return {
          customerId: r.customerId,
          customerCode: customer?.customerCode ?? null,
          customerName: customer?.customerName ?? null,
          orderCount: r._count.id,
          revenue: this.toNum(r._sum.totalAmount),
        };
      }),
    };
  }

  // ─── 4. Top SKUs ───────────────────────────────────────────────────────────

  async getTopSkus(dto: SOTopSkusDto) {
    const limit = dto.limit ?? 10;
    const conditions: string[] = [`h."orderStatus" NOT IN ('CANCELLED', 'DRAFT')`];
    const args: any[] = [];

    if (dto.orderDateFrom) {
      args.push(new Date(dto.orderDateFrom));
      conditions.push(`h."orderDate" >= $${args.length}`);
    }
    if (dto.orderDateTo) {
      args.push(new Date(dto.orderDateTo));
      conditions.push(`h."orderDate" <= $${args.length}`);
    }
    if (dto.customerId) {
      args.push(dto.customerId);
      conditions.push(`h."customerId" = $${args.length}`);
    }

    args.push(limit);
    const limitPlaceholder = `$${args.length}`;
    const whereClause = conditions.join(' AND ');

    const rows: any[] = await this.prisma.client.$queryRawUnsafe(
      `SELECT
        d."itemSkuId",
        s."skuCode",
        SUM(d."orderQty")::float   AS "totalQty",
        SUM(d."totalAmount")::float AS revenue,
        COUNT(DISTINCT d."soHeaderId")::int AS "orderCount"
       FROM "SODetail" d
       JOIN "SOHeader" h ON h.id = d."soHeaderId"
       JOIN "ItemSKU"  s ON s.id = d."itemSkuId"
       WHERE ${whereClause}
       GROUP BY d."itemSkuId", s."skuCode"
       ORDER BY revenue DESC
       LIMIT ${limitPlaceholder}`,
      ...args,
    );

    return {
      period: { from: dto.orderDateFrom ?? null, to: dto.orderDateTo ?? null },
      skus: rows.map((r) => ({
        itemSkuId: r.itemSkuId,
        skuCode: r.skuCode,
        totalQty: this.toNum(r.totalQty),
        revenue: this.toNum(r.revenue),
        orderCount: Number(r.orderCount),
      })),
    };
  }
}
