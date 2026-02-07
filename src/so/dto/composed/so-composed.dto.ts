import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SOAddressesDto {
  @ApiProperty({
    description: 'Billing address ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  billingAddressId?: number;

  @ApiProperty({
    description: 'Shipping address ID',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  shippingAddressId?: number;
}

export class SOMetadataDto {
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
    description: 'Shipping via code',
    example: 'UPS_GROUND',
    required: false,
  })
  @IsOptional()
  @IsString()
  shipViaCode?: string;

  @ApiProperty({
    description: 'Payment term code',
    example: 'NET_30',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentTermCode?: string;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
    required: false,
  })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiProperty({
    description: 'Exchange rate',
    example: 1.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  exchangeRate?: number;

  @ApiProperty({
    description: 'Customer PO number',
    required: false,
  })
  @IsOptional()
  @IsString()
  customerPoNum?: string;

  @ApiProperty({
    description: 'Header notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  headerNote?: string;

  @ApiProperty({
    description: 'Internal notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  internalNote?: string;
}
