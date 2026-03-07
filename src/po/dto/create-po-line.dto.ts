import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePOLineDto {
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
    description: 'Warehouse code',
    example: 'WH01',
    required: false,
  })
  @IsOptional()
  @IsString()
  warehouseCode?: string;

  @ApiProperty({
    description: 'Line note',
    example: 'Quality check required',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}
