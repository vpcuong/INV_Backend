import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePOLineDto {
  @ApiProperty({
    description: 'Line number',
    example: 1,
  })
  @IsNumber()
  lineNum!: number;

  @ApiProperty({
    description: 'SKU ID',
    example: 25,
  })
  @IsNumber()
  skuId!: number;

  @ApiProperty({
    description: 'Item description',
    example: 'Classic T-Shirt - Green, Unisex, Medium',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Unit of Measure code',
    example: 'PCS',
  })
  @IsString()
  uomCode!: string;

  @ApiProperty({
    description: 'Order quantity',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  orderQty!: number;

  @ApiProperty({
    description: 'Unit price',
    example: 25.99,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice!: number;

  @ApiProperty({
    description: 'Line amount (orderQty * unitPrice)',
    example: 2599.0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lineAmount!: number;

  @ApiProperty({
    description: 'Received quantity',
    example: 0,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  receivedQty?: number;

  @ApiProperty({
    description: 'Warehouse code',
    example: 'WH01',
    required: false,
  })
  @IsOptional()
  @IsString()
  warehouseCode?: string;

  @ApiProperty({
    description: 'Line status',
    example: 'OPEN',
    enum: ['OPEN', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
    required: false,
    default: 'OPEN',
  })
  @IsOptional()
  @IsEnum(['OPEN', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'])
  status?: string;

  @ApiProperty({
    description: 'Line note',
    example: 'Quality check required',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'Created by username',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
