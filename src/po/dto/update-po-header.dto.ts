import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePOHeaderDto {
  @ApiPropertyOptional({
    description: 'Purchase Order Number',
    example: 'PO-2024-001',
  })
  @IsOptional()
  @IsString()
  poNum?: string;

  @ApiPropertyOptional({
    description: 'Supplier ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  supplierId?: number;

  @ApiPropertyOptional({
    description: 'Order date',
    example: '2024-12-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  orderDate?: Date;

  @ApiPropertyOptional({
    description: 'Expected delivery date',
    example: '2024-12-31T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expectedDate?: Date;

  @ApiPropertyOptional({
    description: 'PO status',
    example: 'APPROVED',
    enum: [
      'DRAFT',
      'APPROVED',
      'PARTIALLY_RECEIVED',
      'RECEIVED',
      'CLOSED',
      'CANCELLED',
    ],
  })
  @IsOptional()
  @IsEnum([
    'DRAFT',
    'APPROVED',
    'PARTIALLY_RECEIVED',
    'RECEIVED',
    'CLOSED',
    'CANCELLED',
  ])
  status?: string;

  @ApiPropertyOptional({
    description: 'Currency code (ISO 3-letter code)',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional({
    description: 'Exchange rate',
    example: 1.2,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  exchangeRate?: number;

  @ApiPropertyOptional({
    description: 'Total amount',
    example: 5000.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalAmount?: number;

  @ApiPropertyOptional({
    description: 'Note',
    example: 'Updated delivery instructions',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description: 'Created by user',
    example: 'admin@example.com',
  })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
