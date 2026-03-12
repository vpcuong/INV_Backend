import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePOLineDto {
  @ApiProperty({
    description: 'SKU public ID (ULID)',
    example: '01HXK5Z3ABCDEFGHJKLMNPQRST',
  })
  @IsString()
  skuPublicId!: string;

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
    description: 'SO Line publicId to map (for SUBCONTRACT PO)',
    required: false,
  })
  @IsOptional()
  @IsString()
  soLinePublicId?: string;

  @ApiProperty({
    description: 'Line note',
    example: 'Quality check required',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}
