import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SOAddressesDto, SOMetadataDto } from './composed/so-composed.dto';

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
    description: 'Header discount percent',
    example: 5.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  headerDiscountPercent?: number;

  @ApiPropertyOptional({
    description: 'Header discount amount',
    example: 100.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  headerDiscountAmount?: number;

  @ApiPropertyOptional({
    description: 'Total line amount (calculated)',
    example: 2599.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalLineAmount?: number;

  @ApiPropertyOptional({
    description: 'Total discount (calculated)',
    example: 100.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalDiscount?: number;

  @ApiPropertyOptional({
    description: 'Total tax (calculated)',
    example: 246.91,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalTax?: number;

  @ApiPropertyOptional({
    description: 'Total charges',
    example: 50.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalCharges?: number;

  @ApiPropertyOptional({
    description: 'Order total (calculated)',
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
    description: 'Addresses information (billing and shipping)',
    type: SOAddressesDto,
  })
  @ValidateNested()
  @Type(() => SOAddressesDto)
  @IsOptional()
  addresses?: SOAddressesDto;

  @ApiPropertyOptional({
    description: 'Metadata (channel, FOB, shipping, payment, notes, etc.)',
    type: SOMetadataDto,
  })
  @ValidateNested()
  @Type(() => SOMetadataDto)
  @IsOptional()
  metadata?: SOMetadataDto;
}
