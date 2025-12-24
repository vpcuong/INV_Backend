import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, Min } from 'class-validator';

export class UpdateItemDto {
  @ApiPropertyOptional({
    description: 'Item name',
    example: 'Classic T-Shirt',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Item category ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Item type ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  itemTypeId?: number;

  @ApiPropertyOptional({
    description: 'Material ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  materialId?: number;

  @ApiPropertyOptional({
    description: 'Model/style code',
    example: 'CT-2024-001',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Unit of Measure code',
    example: 'PCS',
  })
  @IsOptional()
  @IsString()
  uomCode?: string;

  @ApiPropertyOptional({
    description: 'Cost price (purchase price)',
    example: 15.50,
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
    example: 'Premium quality cotton',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Item status',
    example: 'Active',
    enum: ['Active', 'Inactive', 'Draft'],
  })
  @IsOptional()
  @IsEnum(['Active', 'Inactive', 'Draft'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Whether item has SKU variants',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  hasSku?: boolean;

  @ApiPropertyOptional({
    description: 'Whether item is purchasable',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPurchasable?: boolean;

  @ApiPropertyOptional({
    description: 'Whether item is sellable',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isSellable?: boolean;

  @ApiPropertyOptional({
    description: 'Whether item is manufactured',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isManufactured?: boolean;
}
