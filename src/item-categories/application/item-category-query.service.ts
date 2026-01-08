import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ItemCategoryFilterDto } from '../dto/item-category-filter.dto';

@Injectable()
export class ItemCategoryQueryService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(filterDto: ItemCategoryFilterDto) {
    const { page = 1, limit = 10, sort, fields, search, code, isActive } = filterDto;

    // Build where clause
    const where: any = {};

    // Quick filters
    if (code) {
      where.code = { contains: code, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Full-text search
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { desc: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build order by
    const orderBy = this.buildOrderBy(sort);

    // Pagination
    const skip = (page - 1) * limit;
    const take = limit;
    //
    console.log(where, orderBy, skip, take, this.buildSelect(fields));

    // Execute query
    const [data, total] = await Promise.all([
      this.prisma.client.itemCategory.findMany({
        where,
        orderBy,
        skip,
        take,
        select: this.buildSelect(fields),
      }),
      this.prisma.client.itemCategory.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    return this.prisma.client.itemCategory.findUnique({
      where: { id },
    });
  }

  private buildOrderBy(sort?: any[]): any {
    if (!sort || sort.length === 0) {
      return { createdAt: 'desc' }; // Default sort
    }

    // Convert array of sort objects to Prisma orderBy format
    return sort.map(s => ({ [s.field]: s.order }));
  }

  private buildSelect(fields?: string[]) {
    if (!fields || fields.length === 0) {
      return undefined; // Return all fields
    }

    const select: any = {};
    fields.forEach(field => {
      select[field] = true;
    });

    // Always include id
    if (!select.id) {
      select.id = true;
    }

    return select;
  }
}
