import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePOLineDto {
  @ApiPropertyOptional({
    description: 'Line number',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  lineNum?: number;

  @ApiPropertyOptional({
    description: 'SKU public ID (ULID)',
    example: '01HXK5Z3ABCDEFGHJKLMNPQRST',
  })
  @IsOptional()
  @IsString()
  skuPublicId?: string;

  @ApiPropertyOptional({
    description: 'Item description',
    example: 'Classic T-Shirt - Green, Unisex, Medium',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Unit of Measure code',
    example: 'PCS',
  })
  @IsOptional()
  @IsString()
  uomCode?: string;

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
    description: 'Unit price',
    example: 25.99,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice?: number;

  @ApiPropertyOptional({
    description: 'Received quantity',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  receivedQty?: number;

  @ApiPropertyOptional({
    description: 'Warehouse code',
    example: 'WH01',
  })
  @IsOptional()
  @IsString()
  warehouseCode?: string;

  @ApiPropertyOptional({
    description: 'Line status',
    example: 'PARTIALLY_RECEIVED',
    enum: ['OPEN', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
  })
  @IsOptional()
  @IsEnum(['OPEN', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Line note',
    example: 'Quality check required',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
