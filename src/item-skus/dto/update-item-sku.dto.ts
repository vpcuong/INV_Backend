import { ApiProperty } from '@nestjs/swagger';

export class UpdateItemSkuDto {
  @ApiProperty({
    description: 'SKU code',
    example: 'GRE-UNI-M',
    required: false,
  })
  skuCode?: string;

  @ApiProperty({
    description: 'Color ID',
    example: 1,
    required: false,
  })
  colorId?: number;

  @ApiProperty({
    description: 'Gender ID',
    example: 2,
    required: false,
  })
  genderId?: number;

  @ApiProperty({
    description: 'Size ID',
    example: 3,
    required: false,
  })
  sizeId?: number;

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
  })
  costPrice?: number;

  @ApiProperty({
    description: 'Selling price',
    example: 24.99,
    required: false,
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
  })
  status?: string;
}
