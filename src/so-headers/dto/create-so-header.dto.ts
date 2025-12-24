import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSOLineDto } from './create-so-line.dto';

export class CreateSOHeaderDto {
  @ApiProperty({
    description: 'Sales Order Number (auto-generated if not provided)',
    example: 'SO-2024-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  soNum?: string;

  @ApiProperty({
    description: 'Customer ID',
    example: 1,
  })
  @IsNumber()
  customerId!: number;

  @ApiProperty({
    description: 'Customer PO Number',
    example: 'PO-CUST-12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  customerPoNum?: string;

  @ApiProperty({
    description: 'Order date',
    example: '2024-12-15T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  orderDate?: Date;

  @ApiProperty({
    description: 'Request date',
    example: '2024-12-20T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  requestDate?: Date;

  @ApiProperty({
    description: 'Need by date',
    example: '2024-12-31T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  needByDate?: Date;

  @ApiProperty({
    description: 'Order status',
    example: 'OPEN',
    enum: ['DRAFT', 'OPEN', 'PARTIAL', 'CLOSED', 'CANCELLED', 'ON_HOLD'],
    required: false,
    default: 'OPEN',
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'OPEN', 'PARTIAL', 'CLOSED', 'CANCELLED', 'ON_HOLD'])
  orderStatus?: string;

  @ApiProperty({
    description: 'Sales channel',
    example: 'ONLINE',
    required: false,
  })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiProperty({
    description: 'FOB code',
    example: 'FOB_ORIGIN',
    required: false,
  })
  @IsOptional()
  @IsString()
  fobCode?: string;

  @ApiProperty({
    description: 'Ship via code',
    example: 'FEDEX',
    required: false,
  })
  @IsOptional()
  @IsString()
  shipViaCode?: string;

  @ApiProperty({
    description: 'Payment term code',
    example: 'NET30',
    enum: ['COD', 'PREPAID', 'NET7', 'NET15', 'NET30', 'NET45', 'NET60', 'NET90', 'EOM', 'CUSTOM'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['COD', 'PREPAID', 'NET7', 'NET15', 'NET30', 'NET45', 'NET60', 'NET90', 'EOM', 'CUSTOM'])
  paymentTermCode?: string;

  @ApiProperty({
    description: 'Currency code',
    example: 'VND',
    default: 'VND',
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
    description: 'Header discount percent',
    example: 5.00,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  headerDiscountPercent?: number;

  @ApiProperty({
    description: 'Header discount amount',
    example: 100.00,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  headerDiscountAmount?: number;

  @ApiProperty({
    description: 'Total line amount',
    example: 2599.00,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalLineAmount!: number;

  @ApiProperty({
    description: 'Total discount',
    example: 100.00,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalDiscount?: number;

  @ApiProperty({
    description: 'Total tax',
    example: 246.91,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalTax?: number;

  @ApiProperty({
    description: 'Total charges (shipping, handling, etc.)',
    example: 50.00,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalCharges?: number;

  @ApiProperty({
    description: 'Order total',
    example: 2795.91,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  orderTotal!: number;

  @ApiProperty({
    description: 'Open amount (remaining to be fulfilled)',
    example: 2795.91,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  openAmount!: number;

  @ApiProperty({
    description: 'Billing address ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  billingAddressId?: number;

  @ApiProperty({
    description: 'Shipping address ID',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  shippingAddressId?: number;

  @ApiProperty({
    description: 'Header note',
    example: 'Important customer - priority order',
    required: false,
  })
  @IsOptional()
  @IsString()
  headerNote?: string;

  @ApiProperty({
    description: 'Internal note (not visible to customer)',
    example: 'Check inventory before confirming',
    required: false,
  })
  @IsOptional()
  @IsString()
  internalNote?: string;

  @ApiProperty({
    description: 'Created by username',
    example: 'admin',
  })
  @IsString()
  createdBy!: string;

  @ApiProperty({
    description: 'Order lines',
    type: [CreateSOLineDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSOLineDto)
  lines?: CreateSOLineDto[];
}