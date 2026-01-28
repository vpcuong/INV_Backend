import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';

export class CreateSkuDto {
  @ApiProperty({
    description: 'SKU code (unique)',
    example: 'SKU001',
  })
  @IsString()
  skuCode!: string;

  @ApiProperty({
    description: 'Color ID',
    example: 1,
  })
  @IsNumber()
  colorId!: number;

  @ApiProperty({
    description: 'Gender ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  genderId?: number;

  @ApiProperty({
    description: 'Size ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sizeId?: number;

  @ApiProperty({
    description: 'Supplier ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  supplierId?: number;

  @ApiProperty({
    description: 'Customer ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiProperty({
    description: 'Fabric SKU ID (for fabric items)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  fabricSKUId?: number;

  @ApiProperty({
    description: 'Pattern',
    example: 'Striped',
    required: false,
  })
  @IsOptional()
  @IsString()
  pattern?: string;

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
    description: 'Description',
    example: 'Premium SKU variant',
    required: false,
  })
  @IsOptional()
  @IsString()
  desc?: string;

  @ApiProperty({
    description: 'SKU status',
    example: 'active',
    enum: ['active', 'inactive', 'draft'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'draft'])
  status?: string;

  @ApiProperty({
    description: 'Cost price',
    example: 15.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiProperty({
    description: 'Selling price',
    example: 25.99,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @ApiProperty({
    description: 'Unit of Measure code',
    example: 'PCS',
    required: false,
  })
  @IsOptional()
  @IsString()
  uomCode?: string;
}