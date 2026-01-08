import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryBuilderService } from '@/common/filtering';
import { CustomerFilterDto } from '../dto/customer-filter.dto';

@Injectable()
export class CustomerQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
  ) {}

  /**
   * Find all customers with filtering, sorting, and pagination
   */
  async findAllWithFilters(filterDto: CustomerFilterDto) {
    // Configure what fields can be searched, filtered, and sorted
    const config = {
      searchableFields: ['customerCode', 'customerName', 'taxCode', 'email', 'phone'],
      filterableFields: [
        'status',
        'isActive',
        'country',
        'customerCode',
        'customerName',
        'taxCode',
      ],
      sortableFields: ['customerCode', 'customerName', 'createdAt', 'updatedAt', 'sortOrder'],
      defaultSort: [
        { field: 'sortOrder', order: 'asc' as const },
        { field: 'customerCode', order: 'asc' as const },
      ],
      maxLimit: 100,
      relations: ['addresses', 'contacts', 'paymentTerms'],
    };

    // Build Prisma query from FilterDto
    const query = this.queryBuilder.buildQuery(filterDto, config);

    // Apply quick filters from CustomerFilterDto
    this.applyQuickFilters(query, filterDto);

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.client.customer.findMany(query),
      this.prisma.client.customer.count({ where: query.where }),
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
   * Apply quick filters from CustomerFilterDto
   */
  private applyQuickFilters(query: any, filterDto: CustomerFilterDto) {
    query.where.AND = query.where.AND || [];

    // Filter by status
    if (filterDto.status) {
      query.where.AND.push({ status: filterDto.status });
    }

    // Filter by isActive
    if (filterDto.isActive !== undefined) {
      query.where.AND.push({ isActive: filterDto.isActive });
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

    // Quick search by customerCode
    if (filterDto.customerCode) {
      query.where.AND.push({
        customerCode: {
          contains: filterDto.customerCode,
          mode: 'insensitive',
        },
      });
    }

    // Quick search by customerName
    if (filterDto.customerName) {
      query.where.AND.push({
        customerName: {
          contains: filterDto.customerName,
          mode: 'insensitive',
        },
      });
    }

    // Quick search by taxCode
    if (filterDto.taxCode) {
      query.where.AND.push({
        taxCode: {
          contains: filterDto.taxCode,
          mode: 'insensitive',
        },
      });
    }
  }
}
