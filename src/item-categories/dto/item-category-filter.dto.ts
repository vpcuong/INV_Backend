import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ItemCategoryType } from '../enums/item-category-type.enum';

/**
 * Base class with only quick filters (no pagination, search, sort)
 */
export class ItemCategoryQuickFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by category code',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
  })
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description:
      'Filter by category type: OUT (Outsourced), FIG (Finished Good), FAB (Fabric)',
    enum: ItemCategoryType,
  })
  @IsOptional()
  @IsEnum(ItemCategoryType)
  type?: ItemCategoryType;

  @ApiPropertyOptional({
    description: 'Full-text search across code and description',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * DTO for filtering item categories with pagination, search, sort
 */
export class ItemCategoryFilterDto extends ItemCategoryQuickFiltersDto {
  // Inherited from ItemCategoryQuickFiltersDto:
  // - code, isActive, search

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
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
    minimum: 1,
    maximum: 100,
    default: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 100;

  @ApiPropertyOptional({
    description: 'Sort conditions (JSON string)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
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
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((f) => f.trim()) : value
  )
  fields?: string[];
}
