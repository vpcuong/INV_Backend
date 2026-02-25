import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  IsInt,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Base class with only quick filters (no pagination, search, sort)
 */
export class SOQuickFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by order status',
    enum: [
      'DRAFT',
      'OPEN',
      'PARTIAL',
      'CLOSED',
      'CANCELLED',
      'ON_HOLD',
    ],
  })
  @IsOptional()
  @IsEnum([
    'DRAFT',
    'OPEN',
    'PARTIAL',
    'CLOSED',
    'CANCELLED',
    'ON_HOLD',
  ])
  orderStatus?: string;

  @ApiPropertyOptional({
    description: 'Filter by customer ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customerId?: number;

  @ApiPropertyOptional({
    description: 'Filter by SO number',
  })
  @IsOptional()
  @IsString()
  soNum?: string;

  @ApiPropertyOptional({
    description: 'Filter by customer PO number',
  })
  @IsOptional()
  @IsString()
  customerPoNum?: string;

  @ApiPropertyOptional({
    description: 'Filter by channel',
  })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiPropertyOptional({
    description: 'Filter by order date from (ISO date)',
  })
  @IsOptional()
  @IsDateString()
  orderDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by order date to (ISO date)',
  })
  @IsOptional()
  @IsDateString()
  orderDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by minimum order total',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOrderTotal?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum order total',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxOrderTotal?: number;

  @ApiPropertyOptional({
    description: 'Full-text search across SO number, customer PO, notes',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * DTO for cursor-based pagination
 */
export class SOCursorFilterDto extends SOQuickFiltersDto {
  @ApiPropertyOptional({
    description: 'Cursor from previous page (opaque base64 string)',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

/**
 * DTO for filtering sales orders with pagination, search, sort
 */
export class SOFilterDto extends SOQuickFiltersDto {
  @ApiPropertyOptional({
    description: 'Page number - 1-based',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page. If not provided, returns all results',
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
      'Sort conditions - JSON string (e.g., [{"field":"orderDate","order":"desc"}])',
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

  @ApiPropertyOptional({
    description: 'Fields to include in response - comma separated',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((f) => f.trim()) : value
  )
  fields?: string[];
}
