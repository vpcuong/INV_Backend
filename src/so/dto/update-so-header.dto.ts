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

export class UpdateSOHeaderDto {
  @ApiPropertyOptional({
    description: 'Sales Order Number',
    example: 'SO-2024-001',
  })
  @IsOptional()
  @IsString()
  soNum?: string;

  @ApiPropertyOptional({
    description: 'Customer ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiPropertyOptional({
    description: 'Customer PO Number',
    example: 'PO-CUST-12345',
  })
  @IsOptional()
  @IsString()
  customerPoNum?: string;

  @ApiPropertyOptional({
    description: 'Order date',
    example: '2024-12-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  orderDate?: Date;

  @ApiPropertyOptional({
    description: 'Request date',
    example: '2024-12-20T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  requestDate?: Date;

  @ApiPropertyOptional({
    description: 'Need by date',
    example: '2024-12-31T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  needByDate?: Date;

  @ApiPropertyOptional({
    description: 'Order status',
    example: 'OPEN',
    enum: ['DRAFT', 'OPEN', 'PARTIAL', 'CLOSED', 'CANCELLED', 'ON_HOLD'],
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'OPEN', 'PARTIAL', 'CLOSED', 'CANCELLED', 'ON_HOLD'])
  orderStatus?: string;

  @ApiPropertyOptional({
    description: 'Sales channel',
    example: 'ONLINE',
  })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiPropertyOptional({
    description: 'FOB code',
    example: 'FOB_ORIGIN',
  })
  @IsOptional()
  @IsString()
  fobCode?: string;

  @ApiPropertyOptional({
    description: 'Ship via code',
    example: 'FEDEX',
  })
  @IsOptional()
  @IsString()
  shipViaCode?: string;

  @ApiPropertyOptional({
    description: 'Payment term code',
    example: 'NET30',
    enum: ['COD', 'PREPAID', 'NET7', 'NET15', 'NET30', 'NET45', 'NET60', 'NET90', 'EOM', 'CUSTOM'],
  })
  @IsOptional()
  @IsEnum(['COD', 'PREPAID', 'NET7', 'NET15', 'NET30', 'NET45', 'NET60', 'NET90', 'EOM', 'CUSTOM'])
  paymentTermCode?: string;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'VND',
  })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional({
    description: 'Exchange rate',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  exchangeRate?: number;

  @ApiPropertyOptional({
    description: 'Header discount percent',
    example: 5.00,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  headerDiscountPercent?: number;

  @ApiPropertyOptional({
    description: 'Header discount amount',
    example: 100.00,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  headerDiscountAmount?: number;

  @ApiPropertyOptional({
    description: 'Total line amount',
    example: 2599.00,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalLineAmount?: number;

  @ApiPropertyOptional({
    description: 'Total discount',
    example: 100.00,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalDiscount?: number;

  @ApiPropertyOptional({
    description: 'Total tax',
    example: 246.91,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalTax?: number;

  @ApiPropertyOptional({
    description: 'Total charges',
    example: 50.00,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalCharges?: number;

  @ApiPropertyOptional({
    description: 'Order total',
    example: 2795.91,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  orderTotal?: number;

  @ApiPropertyOptional({
    description: 'Open amount',
    example: 2795.91,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  openAmount?: number;

  @ApiPropertyOptional({
    description: 'Billing address ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  billingAddressId?: number;

  @ApiPropertyOptional({
    description: 'Shipping address ID',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  shippingAddressId?: number;

  @ApiPropertyOptional({
    description: 'Header note',
    example: 'Important customer - priority order',
  })
  @IsOptional()
  @IsString()
  headerNote?: string;

  @ApiPropertyOptional({
    description: 'Internal note',
    example: 'Check inventory before confirming',
  })
  @IsOptional()
  @IsString()
  internalNote?: string;

  @ApiPropertyOptional({
    description: 'Created by user',
    example: 'admin@example.com',
  })
  @IsOptional()
  @IsString()
  createdBy?: string;
}