import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemModelDto {
  @ApiProperty({
    description: 'Item ID',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  itemId!: number;

  @ApiProperty({
    description: 'Model code (max 20 characters)',
    example: 'MODEL001',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  code!: string;

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
    enum: ['active', 'inactive', 'draft'],
    default: 'draft',
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'draft'])
  status?: string;
}
