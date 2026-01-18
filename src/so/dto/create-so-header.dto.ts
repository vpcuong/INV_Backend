import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDate,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SOAddressesDto, SOMetadataDto } from './composed/so-composed.dto';
import { CreateSOLineDto } from './composed/create-so-line.dto';

export class CreateSOHeaderDto {
  // @ApiProperty({
  //   description: 'Sales Order Number (auto-generated if not provided)',
  //   example: 'SO-2024-001',
  //   required: false,
  // })
  // @IsOptional()
  // @IsString()
  // soNum?: string;

  @ApiProperty({
    description: 'Customer ID',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  customerId!: number;

  @ApiProperty({
    description: 'Order date',
    example: '2024-12-15T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  orderDate?: Date;

  @ApiProperty({
    description: 'Request date',
    example: '2024-12-20T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  requestDate?: Date;

  @ApiProperty({
    description: 'Need by date',
    example: '2024-12-25T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  needByDate?: Date;

  // @ApiProperty({
  //   description: 'Order status',
  //   example: 'OPEN',
  //   required: false,
  // })
  // @IsOptional()
  // @IsString()
  // orderStatus?: string;

  @ValidateNested()
  @Type(() => SOAddressesDto)
  @IsOptional()
  addresses?: SOAddressesDto;

  @ValidateNested()
  @Type(() => SOMetadataDto)
  @IsOptional()
  metadata?: SOMetadataDto;

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

  // @ApiProperty({
  //   description: 'Header discount amount',
  //   example: 50.0,
  //   required: false,
  // })
  // @IsOptional()
  // @IsNumber()
  // @Min(0)
  // headerDiscountAmount?: number;

  // @ApiProperty({
  //   description: 'Total line amount',
  //   example: 1000.0,
  //   required: false,
  // })
  // @IsOptional()
  // @IsNumber()
  // @Min(0)
  // totalLineAmount?: number;

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
    example: 'Special handling required',
    required: false,
  })
  @IsOptional()
  @IsString()
  headerNote?: string;

  @ApiProperty({
    description: 'Internal note',
    example: 'VIP customer',
    required: false,
  })
  @IsOptional()
  @IsString()
  internalNote?: string;

  @ApiProperty({
    description: 'Created by user',
    example: 'admin',
  })
  @IsString()
  createdBy!: string;

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

  // @ApiProperty({
  //   description: 'Exchange rate',
  //   example: 1.0,
  //   required: false,
  // })
  // @IsOptional()
  // @IsNumber()
  // @Min(0)
  // exchangeRate?: number;

  @ApiProperty({
    description: 'Customer PO number',
    example: 'PO-12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  customerPoNum?: string;

  @ApiProperty({
    description: 'Header discount percent',
    example: 5.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  headerDiscountPercent?: number;

  // @ApiProperty({
  //   description: 'Total discount',
  //   example: 50.0,
  //   required: false,
  // })
  // @IsOptional()
  // @IsNumber()
  // @Min(0)
  // totalDiscount?: number;

  // @ApiProperty({
  //   description: 'Total tax',
  //   example: 100.0,
  //   required: false,
  // })
  // @IsOptional()
  // @IsNumber()
  // @Min(0)
  // totalTax?: number;

  // @ApiProperty({
  //   description: 'Total charges',
  //   example: 25.0,
  //   required: false,
  // })
  // @IsOptional()
  // @IsNumber()
  // @Min(0)
  // totalCharges?: number;

  // @ApiProperty({
  //   description: 'Order total',
  //   example: 1075.0,
  //   required: false,
  // })
  // @IsOptional()
  // @IsNumber()
  // @Min(0)
  // orderTotal?: number;

  // @ApiProperty({
  //   description: 'Open amount',
  //   example: 1075.0,
  //   required: false,
  // })
  // @IsOptional()
  // @IsNumber()
  // @Min(0)
  // openAmount?: number;
}
