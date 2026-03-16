import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min, IsString, IsInt, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class FindPOsDto {
  @ApiPropertyOptional({ description: 'Offset for pagination', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  skip?: number;

  @ApiPropertyOptional({ description: 'Limit for pagination', example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  take?: number;

  @ApiPropertyOptional({ description: 'Filter by supplier ID', example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  supplierId?: number;

  @ApiPropertyOptional({
    description: 'Filter by PO status',
    example: 'DRAFT',
    enum: ['DRAFT', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED', 'CANCELLED'],
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by PO type',
    example: 'SUBCONTRACT',
    enum: ['STANDARD', 'SUBCONTRACT'],
  })
  @IsOptional()
  @IsEnum(['STANDARD', 'SUBCONTRACT'])
  type?: string;
}

export class POCursorFilterDto {
  @ApiPropertyOptional({ description: 'Cursor from previous page (opaque base64url string)' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by supplier ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  supplierId?: number;

  @ApiPropertyOptional({
    description: 'Filter by PO status',
    enum: ['DRAFT', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED', 'CANCELLED'],
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by PO type', enum: ['STANDARD', 'SUBCONTRACT'] })
  @IsOptional()
  @IsEnum(['STANDARD', 'SUBCONTRACT'])
  type?: string;

  @ApiPropertyOptional({ description: 'Filter by order date from (ISO date)' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filter by order date to (ISO date)' })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
