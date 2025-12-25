import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSOLineDto {
  @ApiProperty({
    description: 'Line number',
    example: 1,
  })
  @IsNumber()
  lineNum!: number;

  @ApiProperty({
    description: 'Item ID',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  itemId?: number;

  @ApiProperty({
    description: 'Item SKU ID (if ordering specific SKU)',
    example: 25,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  itemSkuId?: number;

  @ApiProperty({
    description: 'Item code (for display/backup)',
    example: 'TS-COT-GRE-UNI-M',
  })
  @IsString()
  itemCode!: string;

  @ApiProperty({
    description: 'Item description',
    example: 'Classic T-Shirt - Green, Unisex, Medium',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Order quantity',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  orderQty!: number;

  @ApiProperty({
    description: 'Unit of Measure code',
    example: 'PCS',
  })
  @IsString()
  uomCode!: string;

  @ApiProperty({
    description: 'Unit price',
    example: 25.99,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice!: number;

  @ApiProperty({
    description: 'Line discount percent',
    example: 5.00,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lineDiscountPercent?: number;

  @ApiProperty({
    description: 'Line discount amount',
    example: 129.95,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lineDiscountAmount?: number;

  @ApiProperty({
    description: 'Line tax percent',
    example: 10.00,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lineTaxPercent?: number;

  @ApiProperty({
    description: 'Line tax amount',
    example: 246.91,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lineTaxAmount?: number;

  @ApiProperty({
    description: 'Line total',
    example: 2599.00,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lineTotal!: number;

  @ApiProperty({
    description: 'Need by date',
    example: '2024-12-31T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  needByDate?: Date;

  @ApiProperty({
    description: 'Line status',
    example: 'OPEN',
    enum: ['OPEN', 'PARTIAL', 'CLOSED', 'CANCELLED', 'BACKORDERED'],
    required: false,
    default: 'OPEN',
  })
  @IsOptional()
  @IsEnum(['OPEN', 'PARTIAL', 'CLOSED', 'CANCELLED', 'BACKORDERED'])
  lineStatus?: string;

  @ApiProperty({
    description: 'Open quantity',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  openQty!: number;

  @ApiProperty({
    description: 'Shipped quantity',
    example: 0,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  shippedQty?: number;

  @ApiProperty({
    description: 'Warehouse code',
    example: 'WH01',
    required: false,
  })
  @IsOptional()
  @IsString()
  warehouseCode?: string;

  @ApiProperty({
    description: 'Line note',
    example: 'Rush order',
    required: false,
  })
  @IsOptional()
  @IsString()
  lineNote?: string;
}