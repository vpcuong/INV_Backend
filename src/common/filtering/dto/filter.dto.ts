import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUALS = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUALS = 'lte',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  IN = 'in',
  NOT_IN = 'notIn',
  IS_NULL = 'isNull',
  IS_NOT_NULL = 'isNotNull',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class FilterCondition {
  @ApiPropertyOptional({ description: 'Field name to filter', example: 'name' })
  @IsString()
  field!: string;

  @ApiPropertyOptional({
    description: 'Filter operator',
    enum: FilterOperator,
    example: FilterOperator.CONTAINS,
  })
  @IsEnum(FilterOperator)
  operator!: FilterOperator;

  @ApiPropertyOptional({ description: 'Filter value', example: 'ABC' })
  value?: any;
}

export class SortCondition {
  @ApiPropertyOptional({
    description: 'Field name to sort',
    example: 'createdAt',
  })
  @IsString()
  field!: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsEnum(SortOrder)
  order!: SortOrder;
}

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

/**
 * Base filter DTO with pagination, search, and sort
 * Use this for custom filter DTOs that don't need advanced filters
 */
export class BaseFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search query (searches across multiple fields)',
    example: 'ABC',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort conditions (JSON string)',
    example: '[{"field":"createdAt","order":"desc"}]',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  @ValidateNested({ each: true })
  @Type(() => SortCondition)
  sort?: SortCondition[];

  @ApiPropertyOptional({
    description: 'Fields to include in response',
    example: 'id,code,name',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((f) => f.trim()) : value
  )
  fields?: string[];
}

/**
 * Full filter DTO with advanced filters
 * Use this when you need JSON-based advanced filtering
 */
export class FilterDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: 'Filter conditions (JSON string)',
    example: '[{"field":"status","operator":"eq","value":"Active"}]',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  @ValidateNested({ each: true })
  @Type(() => FilterCondition)
  filters?: FilterCondition[];
}
