import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
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
    description: 'Order date',
    example: '2024-12-15T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  orderDate?: Date;

  @ApiPropertyOptional({
    description: 'Request date',
    example: '2024-12-20T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  requestDate?: Date;

  @ApiPropertyOptional({
    description: 'Need by date',
    example: '2024-12-31T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
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
    description: 'Header discount type',
    example: 'PERCENT',
    enum: ['PERCENT', 'AMOUNT'],
  })
  @IsOptional()
  @IsEnum(['PERCENT', 'AMOUNT'])
  discountType?: string;

  @ApiPropertyOptional({
    description: 'Header discount value',
    example: 5.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discountValue?: number;

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
