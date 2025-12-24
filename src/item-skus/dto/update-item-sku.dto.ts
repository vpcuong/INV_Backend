import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';

export class UpdateItemSkuDto {
  @ApiPropertyOptional({
    description: 'SKU code',
    example: 'GRE-UNI-M',
  })
  @IsOptional()
  @IsString()
  skuCode?: string;

  @ApiPropertyOptional({
    description: 'UOM code',
    example: 'EA',
  })
  @IsOptional()
  @IsString()
  uomCode?: string;

  @ApiPropertyOptional({
    description: 'Color ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  colorId?: number;

  @ApiPropertyOptional({
    description: 'Gender ID',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  genderId?: number;

  @ApiPropertyOptional({
    description: 'Size ID',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  sizeId?: number;

  @ApiPropertyOptional({
    description: 'Pattern description',
    example: 'Striped',
  })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiPropertyOptional({
    description: 'Unit of Measure ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  uomId?: number;

  @ApiPropertyOptional({
    description: 'Cost price (purchase price)',
    example: 12.50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({
    description: 'Selling price',
    example: 24.99,
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
    description: 'Additional notes',
    example: 'Special handling required',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Status',
    example: 'Active',
    enum: ['Active', 'Inactive'],
  })
  @IsOptional()
  @IsEnum(['Active', 'Inactive'])
  status?: string;
}
