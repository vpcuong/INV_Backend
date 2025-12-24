import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export class CreateItemSkuDto {
  @ApiProperty({
    description: 'SKU code (auto-generated if not provided)',
    example: 'GRE-UNI-M',
    required: false,
  })
  @IsOptional()
  @IsString()
  skuCode?: string;

  @ApiProperty({
    description: 'UOM code',
    example: 'EA',
  })
  @IsOptional()
  @IsString()
  uomCode?: string;

  @ApiProperty({
    description: 'Item revision ID',
    example: 1,
  })
  @IsNumber()
  revisionId!: number;

  @ApiProperty({
    description: 'Color ID',
    example: 1,
  })
  @IsNumber()
  colorId!: number;

  @ApiProperty({
    description: 'Gender ID',
    example: 2,
  })
  @IsNumber()
  genderId!: number;

  @ApiProperty({
    description: 'Size ID',
    example: 3,
  })
  @IsNumber()
  sizeId!: number;

  @ApiProperty({
    description: 'Pattern description',
    example: 'Striped',
    required: false,
  })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiProperty({
    description: 'Cost price (purchase price)',
    example: 12.50,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiProperty({
    description: 'Selling price',
    example: 24.99,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @ApiProperty({
    description: 'Length in centimeters',
    example: 50.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lengthCm?: number;

  @ApiProperty({
    description: 'Width in centimeters',
    example: 30.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  widthCm?: number;

  @ApiProperty({
    description: 'Height in centimeters',
    example: 2.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @ApiProperty({
    description: 'Weight in grams',
    example: 250.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  weightG?: number;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Special handling required',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Status',
    example: 'Active',
    enum: ['Active', 'Inactive'],
    required: false,
    default: 'Active',
  })
  @IsOptional()
  @IsEnum(['Active', 'Inactive'])
  status?: string;
}
