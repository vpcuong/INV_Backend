import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SkuFilterDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  itemId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  modelId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  colorId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  genderId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sizeId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  supplierId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  customerId?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
