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
  IsEnum,
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
  discountValue?: number;

  @ApiProperty({
    description: 'Line discount type',
    example: 'PERCENT',
    required: false,
  })
  @IsOptional()
  @IsEnum(['PERCENT', 'AMOUNT'])
  discountType?: string;

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

  @ApiProperty({ description: 'Item SKU ID', example: 'CFYEN9GPV25XWQNKXC8G554PSC' })
  @IsString()
  itemSkuId: string;

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

  @ApiProperty({
    description: 'pricing information',
    type: LinePricingDto,
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => LinePricingDto)
  @IsOptional()
  pricing?: LinePricingDto;

  @ApiProperty({ description: 'Need by date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  needByDate?: Date;

  @ApiProperty({ description: 'Warehouse code', required: false })
  @IsOptional()
  @IsString()
  warehouseCode?: string;

  @ApiProperty({ description: 'Line notes', required: false })
  @IsOptional()
  @IsString()
  lineNote?: string;
}
