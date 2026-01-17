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
  @Min(1)
  customerId!: number;

  @ApiProperty({
    description: 'Order date',
    example: '2024-12-15T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  orderDate?: Date;

  @ApiProperty({
    description: 'Request date',
    example: '2024-12-20T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  requestDate?: Date;

  @ApiProperty({
    description: 'Need by date',
    example: '2024-12-25T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  needByDate?: Date;

  @ApiProperty({
    description: 'Order status',
    example: 'OPEN',
    required: false,
  })
  @IsOptional()
  @IsString()
  orderStatus?: string;

  @ApiProperty({
    description: 'Header discount amount',
    example: 50.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  headerDiscountAmount?: number;

  @ApiProperty({
    description: 'Header discount percent',
    example: 5.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  headerDiscountPercent?: number;

  @ApiProperty({
    description: 'Total line amount (calculated from lines)',
    example: 1000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalLineAmount?: number;

  @ApiProperty({
    description: 'Total discount (calculated)',
    example: 50.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalDiscount?: number;

  @ApiProperty({
    description: 'Total tax (calculated)',
    example: 100.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalTax?: number;

  @ApiProperty({
    description: 'Total charges',
    example: 25.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCharges?: number;

  @ApiProperty({
    description: 'Order total (calculated)',
    example: 1075.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  orderTotal?: number;

  @ApiProperty({
    description: 'Open amount',
    example: 1075.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  openAmount?: number;

  @ApiProperty({
    description: 'Addresses information (billing and shipping)',
    type: SOAddressesDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => SOAddressesDto)
  @IsOptional()
  addresses?: SOAddressesDto;

  @ApiProperty({
    description: 'Metadata (channel, FOB, shipping, payment, etc.)',
    type: SOMetadataDto,
    required: false,
  })
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

  @ApiProperty({
    description: 'Created by user',
    example: 'admin',
  })
  @IsString()
  createdBy!: string;
}
