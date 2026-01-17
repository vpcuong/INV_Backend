import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  PaginationDto,
  BaseFilterDto,
  FilterDto,
  FilterCondition,
  SortCondition,
  FilterOperator,
  SortOrder,
} from './filter.dto';

describe('FilterDto', () => {
  describe('PaginationDto', () => {
    it('should accept valid pagination parameters', async () => {
      const dto = plainToInstance(PaginationDto, {
        page: 1,
        limit: 10,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(10);
    });

    it('should use default values when not provided', async () => {
      const dto = plainToInstance(PaginationDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(10);
    });

    it('should fail validation when page is less than 1', async () => {
      const dto = plainToInstance(PaginationDto, {
        page: 0,
        limit: 10,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
    });

    it('should fail validation when limit is less than 1', async () => {
      const dto = plainToInstance(PaginationDto, {
        page: 1,
        limit: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
    });

    it('should convert string numbers to numbers', async () => {
      const dto = plainToInstance(PaginationDto, {
        page: '2',
        limit: '20',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.page).toBe(2);
      expect(dto.limit).toBe(20);
    });
  });

  describe('BaseFilterDto', () => {
    it('should accept valid base filter parameters', () => {
      const dto = plainToInstance(BaseFilterDto, {
        page: 1,
        limit: 20,
        search: 'test search',
        sort: JSON.stringify([{ field: 'name', order: 'asc' }]),
        fields: 'id,name,email',
      });

      expect(dto.search).toBe('test search');
      expect(dto.sort).toEqual([{ field: 'name', order: 'asc' }]);
      expect(dto.fields).toEqual(['id', 'name', 'email']);
    });

    it('should parse sort JSON string correctly', () => {
      const dto = plainToInstance(BaseFilterDto, {
        sort: '[{"field":"createdAt","order":"desc"},{"field":"name","order":"asc"}]',
      });

      expect(dto.sort).toEqual([
        { field: 'createdAt', order: 'desc' },
        { field: 'name', order: 'asc' },
      ]);
    });

    it('should handle invalid sort JSON gracefully', () => {
      const dto = plainToInstance(BaseFilterDto, {
        sort: 'invalid json',
      });

      expect(dto.sort).toEqual([]);
    });

    it('should split comma-separated fields', () => {
      const dto = plainToInstance(BaseFilterDto, {
        fields: 'id, name, email, createdAt',
      });

      expect(dto.fields).toEqual(['id', 'name', 'email', 'createdAt']);
    });

    it('should trim whitespace from field names', () => {
      const dto = plainToInstance(BaseFilterDto, {
        fields: '  id  ,  name  ,  email  ',
      });

      expect(dto.fields).toEqual(['id', 'name', 'email']);
    });

    it('should accept empty search string', async () => {
      const dto = plainToInstance(BaseFilterDto, {
        search: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.search).toBe('');
    });

    it('should work without any optional fields', async () => {
      const dto = plainToInstance(BaseFilterDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(10);
      expect(dto.search).toBeUndefined();
      expect(dto.sort).toBeUndefined();
      expect(dto.fields).toBeUndefined();
    });
  });

  describe('FilterDto', () => {
    it('should accept valid filter conditions', () => {
      const dto = plainToInstance(FilterDto, {
        filters: JSON.stringify([
          { field: 'status', operator: 'eq', value: 'Active' },
          { field: 'rating', operator: 'gte', value: 4 },
        ]),
      });

      expect(dto.filters).toEqual([
        { field: 'status', operator: 'eq', value: 'Active' },
        { field: 'rating', operator: 'gte', value: 4 },
      ]);
    });

    it('should handle all filter operators', () => {
      const operators = [
        { operator: 'eq', value: 'test' },
        { operator: 'neq', value: 'test' },
        { operator: 'gt', value: 5 },
        { operator: 'gte', value: 5 },
        { operator: 'lt', value: 10 },
        { operator: 'lte', value: 10 },
        { operator: 'contains', value: 'substring' },
        { operator: 'startsWith', value: 'prefix' },
        { operator: 'endsWith', value: 'suffix' },
        { operator: 'in', value: ['a', 'b', 'c'] },
        { operator: 'notIn', value: ['x', 'y', 'z'] },
        { operator: 'isNull', value: null },
        { operator: 'isNotNull', value: null },
      ];

      const dto = plainToInstance(FilterDto, {
        filters: JSON.stringify(
          operators.map((op) => ({
            field: 'testField',
            operator: op.operator,
            value: op.value,
          }))
        ),
      });

      expect(dto.filters?.length).toBe(operators.length);
    });

    it('should handle invalid filters JSON gracefully', () => {
      const dto = plainToInstance(FilterDto, {
        filters: 'not valid json',
      });

      expect(dto.filters).toEqual([]);
    });

    it('should combine pagination, search, sort, and filters', () => {
      const dto = plainToInstance(FilterDto, {
        page: 2,
        limit: 50,
        search: 'test',
        sort: '[{"field":"name","order":"asc"}]',
        fields: 'id,name',
        filters: '[{"field":"status","operator":"eq","value":"Active"}]',
      });

      expect(dto.page).toBe(2);
      expect(dto.limit).toBe(50);
      expect(dto.search).toBe('test');
      expect(dto.sort).toEqual([{ field: 'name', order: 'asc' }]);
      expect(dto.fields).toEqual(['id', 'name']);
      expect(dto.filters).toEqual([
        { field: 'status', operator: 'eq', value: 'Active' },
      ]);
    });

    it('should accept empty filters array', () => {
      const dto = plainToInstance(FilterDto, {
        filters: '[]',
      });

      expect(dto.filters).toEqual([]);
    });

    it('should handle complex nested values', () => {
      const dto = plainToInstance(FilterDto, {
        filters: JSON.stringify([
          {
            field: 'metadata',
            operator: 'in',
            value: ['value1', 'value2', 'value3'],
          },
        ]),
      });

      expect(dto.filters?.[0].value).toEqual(['value1', 'value2', 'value3']);
    });
  });

  describe('FilterCondition', () => {
    it('should validate required fields', async () => {
      const condition = plainToInstance(FilterCondition, {
        field: 'name',
        operator: FilterOperator.CONTAINS,
        value: 'test',
      });

      const errors = await validate(condition);
      expect(errors.length).toBe(0);
    });

    it('should fail when field is missing', async () => {
      const condition = plainToInstance(FilterCondition, {
        operator: FilterOperator.EQUALS,
        value: 'test',
      });

      const errors = await validate(condition);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'field')).toBe(true);
    });

    it('should fail when operator is invalid', async () => {
      const condition = plainToInstance(FilterCondition, {
        field: 'name',
        operator: 'invalid_operator',
        value: 'test',
      });

      const errors = await validate(condition);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'operator')).toBe(true);
    });

    it('should allow null value for isNull operator', async () => {
      const condition = plainToInstance(FilterCondition, {
        field: 'deletedAt',
        operator: FilterOperator.IS_NULL,
        value: null,
      });

      const errors = await validate(condition);
      expect(errors.length).toBe(0);
    });
  });

  describe('SortCondition', () => {
    it('should validate valid sort condition', async () => {
      const condition = plainToInstance(SortCondition, {
        field: 'createdAt',
        order: SortOrder.DESC,
      });

      const errors = await validate(condition);
      expect(errors.length).toBe(0);
    });

    it('should fail when field is missing', async () => {
      const condition = plainToInstance(SortCondition, {
        order: SortOrder.ASC,
      });

      const errors = await validate(condition);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'field')).toBe(true);
    });

    it('should fail when order is invalid', async () => {
      const condition = plainToInstance(SortCondition, {
        field: 'name',
        order: 'invalid',
      });

      const errors = await validate(condition);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'order')).toBe(true);
    });

    it('should accept both asc and desc orders', async () => {
      const asc = plainToInstance(SortCondition, {
        field: 'name',
        order: SortOrder.ASC,
      });

      const desc = plainToInstance(SortCondition, {
        field: 'name',
        order: SortOrder.DESC,
      });

      const ascErrors = await validate(asc);
      const descErrors = await validate(desc);

      expect(ascErrors.length).toBe(0);
      expect(descErrors.length).toBe(0);
    });
  });

  describe('Enum values', () => {
    it('should have all FilterOperator enum values', () => {
      expect(FilterOperator.EQUALS).toBe('eq');
      expect(FilterOperator.NOT_EQUALS).toBe('neq');
      expect(FilterOperator.GREATER_THAN).toBe('gt');
      expect(FilterOperator.GREATER_THAN_OR_EQUALS).toBe('gte');
      expect(FilterOperator.LESS_THAN).toBe('lt');
      expect(FilterOperator.LESS_THAN_OR_EQUALS).toBe('lte');
      expect(FilterOperator.CONTAINS).toBe('contains');
      expect(FilterOperator.STARTS_WITH).toBe('startsWith');
      expect(FilterOperator.ENDS_WITH).toBe('endsWith');
      expect(FilterOperator.IN).toBe('in');
      expect(FilterOperator.NOT_IN).toBe('notIn');
      expect(FilterOperator.IS_NULL).toBe('isNull');
      expect(FilterOperator.IS_NOT_NULL).toBe('isNotNull');
    });

    it('should have all SortOrder enum values', () => {
      expect(SortOrder.ASC).toBe('asc');
      expect(SortOrder.DESC).toBe('desc');
    });
  });
});
