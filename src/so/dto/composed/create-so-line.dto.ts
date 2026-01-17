import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateNested,
  IsDate,
} from 'class-validator';

export class LinePricingDto {
  @ApiProperty({
    description: 'Line discount percentage (0-100)',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @ApiProperty({
    description: 'Line discount amount',
    example: 5.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiProperty({
    description: 'Line tax percentage (0-100)',
    example: 8.25,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxPercent?: number;

  @ApiProperty({
    description: 'Line tax amount',
    example: 2.07,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;
}

export class CreateSOLineDto {
  @ApiProperty({
    description: 'Line number (auto-generated if not provided)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  lineNum?: number;

  @ApiProperty({ description: 'Item ID', example: 123, required: false })
  @IsOptional()
  @IsNumber()
  itemId?: number;

  @ApiProperty({ description: 'Item SKU ID', example: 456, required: false })
  @IsOptional()
  @IsNumber()
  itemSkuId?: number;

  @ApiProperty({
    description: 'Item code (required for new items)',
    example: 'ITEM-001',
  })
  @IsString()
  itemCode: string;

  @ApiProperty({ description: 'Item description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Order quantity', example: 10 })
  @IsNumber()
  @IsPositive()
  orderQty: number;

  @ApiProperty({
    description: 'Unit of measure code',
    example: 'PCS',
    required: false,
  })
  @IsOptional()
  @IsString()
  uomCode?: string;

  @ApiProperty({ description: 'Unit price', example: 25.5 })
  @IsNumber()
  @IsPositive()
  unitPrice: number;

  @ValidateNested()
  @Type(() => LinePricingDto)
  @IsOptional()
  pricing?: LinePricingDto;

  @ApiProperty({
    description: 'Line total (calculated if not provided)',
    example: 255.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lineTotal?: number;

  @ApiProperty({ description: 'Need by date', required: false })
  @IsOptional()
  @IsDate()
  needByDate?: Date;

  @ApiProperty({ description: 'Line status', example: 'OPEN', required: false })
  @IsOptional()
  @IsString()
  lineStatus?: string;

  @ApiProperty({ description: 'Open quantity', example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  openQty?: number;

  @ApiProperty({ description: 'Shipped quantity', example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippedQty?: number;

  @ApiProperty({ description: 'Warehouse code', required: false })
  @IsOptional()
  @IsString()
  warehouseCode?: string;

  @ApiProperty({ description: 'Line notes', required: false })
  @IsOptional()
  @IsString()
  lineNote?: string;
}
