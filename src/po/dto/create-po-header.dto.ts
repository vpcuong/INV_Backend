import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePOLineDto } from './create-po-line.dto';

export class CreatePOHeaderDto {
  @ApiProperty({
    description: 'Purchase Order Number (auto-generated if not provided)',
    example: 'PO-2024-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  poNum?: string;

  @ApiProperty({
    description: 'Supplier ID',
    example: 1,
  })
  @IsNumber()
  supplierId!: number;

  @ApiProperty({
    description: 'Order date',
    example: '2024-12-15T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  orderDate?: Date;

  @ApiProperty({
    description: 'Expected delivery date',
    example: '2024-12-31T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expectedDate?: Date;

  @ApiProperty({
    description: 'PO status',
    example: 'DRAFT',
    enum: [
      'DRAFT',
      'APPROVED',
      'PARTIALLY_RECEIVED',
      'RECEIVED',
      'CLOSED',
      'CANCELLED',
    ],
    required: false,
    default: 'DRAFT',
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

  @ApiProperty({
    description: 'Currency code (ISO 3-letter code)',
    example: 'USD',
    default: 'USD',
  })
  @IsString()
  currencyCode!: string;

  @ApiProperty({
    description: 'Exchange rate',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  exchangeRate?: number;

  @ApiProperty({
    description: 'Total amount',
    example: 5000.0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalAmount!: number;

  @ApiProperty({
    description: 'Note',
    example: 'Urgent order - expedite shipping',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'PO lines',
    type: [CreatePOLineDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePOLineDto)
  lines?: CreatePOLineDto[];
}
