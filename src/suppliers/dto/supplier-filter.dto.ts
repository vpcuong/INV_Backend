import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsEnum,
  Min,
  IsArray,
} from 'class-validator';
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
    description:
      'Filter by supplier category (e.g., FABRIC, ACCESSORIES, PACKAGING, YARN)',
    enum: SupplierCategory,
  })
  @IsOptional()
  @IsEnum(SupplierCategory)
  category?: SupplierCategory;

  @ApiPropertyOptional({
    description: 'Filter by active status (true/false)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by city (e.g., Ho Chi Minh City)',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filter by province (e.g., Ho Chi Minh)',
  })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({
    description: 'Filter by country (e.g., Vietnam)',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Search supplier code - shortcut for filters (e.g., SUP001)',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description:
      'Search supplier name - shortcut for filters (e.g., ABC Textiles)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Full-text search across multiple fields (e.g., ABC)',
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
  @ApiPropertyOptional({
    description: 'Page number - 1-based (e.g., 1)',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description:
      'Items per page (e.g., 10). If not provided, returns all results',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description:
      'Sort conditions - JSON string (e.g., [{"field":"createdAt","order":"desc"}])',
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
    description:
      'Fields to include in response - comma separated (e.g., id,code,name)',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((f) => f.trim()) : value
  )
  fields?: string[];
}
