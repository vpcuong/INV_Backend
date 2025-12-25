import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSOLineDto {
  @ApiPropertyOptional({
    description: 'Item ID',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  itemId?: number;

  @ApiPropertyOptional({
    description: 'Item SKU ID',
    example: 25,
  })
  @IsOptional()
  @IsNumber()
  itemSkuId?: number;

  @ApiPropertyOptional({
    description: 'Item code',
    example: 'TS-COT-GRE-UNI-M',
  })
  @IsOptional()
  @IsString()
  itemCode?: string;

  @ApiPropertyOptional({
    description: 'Item description',
    example: 'Classic T-Shirt - Green, Unisex, Medium',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Order quantity',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  orderQty?: number;

  @ApiPropertyOptional({
    description: 'Unit of Measure code',
    example: 'PCS',
  })
  @IsOptional()
  @IsString()
  uomCode?: string;

  @ApiPropertyOptional({
    description: 'Unit of Measure ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  uomId?: number;

  @ApiPropertyOptional({
    description: 'Unit price',
    example: 25.99,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice?: number;

  @ApiPropertyOptional({
    description: 'Line discount percent',
    example: 5.00,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lineDiscountPercent?: number;

  @ApiPropertyOptional({
    description: 'Line discount amount',
    example: 129.95,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lineDiscountAmount?: number;

  @ApiPropertyOptional({
    description: 'Line tax percent',
    example: 10.00,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lineTaxPercent?: number;

  @ApiPropertyOptional({
    description: 'Line tax amount',
    example: 246.91,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lineTaxAmount?: number;

  @ApiPropertyOptional({
    description: 'Line total',
    example: 2599.00,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lineTotal?: number;

  @ApiPropertyOptional({
    description: 'Need by date',
    example: '2024-12-31T00:00:00.000Z',
  })
  @IsOptional()
  needByDate?: Date;

  @ApiPropertyOptional({
    description: 'Line status',
    example: 'OPEN',
    enum: ['OPEN', 'PARTIAL', 'CLOSED', 'CANCELLED', 'BACKORDERED'],
  })
  @IsOptional()
  @IsEnum(['OPEN', 'PARTIAL', 'CLOSED', 'CANCELLED', 'BACKORDERED'])
  lineStatus?: string;

  @ApiPropertyOptional({
    description: 'Open quantity',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  openQty?: number;

  @ApiPropertyOptional({
    description: 'Shipped quantity',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  shippedQty?: number;

  @ApiPropertyOptional({
    description: 'Warehouse code',
    example: 'WH01',
  })
  @IsOptional()
  @IsString()
  warehouseCode?: string;

  @ApiPropertyOptional({
    description: 'Line note',
    example: 'Rush order',
  })
  @IsOptional()
  @IsString()
  lineNote?: string;
}