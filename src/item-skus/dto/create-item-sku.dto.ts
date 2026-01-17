import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemSkuDto {
  @ApiPropertyOptional({
    description: 'SKU code (auto-generated if not provided)',
    example: 'GRE-UNI-M',
  })
  @IsOptional()
  @IsString()
  skuCode?: string;

  @ApiPropertyOptional({
    description: 'Item ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  itemId?: number;

  @ApiPropertyOptional({
    description: 'Item Model ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  modelId?: number;

  @ApiProperty({
    description: 'Color ID',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  colorId?: number;

  @ApiPropertyOptional({
    description: 'Gender ID',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  genderId?: number;

  @ApiPropertyOptional({
    description: 'Size ID',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sizeId?: number;

  @ApiPropertyOptional({
    description: 'Supplier ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  supplierId?: number;

  @ApiPropertyOptional({
    description: 'Customer ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customerId?: number;

  @ApiPropertyOptional({
    description: 'Fabric SKU ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fabricSKUId?: number;

  @ApiPropertyOptional({
    description: 'Pattern description',
    example: 'Striped',
  })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiPropertyOptional({
    description: 'Cost price (purchase price)',
    example: 12.5,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({
    description: 'Selling price',
    example: 24.99,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @ApiPropertyOptional({
    description: 'Length in centimeters',
    example: 50.5,
  })
  @IsOptional()
  @IsNumber()
  lengthCm?: number;

  @ApiPropertyOptional({
    description: 'Width in centimeters',
    example: 30.0,
  })
  @IsOptional()
  @IsNumber()
  widthCm?: number;

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 2.5,
  })
  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @ApiPropertyOptional({
    description: 'Weight in grams',
    example: 250.0,
  })
  @IsOptional()
  @IsNumber()
  weightG?: number;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Premium quality item',
  })
  @IsOptional()
  @IsString()
  desc?: string;

  @ApiPropertyOptional({
    description: 'UOM code',
    example: 'EA',
  })
  @IsOptional()
  @IsString()
  uomCode?: string;

  @ApiPropertyOptional({
    description: 'Status',
    example: 'active',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;
}
