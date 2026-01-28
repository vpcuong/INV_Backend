import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ModelFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by Item ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  itemId?: number;

  @ApiPropertyOptional({
    description: 'Filter by Customer ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  customerId?: number;

  @ApiPropertyOptional({
    description: 'Filter by Model status',
    enum: ['active', 'inactive', 'draft'],
    example: 'active',
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'draft'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Search by Model code or description',
    example: 'MODEL001',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number - 1-based',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page. If not provided, returns all results',
    minimum: 1,
    maximum: 100,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sort conditions - JSON string (e.g., [{"field":"createdAt","order":"desc"}])',
    example: '[{"field":"code","order":"asc"}]',
  })
  @IsOptional()
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
  sort?: any[];
}