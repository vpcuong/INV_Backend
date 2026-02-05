import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateSkuDto {
   @ApiPropertyOptional({
    description: 'SKU code (unique)',
    example: 'SKU001',
  })
  @IsOptional()
  @IsString()
  skuCode?: string;

  @ApiPropertyOptional({
    description: 'Color ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  colorId?: number;

  @ApiPropertyOptional({
    description: 'Gender ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  genderId?: number;

  @ApiPropertyOptional({
    description: 'Size ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  sizeId?: number;

  @ApiPropertyOptional({
    description: 'Supplier ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  supplierId?: number;

  @ApiPropertyOptional({
    description: 'Customer ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiPropertyOptional({
    description: 'Fabric SKU ID (for fabric items)',
    example: 1,
  })
  @IsOptional()
  // @IsNumber()
  fabricSKUId?: string;

  @ApiPropertyOptional({
    description: 'Pattern',
    example: 'Striped',
  })
  @IsOptional()
  @IsString()
  pattern?: string;

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
    example: 'Updated SKU description',
  })
  @IsOptional()
  @IsString()
  desc?: string;


  @ApiPropertyOptional({
    description: 'Cost price',
    example: 15.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({
    description: 'Selling price',
    example: 25.99,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @ApiPropertyOptional({
    description: 'Unit of Measure code',
    example: 'PCS',
  })
  @IsOptional()
  @IsString()
  uomCode?: string;
}