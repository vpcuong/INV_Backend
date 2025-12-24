import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, Min } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({
    description: 'Item name',
    example: 'Classic T-Shirt',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Item category ID',
    example: 1,
  })
  @IsNumber()
  categoryId!: number;

  @ApiProperty({
    description: 'Item type ID',
    example: 1,
  })
  @IsNumber()
  itemTypeId!: number;

  @ApiProperty({
    description: 'Material ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  materialId?: number;

  @ApiProperty({
    description: 'Model/style code',
    example: 'CT-2024-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({
    description: 'Unit of Measure code',
    example: 'PCS',
    required: false,
  })
  @IsOptional()
  @IsString()
  uomCode?: string;

  @ApiProperty({
    description: 'Cost price (purchase price)',
    example: 15.50,
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
    example: 'Premium quality cotton',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Item status',
    example: 'Active',
    enum: ['Active', 'Inactive', 'Draft'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['Active', 'Inactive', 'Draft'])
  status?: string;

  @ApiProperty({
    description: 'Whether item has SKU variants',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  hasSku?: boolean;

  @ApiProperty({
    description: 'Whether item is purchasable',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPurchasable?: boolean;

  @ApiProperty({
    description: 'Whether item is sellable',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isSellable?: boolean;

  @ApiProperty({
    description: 'Whether item is manufactured',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isManufactured?: boolean;
}
