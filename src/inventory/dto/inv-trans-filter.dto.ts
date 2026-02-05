import { IsOptional, IsString, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { InvTransType, InvTransStatus } from '../enums/inv-trans.enum';

export class InvTransFilterDto {
  @IsOptional()
  @IsEnum(InvTransType)
  type?: InvTransType;

  @IsOptional()
  @IsEnum(InvTransStatus)
  status?: InvTransStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fromWarehouseId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  toWarehouseId?: number;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceNum?: string;

  @IsOptional()
  @IsDateString()
  transactionDateFrom?: string;

  @IsOptional()
  @IsDateString()
  transactionDateTo?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
