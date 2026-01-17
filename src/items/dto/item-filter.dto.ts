import {
  IsOptional,
  IsString,
  IsBoolean,
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
export class ItemQuickFiltersDto {
  // Quick filters - Các filter nhanh thường dùng
  @ApiPropertyOptional({
    description: 'Filter by item status (e.g., active, inactive, draft)',
    enum: ['active', 'inactive', 'draft'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'draft'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by category ID (e.g., 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Filter by item type ID (e.g., 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  itemTypeId?: number;

  @ApiPropertyOptional({
    description: 'Filter by material ID (e.g., 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  materialId?: number;

  @ApiPropertyOptional({
    description: 'Filter by fabric supplier ID (e.g., 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fabricSupId?: number;

  @ApiPropertyOptional({
    description: 'Filter by manufactured items (true/false)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isManufactured?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by purchasable items (true/false)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPurchasable?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by sellable items (true/false)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isSellable?: boolean;

  @ApiPropertyOptional({
    description: 'Search item code (e.g., ITM001)',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Filter by UOM code (e.g., EA, KG)',
  })
  @IsOptional()
  @IsString()
  uomCode?: string;

  @ApiPropertyOptional({
    description:
      'Full-text search across multiple fields (e.g., code, description)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description:
      'Filter items with purchasing price greater than or equal to this value (e.g., 10.50)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPurchasingPrice?: number;

  @ApiPropertyOptional({
    description:
      'Filter items with purchasing price less than or equal to this value (e.g., 100.00)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPurchasingPrice?: number;

  @ApiPropertyOptional({
    description:
      'Filter items with selling price greater than or equal to this value (e.g., 20.00)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minSellingPrice?: number;

  @ApiPropertyOptional({
    description:
      'Filter items with selling price less than or equal to this value (e.g., 200.00)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxSellingPrice?: number;
}

/**
 * DTO for filtering items with pagination, search, sort
 * Extends ItemQuickFiltersDto and adds pagination/sort params
 */
export class ItemFilterDto extends ItemQuickFiltersDto {
  // Inherited from ItemQuickFiltersDto:
  // - status, categoryId, itemTypeId, materialId, fabricSupId
  // - isManufactured, isPurchasable, isSellable
  // - code, uomCode, search
  // - minPurchasingPrice, maxPurchasingPrice, minSellingPrice, maxSellingPrice

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
      'Fields to include in response - comma separated (e.g., id,code,desc)',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((f) => f.trim()) : value
  )
  fields?: string[];
}
