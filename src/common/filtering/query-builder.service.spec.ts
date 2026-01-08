import { Test, TestingModule } from '@nestjs/testing';
import { QueryBuilderService } from './query-builder.service';
import { FilterDto, FilterOperator, SortOrder } from './dto/filter.dto';
import { FilterConfig } from './interfaces/filter-config.interface';

describe('QueryBuilderService', () => {
  let service: QueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryBuilderService],
    }).compile();

    service = module.get<QueryBuilderService>(QueryBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildQuery', () => {
    const config: FilterConfig = {
      searchableFields: ['name', 'email', 'phone'],
      filterableFields: ['status', 'category', 'isActive'],
      sortableFields: ['name', 'createdAt', 'rating'],
      defaultSort: [{ field: 'createdAt', order: 'desc' }],
      maxLimit: 100,
    };

    it('should build basic query with pagination only', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.skip).toBe(0);
      expect(query.take).toBe(10);
      expect(query.orderBy).toEqual([{ createdAt: 'desc' }]);
      expect(query.where).toEqual({});
    });

    it('should calculate skip correctly for different pages', () => {
      const page2 = service.buildQuery({ page: 2, limit: 10 }, config);
      const page3 = service.buildQuery({ page: 3, limit: 20 }, config);

      expect(page2.skip).toBe(10);
      expect(page3.skip).toBe(40);
    });

    it('should enforce max limit', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 200, // Exceeds maxLimit of 100
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.take).toBe(100);
    });

    it('should use default limit when not provided', () => {
      const filterDto: FilterDto = {
        page: 1,
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.take).toBe(10);
    });

    it('should build search query across multiple fields', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        search: 'john',
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.where.OR).toEqual([
        { name: { contains: 'john', mode: 'insensitive' } },
        { email: { contains: 'john', mode: 'insensitive' } },
        { phone: { contains: 'john', mode: 'insensitive' } },
      ]);
    });

    it('should not add search when search string is empty', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        search: '',
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.where.OR).toBeUndefined();
    });

    it('should apply custom sort conditions', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        sort: [
          { field: 'name', order: SortOrder.ASC },
          { field: 'rating', order: SortOrder.DESC },
        ],
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.orderBy).toEqual([{ name: 'asc' }, { rating: 'desc' }]);
    });

    it('should ignore unsortable fields', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        sort: [
          { field: 'name', order: SortOrder.ASC },
          { field: 'unsortableField', order: SortOrder.DESC },
        ],
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.orderBy).toEqual([{ name: 'asc' }]);
    });

    it('should apply default sort when no sort provided', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.orderBy).toEqual([{ createdAt: 'desc' }]);
    });

    it('should select specific fields when provided', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        fields: ['id', 'name', 'email'],
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.select).toEqual({
        id: true,
        name: true,
        email: true,
      });
    });

    it('should not add select when no fields provided', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.select).toBeUndefined();
    });

    it('should apply advanced filters with eq operator', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        filters: [{ field: 'status', operator: FilterOperator.EQUALS, value: 'Active' }],
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.where.AND).toContainEqual({ status: { equals: 'Active' } });
    });

    it('should apply advanced filters with neq operator', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        filters: [{ field: 'status', operator: FilterOperator.NOT_EQUALS, value: 'Inactive' }],
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.where.AND).toContainEqual({ status: { not: 'Inactive' } });
    });

    it('should apply advanced filters with gt operator', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        filters: [{ field: 'rating', operator: FilterOperator.GREATER_THAN, value: 3 }],
      };

      const query = service.buildQuery(filterDto, {
        ...config,
        filterableFields: ['rating'],
      });

      expect(query.where.AND).toContainEqual({ rating: { gt: 3 } });
    });

    it('should apply advanced filters with gte operator', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        filters: [{ field: 'rating', operator: FilterOperator.GREATER_THAN_OR_EQUALS, value: 4 }],
      };

      const query = service.buildQuery(filterDto, {
        ...config,
        filterableFields: ['rating'],
      });

      expect(query.where.AND).toContainEqual({ rating: { gte: 4 } });
    });

    it('should apply advanced filters with lt operator', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        filters: [{ field: 'rating', operator: FilterOperator.LESS_THAN, value: 5 }],
      };

      const query = service.buildQuery(filterDto, {
        ...config,
        filterableFields: ['rating'],
      });

      expect(query.where.AND).toContainEqual({ rating: { lt: 5 } });
    });

    it('should apply advanced filters with lte operator', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        filters: [{ field: 'rating', operator: FilterOperator.LESS_THAN_OR_EQUALS, value: 4 }],
      };

      const query = service.buildQuery(filterDto, {
        ...config,
        filterableFields: ['rating'],
      });

      expect(query.where.AND).toContainEqual({ rating: { lte: 4 } });
    });

    it('should apply advanced filters with contains operator', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        filters: [{ field: 'name', operator: FilterOperator.CONTAINS, value: 'test' }],
      };

      const query = service.buildQuery(filterDto, {
        ...config,
        filterableFields: ['name'],
      });

      expect(query.where.AND).toContainEqual({
        name: { contains: 'test', mode: 'insensitive' },
      });
    });

    it('should apply advanced filters with startsWith operator', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        filters: [{ field: 'email', operator: FilterOperator.STARTS_WITH, value: 'admin' }],
      };

      const query = service.buildQuery(filterDto, {
        ...config,
        filterableFields: ['email'],
      });

      expect(query.where.AND).toContainEqual({
        email: { startsWith: 'admin', mode: 'insensitive' },
      });
    });

    it('should apply advanced filters with endsWith operator', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        filters: [{ field: 'email', operator: FilterOperator.ENDS_WITH, value: '@gmail.com' }],
      };

      const query = service.buildQuery(filterDto, {
        ...config,
        filterableFields: ['email'],
      });

      expect(query.where.AND).toContainEqual({
        email: { endsWith: '@gmail.com', mode: 'insensitive' },
      });
    });

    it('should apply advanced filters with in operator', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        filters: [
          {
            field: 'category',
            operator: FilterOperator.IN,
            value: ['Fabric', 'Accessories'],
          },
        ],
      };

      const query = service.buildQuery(filterDto, {
        ...config,
        filterableFields: ['category'],
      });

      expect(query.where.AND).toContainEqual({
        category: { in: ['Fabric', 'Accessories'] },
      });
    });

    it('should apply advanced filters with notIn operator', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        filters: [
          {
            field: 'status',
            operator: FilterOperator.NOT_IN,
            value: ['Blacklist'],
          },
        ],
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.where.AND).toContainEqual({
        status: { notIn: ['Blacklist'] },
      });
    });

    it('should apply advanced filters with isNull operator', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        filters: [{ field: 'deletedAt', operator: FilterOperator.IS_NULL, value: null }],
      };

      const query = service.buildQuery(filterDto, {
        ...config,
        filterableFields: ['deletedAt'],
      });

      expect(query.where.AND).toContainEqual({ deletedAt: { equals: null } });
    });

    it('should apply advanced filters with isNotNull operator', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        filters: [{ field: 'deletedAt', operator: FilterOperator.IS_NOT_NULL, value: null }],
      };

      const query = service.buildQuery(filterDto, {
        ...config,
        filterableFields: ['deletedAt'],
      });

      expect(query.where.AND).toContainEqual({ deletedAt: { not: null } });
    });

    it('should ignore filters on non-filterable fields', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        filters: [
          { field: 'status', operator: FilterOperator.EQUALS, value: 'Active' },
          { field: 'nonFilterableField', operator: FilterOperator.EQUALS, value: 'test' },
        ],
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.where.AND?.length).toBe(1);
      expect(query.where.AND).toContainEqual({ status: { equals: 'Active' } });
    });

    it('should combine search and filters', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        search: 'john',
        filters: [{ field: 'status', operator: FilterOperator.EQUALS, value: 'Active' }],
      };

      const query = service.buildQuery(filterDto, config);

      // When both search and filters exist, OR is nested inside AND
      expect(query.where.AND).toBeDefined();
      expect(query.where.AND.length).toBeGreaterThan(0);
      expect(query.where.AND[0]).toHaveProperty('OR');
      expect(query.where.AND).toContainEqual({ status: { equals: 'Active' } });
    });

    it('should handle multiple filters', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        filters: [
          { field: 'status', operator: FilterOperator.EQUALS, value: 'Active' },
          { field: 'category', operator: FilterOperator.EQUALS, value: 'Fabric' },
          { field: 'isActive', operator: FilterOperator.EQUALS, value: true },
        ],
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.where.AND?.length).toBe(3);
    });

    it('should include relations when specified', () => {
      const configWithRelations: FilterConfig = {
        ...config,
        relations: ['items', 'orders'],
      };

      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
      };

      const query = service.buildQuery(filterDto, configWithRelations);

      expect(query.include).toEqual({
        items: true,
        orders: true,
      });
    });

    it('should not include relations when not specified', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.include).toBeUndefined();
    });

    it('should handle empty filters array', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        filters: [],
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.where.AND).toBeUndefined();
    });

    it('should handle empty sort array', () => {
      const filterDto: FilterDto = {
        page: 1,
        limit: 10,
        sort: [],
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.orderBy).toEqual([{ createdAt: 'desc' }]);
    });

    it('should handle complex query with all features', () => {
      const filterDto: FilterDto = {
        page: 2,
        limit: 20,
        search: 'test',
        sort: [{ field: 'name', order: SortOrder.ASC }],
        fields: ['id', 'name', 'email'],
        filters: [
          { field: 'status', operator: FilterOperator.EQUALS, value: 'Active' },
          { field: 'category', operator: FilterOperator.IN, value: ['Fabric', 'Yarn'] },
        ],
      };

      const query = service.buildQuery(filterDto, config);

      expect(query.skip).toBe(20);
      expect(query.take).toBe(20);
      // When search + filters: OR is nested inside AND
      expect(query.where.AND).toBeDefined();
      expect(query.where.AND.length).toBe(3); // { OR: [...] }, { status: ... }, { category: ... }
      expect(query.where.AND[0]).toHaveProperty('OR');
      expect(query.orderBy).toEqual([{ name: 'asc' }]);
      expect(query.select).toBeDefined();
    });
  });

  describe('buildPaginatedResponse', () => {
    it('should build correct paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const total = 50;
      const page = 1;
      const limit = 10;

      const response = service.buildPaginatedResponse(data, total, page, limit);

      expect(response.data).toEqual(data);
      expect(response.meta.total).toBe(50);
      expect(response.meta.page).toBe(1);
      expect(response.meta.limit).toBe(10);
      expect(response.meta.totalPages).toBe(5);
      expect(response.meta.hasNextPage).toBe(true);
      expect(response.meta.hasPreviousPage).toBe(false);
    });

    it('should calculate total pages correctly', () => {
      const data: any[] = [];
      const total = 25;
      const page = 1;
      const limit = 10;

      const response = service.buildPaginatedResponse(data, total, page, limit);

      expect(response.meta.totalPages).toBe(3);
    });

    it('should handle last page correctly', () => {
      const data: any[] = [];
      const total = 50;
      const page = 5;
      const limit = 10;

      const response = service.buildPaginatedResponse(data, total, page, limit);

      expect(response.meta.hasNextPage).toBe(false);
      expect(response.meta.hasPreviousPage).toBe(true);
    });

    it('should handle single page', () => {
      const data = [{ id: 1 }];
      const total = 5;
      const page = 1;
      const limit = 10;

      const response = service.buildPaginatedResponse(data, total, page, limit);

      expect(response.meta.totalPages).toBe(1);
      expect(response.meta.hasNextPage).toBe(false);
      expect(response.meta.hasPreviousPage).toBe(false);
    });

    it('should handle empty results', () => {
      const data: any[] = [];
      const total = 0;
      const page = 1;
      const limit = 10;

      const response = service.buildPaginatedResponse(data, total, page, limit);

      expect(response.data).toEqual([]);
      expect(response.meta.total).toBe(0);
      expect(response.meta.totalPages).toBe(0);
      expect(response.meta.hasNextPage).toBe(false);
      expect(response.meta.hasPreviousPage).toBe(false);
    });

    it('should handle middle page correctly', () => {
      const data: any[] = [];
      const total = 100;
      const page = 3;
      const limit = 10;

      const response = service.buildPaginatedResponse(data, total, page, limit);

      expect(response.meta.hasNextPage).toBe(true);
      expect(response.meta.hasPreviousPage).toBe(true);
    });
  });
});
