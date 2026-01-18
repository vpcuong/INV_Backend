import { Injectable } from '@nestjs/common';
import { FilterDto, FilterOperator, FilterCondition } from './dto/filter.dto';
import { FilterConfig } from './interfaces/filter-config.interface';

@Injectable()
export class QueryBuilderService {
  /**
   * Build Prisma query from FilterDto
   */
  buildQuery(filterDto: FilterDto, config: FilterConfig = {}) {
    const {
      searchableFields = [],
      filterableFields = [],
      sortableFields = [],
      defaultSort = [],
      relations = [],
      maxLimit = 100,
    } = config;

    const query: any = {
      where: {},
      orderBy: [],
      skip: 0,
      take: 10,
    };

    // Pagination - if limit is not provided, fetch all results
    if (filterDto.limit !== undefined && filterDto.limit !== null) {
      const page = filterDto.page || 1;
      const limit = Math.min(filterDto.limit, maxLimit);
      query.skip = (page - 1) * limit;
      query.take = limit;
    } else {
      // No pagination - fetch all results
      delete query.skip;
      delete query.take;
    }

    // Search
    if (filterDto.search && searchableFields.length > 0) {
      query.where.OR = searchableFields.map((field) => ({
        [field]: {
          contains: filterDto.search,
          mode: 'insensitive',
        },
      }));
    }

    // Filters
    if (filterDto.filters && filterDto.filters.length > 0) {
      const filterConditions = this.buildFilterConditions(
        filterDto.filters,
        filterableFields
      );

      // Merge with search conditions
      if (query.where.OR) {
        query.where = {
          AND: [{ OR: query.where.OR }, ...filterConditions],
        };
      } else {
        query.where.AND = filterConditions;
      }
    }

    // Sort
    if (filterDto.sort && filterDto.sort.length > 0) {
      query.orderBy = filterDto.sort
        .filter(
          (s) => sortableFields.length === 0 || sortableFields.includes(s.field)
        )
        .map((s) => ({ [s.field]: s.order }));
    } else if (defaultSort.length > 0) {
      query.orderBy = defaultSort.map((s) => ({ [s.field]: s.order }));
    }

    // Relations - support both flat strings and nested objects
    if (relations.length > 0) {
      query.include = {};
      relations.forEach((relation) => {
        if (typeof relation === 'string') {
          // Flat relation: 'customer' -> { customer: true }
          query.include[relation] = true;
        } else {
          // Nested relation: { lines: { include: {...} } }
          // Merge the nested object into query.include
          Object.assign(query.include, relation);
        }
      });
    }

    // Select specific fields
    if (filterDto.fields && filterDto.fields.length > 0) {
      query.select = {};
      filterDto.fields.forEach((field) => {
        query.select[field] = true;
      });
    }

    console.log(`=== query-bulider.service:query ===`);
    console.log(query);

    return query;
  }

  /**
   * Build filter conditions for Prisma where clause
   */
  private buildFilterConditions(
    filters: FilterCondition[],
    filterableFields: string[]
  ): any[] {
    return filters
      .filter(
        (f) =>
          filterableFields.length === 0 || filterableFields.includes(f.field)
      )
      .map((filter) => {
        const condition: any = {};

        switch (filter.operator) {
          case FilterOperator.EQUALS:
            condition[filter.field] = { equals: filter.value };
            break;

          case FilterOperator.NOT_EQUALS:
            condition[filter.field] = { not: filter.value };
            break;

          case FilterOperator.GREATER_THAN:
            condition[filter.field] = { gt: filter.value };
            break;

          case FilterOperator.GREATER_THAN_OR_EQUALS:
            condition[filter.field] = { gte: filter.value };
            break;

          case FilterOperator.LESS_THAN:
            condition[filter.field] = { lt: filter.value };
            break;

          case FilterOperator.LESS_THAN_OR_EQUALS:
            condition[filter.field] = { lte: filter.value };
            break;

          case FilterOperator.CONTAINS:
            condition[filter.field] = {
              contains: filter.value,
              mode: 'insensitive',
            };
            break;

          case FilterOperator.STARTS_WITH:
            condition[filter.field] = {
              startsWith: filter.value,
              mode: 'insensitive',
            };
            break;

          case FilterOperator.ENDS_WITH:
            condition[filter.field] = {
              endsWith: filter.value,
              mode: 'insensitive',
            };
            break;

          case FilterOperator.IN:
            condition[filter.field] = {
              in: Array.isArray(filter.value) ? filter.value : [filter.value],
            };
            break;

          case FilterOperator.NOT_IN:
            condition[filter.field] = {
              notIn: Array.isArray(filter.value)
                ? filter.value
                : [filter.value],
            };
            break;

          case FilterOperator.IS_NULL:
            condition[filter.field] = { equals: null };
            break;

          case FilterOperator.IS_NOT_NULL:
            condition[filter.field] = { not: null };
            break;

          default:
            condition[filter.field] = { equals: filter.value };
        }

        return condition;
      });
  }

  /**
   * Build paginated response
   */
  buildPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number | undefined | null
  ) {
    if (!limit) {
      limit = data.length;
    }

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
