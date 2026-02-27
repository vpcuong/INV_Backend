import { IsOptional, IsDateString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum RevenueGroupBy {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class SOAnalyticsBaseDto {
  @ApiPropertyOptional({ description: 'Start date (ISO date)', example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  orderDateFrom?: string;

  @ApiPropertyOptional({ description: 'End date (ISO date)', example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  orderDateTo: string;

  @ApiPropertyOptional({
    description: 'Filter by customer ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customerId?: number;
}

export class SORevenueAnalyticsDto extends SOAnalyticsBaseDto {
  @ApiPropertyOptional({
    description: 'Group revenue by time period',
    enum: RevenueGroupBy,
    default: RevenueGroupBy.DAY,
  })
  @IsOptional()
  @IsEnum(RevenueGroupBy)
  groupBy?: RevenueGroupBy = RevenueGroupBy.DAY;
}

export class SOTopSkusDto extends SOAnalyticsBaseDto {
  @ApiPropertyOptional({ description: 'Number of top SKUs to return', default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class SOTopCustomersDto extends SOAnalyticsBaseDto {
  @ApiPropertyOptional({ description: 'Number of top customers to return', default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
