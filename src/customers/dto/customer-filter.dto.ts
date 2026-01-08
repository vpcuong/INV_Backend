import { IsOptional, IsString, IsBoolean, IsNumber, IsEnum, Min, IsInt } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerStatus } from '../enums/customer-status.enum';

/**
 * Base class with only quick filters (no pagination, search, sort)
 * Used for aggregation endpoints where pagination doesn't make sense
 */
export class CustomerQuickFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by customer status',
    enum: CustomerStatus,
  })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiPropertyOptional({
    description: 'Filter by active status',
  })
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by country',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Search customer code',
  })
  @IsOptional()
  @IsString()
  customerCode?: string;

  @ApiPropertyOptional({
    description: 'Search customer name',
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({
    description: 'Filter by phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Filter by email address',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Search tax code',
  })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiPropertyOptional({
    description: 'Full-text search across multiple fields',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * DTO for filtering customers with pagination, search, sort
 * Extends CustomerQuickFiltersDto and adds pagination/sort params
 */
export class CustomerFilterDto extends CustomerQuickFiltersDto {
  // Inherited from CustomerQuickFiltersDto:
  // - status, isActive, country
  // - customerCode, customerName, phone, email, taxCode, search

  @ApiPropertyOptional({ description: 'Page number (1-based)', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

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
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map(f => f.trim()) : value))
  fields?: string[];
}
