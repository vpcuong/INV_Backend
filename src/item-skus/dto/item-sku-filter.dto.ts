import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  IsInt,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Base class with only quick filters (no pagination, search, sort)
 * Used for aggregation endpoints where pagination doesn't make sense
 */
export class ItemSkuQuickFiltersDto {
  // Quick filters - Các filter nhanh thường dùng
  @ApiPropertyOptional({
    description: 'Filter by SKU status (e.g., active, inactive)',
    enum: ['active', 'inactive'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by item ID (e.g., 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  itemId?: number;

  @ApiPropertyOptional({
    description: 'Filter by category ID (e.g., 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Filter by model ID (e.g., 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  modelId?: number;

  @ApiPropertyOptional({
    description: 'Filter by material ID (e.g., 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  materialId?: number;

  @ApiPropertyOptional({
    description: 'Filter by color ID (e.g., 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  colorId?: number;

  @ApiPropertyOptional({
    description: 'Filter by gender ID (e.g., 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  genderId?: number;

  @ApiPropertyOptional({
    description: 'Filter by size ID (e.g., 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sizeId?: number;

  @ApiPropertyOptional({
    description: 'Filter by fabric SKU ID (e.g., 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fabricSKUId?: number;

  @ApiPropertyOptional({
    description: 'Search SKU code (e.g., SKU001)',
  })
  @IsOptional()
  @IsString()
  skuCode?: string;

  @ApiPropertyOptional({
    description:
      'Full-text search across multiple fields (e.g., skuCode, description)',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * DTO for filtering item SKUs with pagination, search, sort
 * Extends ItemSkuQuickFiltersDto and adds pagination/sort params
 */
export class ItemSkuFilterDto extends ItemSkuQuickFiltersDto {
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
      'Fields to include in response - comma separated (e.g., id,skuCode,desc)',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((f) => f.trim()) : value
  )
  fields?: string[];
}
