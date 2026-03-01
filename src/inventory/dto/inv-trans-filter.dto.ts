import { IsOptional, IsNumber, IsString, IsDateString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FilterDto } from '../../common/filtering/dto/filter.dto';
import { InvTransType, InvTransStatus } from '../enums/inv-trans.enum';

export class InvTransFilterDto extends FilterDto {
  @ApiPropertyOptional({ description: 'Transaction Type', enum: InvTransType })
  @IsOptional()
  @IsEnum(InvTransType)
  type?: InvTransType;

  @ApiPropertyOptional({ description: 'Transaction Status', enum: InvTransStatus })
  @IsOptional()
  @IsEnum(InvTransStatus)
  status?: InvTransStatus;

  @ApiPropertyOptional({ description: 'Source Warehouse ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fromWarehouseId?: number;

  @ApiPropertyOptional({ description: 'Destination Warehouse ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  toWarehouseId?: number;

  @ApiPropertyOptional({ description: 'Reference Type' })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({ description: 'Reference Number' })
  @IsOptional()
  @IsString()
  referenceNum?: string;

  @ApiPropertyOptional({ description: 'Date From' })
  @IsOptional()
  @IsDateString()
  transactionDateFrom?: string;

  @ApiPropertyOptional({ description: 'Date To' })
  @IsOptional()
  @IsDateString()
  transactionDateTo?: string;
}

export class InvTransCursorFilterDto {
  @ApiPropertyOptional({ description: 'Transaction Type', enum: InvTransType })
  @IsOptional()
  @IsEnum(InvTransType)
  type?: InvTransType;

  @ApiPropertyOptional({ description: 'Transaction Status', enum: InvTransStatus })
  @IsOptional()
  @IsEnum(InvTransStatus)
  status?: InvTransStatus;

  @ApiPropertyOptional({ description: 'Source Warehouse ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fromWarehouseId?: number;

  @ApiPropertyOptional({ description: 'Destination Warehouse ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  toWarehouseId?: number;

  @ApiPropertyOptional({ description: 'Reference Type' })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({ description: 'Reference Number' })
  @IsOptional()
  @IsString()
  referenceNum?: string;

  @ApiPropertyOptional({ description: 'Date From' })
  @IsOptional()
  @IsDateString()
  transactionDateFrom?: string;

  @ApiPropertyOptional({ description: 'Date To' })
  @IsOptional()
  @IsDateString()
  transactionDateTo?: string;

  @ApiPropertyOptional({ description: 'Search text (transNum, referenceNum, note)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Cursor from previous page response' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Page size', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
