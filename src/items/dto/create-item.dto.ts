import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({
    description: 'Item name',
    example: 'Classic T-Shirt',
  })
  name!: string;

  @ApiProperty({
    description: 'Item category ID',
    example: 1,
  })
  categoryId!: number;

  @ApiProperty({
    description: 'Item type ID',
    example: 1,
  })
  itemTypeId!: number;

  @ApiProperty({
    description: 'Material ID',
    example: 1,
    required: false,
  })
  materialId?: number;

  @ApiProperty({
    description: 'Model/style code',
    example: 'CT-2024-001',
    required: false,
  })
  model?: string;

  @ApiProperty({
    description: 'Unit of Measure ID',
    example: 1,
    required: false,
  })
  uomId?: number;

  @ApiProperty({
    description: 'Cost price (purchase price)',
    example: 15.50,
    required: false,
  })
  costPrice?: number;

  @ApiProperty({
    description: 'Selling price',
    example: 25.99,
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
    example: 'Premium quality cotton',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: 'Item status',
    example: 'Active',
    enum: ['Active', 'Inactive', 'Draft'],
    required: false,
  })
  status?: string;

  @ApiProperty({
    description: 'Whether item has SKU variants',
    example: true,
    default: false,
    required: false,
  })
  hasSku?: boolean;

  @ApiProperty({
    description: 'Whether item is purchasable',
    example: true,
    default: false,
    required: false,
  })
  isPurchasable?: boolean;

  @ApiProperty({
    description: 'Whether item is sellable',
    example: true,
    default: false,
    required: false,
  })
  isSellable?: boolean;

  @ApiProperty({
    description: 'Whether item is manufactured',
    example: false,
    default: false,
    required: false,
  })
  isManufactured?: boolean;
}
