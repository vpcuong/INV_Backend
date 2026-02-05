import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryDto {
  @ApiProperty({
    description: 'SKU public ID',
    example: '01HQ8GHJK...',
  })
  @IsString()
  skuPublicId!: string;

  @ApiProperty({
    description: 'Initial quantity',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  quantity!: number;
}

export class UpdateInventoryDto {
  @ApiPropertyOptional({
    description: 'New quantity (absolute value)',
    example: 150,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;
}

export class AdjustInventoryDto {
  @ApiProperty({
    description: 'Quantity adjustment (positive to add, negative to subtract)',
    example: 10,
  })
  @IsNumber()
  adjustment!: number;
}

export class ReserveInventoryDto {
  @ApiProperty({
    description: 'Quantity to reserve',
    example: 5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  quantity!: number;
}

export class ReleaseReservationDto {
  @ApiProperty({
    description: 'Quantity to release from reservation',
    example: 5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  quantity!: number;
}

export class InventoryResponseDto {
  @ApiProperty({ description: 'Warehouse public ID' })
  warehousePublicId!: string;

  @ApiProperty({ description: 'Warehouse code' })
  warehouseCode!: string;

  @ApiProperty({ description: 'Warehouse name' })
  warehouseName!: string;

  @ApiProperty({ description: 'SKU public ID' })
  skuPublicId!: string;

  @ApiProperty({ description: 'SKU code' })
  skuCode!: string;

  @ApiProperty({ description: 'Total quantity on hand' })
  quantity!: number;

  @ApiProperty({ description: 'Reserved quantity' })
  reservedQty!: number;

  @ApiProperty({ description: 'Available quantity (quantity - reservedQty)' })
  availableQty!: number;
}
