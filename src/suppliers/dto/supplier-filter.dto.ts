import { IsOptional, IsString, IsBoolean, IsNumber, IsEnum, Min, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SupplierStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  BLACKLIST = 'Blacklist',
}

export enum SupplierCategory {
  FABRIC = 'Fabric',
  ACCESSORIES = 'Accessories',
  PACKAGING = 'Packaging',
  YARN = 'Yarn',
}

/**
 * Base class with only quick filters (no pagination, search, sort)
 * Used for aggregation endpoints where pagination doesn't make sense
 */
export class SupplierQuickFiltersDto {
  // Quick filters - Các filter nhanh thường dùng
  @ApiPropertyOptional({
    description: 'Filter by supplier category',
    enum: SupplierCategory,
    example: SupplierCategory.FABRIC,
  })
  @IsOptional()
  @IsEnum(SupplierCategory)
  category?: SupplierCategory;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by city',
    example: 'Ho Chi Minh City',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filter by province',
    example: 'Ho Chi Minh',
  })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({
    description: 'Filter by country',
    example: 'Vietnam',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Search supplier code (shortcut for filters)',
    example: 'SUP001',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Search supplier name (shortcut for filters)',
    example: 'ABC Textiles',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Full-text search across multiple fields',
    example: 'ABC',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * DTO for filtering suppliers with pagination, search, sort
 * Extends BaseFilterDto and adds supplier-specific quick filters
 */
export class SupplierFilterDto extends SupplierQuickFiltersDto {
  // Inherited from SupplierQuickFiltersDto:
  // - category, isActive
  // - city, province, country
  // - code, name, search

  // Add pagination, sort, fields
  @ApiPropertyOptional({ description: 'Page number (1-based)', example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 10, minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort conditions (JSON string)',
    example: '[{"field":"createdAt","order":"desc"}]',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        // convert JSON string to array
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  sort?: any[];

  @ApiPropertyOptional({
    description: 'Fields to include in response',
    example: 'id,code,name',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map(f => f.trim()) : value))
  fields?: string[];
}