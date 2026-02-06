import { IsOptional, IsString, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InvTransType, InvTransStatus } from '../enums/inv-trans.enum';

export class InvTransFilterDto {
  @ApiPropertyOptional({ description: 'Transaction Type', enum: InvTransType })
  @IsOptional()
  @IsEnum(InvTransType)
  type?: InvTransType;

  @ApiPropertyOptional({ description: 'Transaction Status', enum: InvTransStatus })
  @IsOptional()
  @IsEnum(InvTransStatus)
  status?: InvTransStatus;

  @ApiPropertyOptional({ description: 'Source Warehouse ID', example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fromWarehouseId?: number;

  @ApiPropertyOptional({ description: 'Destination Warehouse ID', example: 2 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  toWarehouseId?: number;

  @ApiPropertyOptional({ description: 'Reference Type', example: 'PO' })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({ description: 'Reference Number', example: 'PO-2023-001' })
  @IsOptional()
  @IsString()
  referenceNum?: string;

  @ApiPropertyOptional({ description: 'Date From', example: '2023-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  transactionDateFrom?: string;

  @ApiPropertyOptional({ description: 'Date To', example: '2023-01-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  transactionDateTo?: string;

  @ApiPropertyOptional({ description: 'Search term', example: 'INV-123' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Limit per page', example: 10, default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort by field', example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
