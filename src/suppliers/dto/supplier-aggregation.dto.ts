import { IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SupplierQuickFiltersDto } from './supplier-filter.dto';

export enum AggregationType {
  COUNT = 'count',
  SUM = 'sum',
  AVG = 'avg',
  MIN = 'min',
  MAX = 'max',
}

export enum AggregationField {
  RATING = 'rating',
  STATUS = 'status',
  CATEGORY = 'category',
  COUNTRY = 'country',
  PROVINCE = 'province',
  CITY = 'city',
  IS_ACTIVE = 'isActive',
  CREATED_AT = 'createdAt',
}

/**
 * DTO for requesting aggregations on supplier data
 * Extends SupplierQuickFiltersDto (only filters, NO pagination/sort/fields)
 * Aggregation doesn't need pagination because it returns summary data, not lists
 */
export class SupplierAggregationRequestDto extends SupplierQuickFiltersDto {
  @ApiPropertyOptional({
    description: 'Fields to group by',
    enum: AggregationField,
    isArray: true,
    example: [AggregationField.CATEGORY, AggregationField.STATUS],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AggregationField, { each: true })
  groupBy?: AggregationField[];

  @ApiPropertyOptional({
    description: 'Metrics to calculate',
    enum: AggregationType,
    isArray: true,
    example: [AggregationType.COUNT, AggregationType.AVG],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AggregationType, { each: true })
  metrics?: AggregationType[];
}

/**
 * Response for supplier statistics
 */
export interface SupplierStatisticsResponse {
  // Overall statistics
  total: number;
  active: number;
  inactive: number;
  blacklisted: number;

  // Rating statistics
  averageRating: number;
  minRating: number;
  maxRating: number;
  suppliersWithRating: number;
  suppliersWithoutRating: number;

  // Category distribution
  byCategory: {
    category: string;
    count: number;
    percentage: number;
  }[];

  // Status distribution
  byStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];

  // Country distribution
  byCountry: {
    country: string;
    count: number;
    percentage: number;
  }[];

  // Province distribution (top 10)
  byProvince: {
    province: string;
    count: number;
    percentage: number;
  }[];

  // City distribution (top 10)
  byCity: {
    city: string;
    count: number;
    percentage: number;
  }[];

  // Rating distribution
  ratingDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];

  // Time-based statistics
  createdThisMonth: number;
  createdThisYear: number;
  createdLastMonth: number;
  createdLastYear: number;
}

/**
 * Generic aggregation group result
 */
export interface AggregationGroup {
  groupBy: Record<string, any>;
  count: number;
  sum?: Record<string, number>;
  avg?: Record<string, number>;
  min?: Record<string, number>;
  max?: Record<string, number>;
}

/**
 * Response for custom aggregations
 */
export interface SupplierAggregationResponse {
  groups: AggregationGroup[];
  total: number;
  appliedFilters: {
    groupBy?: string[];
    metrics?: string[];
  };
}
