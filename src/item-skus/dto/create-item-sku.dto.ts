import { ApiProperty } from '@nestjs/swagger';

export class CreateItemSkuDto {
  @ApiProperty({
    description: 'SKU code (auto-generated if not provided)',
    example: 'GRE-UNI-M',
    required: false,
  })
  skuCode?: string;

  @ApiProperty({
    description: 'Item revision ID',
    example: 1,
  })
  revisionId!: number;

  @ApiProperty({
    description: 'Color ID',
    example: 1,
  })
  colorId!: number;

  @ApiProperty({
    description: 'Gender ID',
    example: 2,
  })
  genderId!: number;

  @ApiProperty({
    description: 'Size ID',
    example: 3,
  })
  sizeId!: number;

  @ApiProperty({
    description: 'Pattern description',
    example: 'Striped',
    required: false,
  })
  pattern?: string;

  @ApiProperty({
    description: 'Cost price (purchase price)',
    example: 12.50,
    required: false,
    default: 0,
  })
  costPrice?: number;

  @ApiProperty({
    description: 'Selling price',
    example: 24.99,
    required: false,
    default: 0,
  })
  sellingPrice?: number;

  @ApiProperty({
    description: 'Length in centimeters',
    example: 50.5,
    required: false,
  })
  lengthCm?: number;

  @ApiProperty({
    description: 'Width in centimeters',
    example: 30.0,
    required: false,
  })
  widthCm?: number;

  @ApiProperty({
    description: 'Height in centimeters',
    example: 2.5,
    required: false,
  })
  heightCm?: number;

  @ApiProperty({
    description: 'Weight in grams',
    example: 250.0,
    required: false,
  })
  weightG?: number;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Special handling required',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: 'Status',
    example: 'Active',
    enum: ['Active', 'Inactive'],
    required: false,
    default: 'Active',
  })
  status?: string;
}
