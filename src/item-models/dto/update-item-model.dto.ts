import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateItemModelDto {
  @ApiPropertyOptional({
    description: 'Model code (cannot be changed for data integrity)',
    example: 'MODEL001',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Summer 2024 Collection',
  })
  @IsOptional()
  @IsString()
  desc?: string;

  @ApiPropertyOptional({
    description: 'Customer ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  customerId?: number;

  @ApiPropertyOptional({
    description: 'Status',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;
}
