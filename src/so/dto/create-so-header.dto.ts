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

  @ApiProperty({
    description: 'Addresses',
    type: SOAddressesDto,
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => SOAddressesDto)
  @IsOptional()
  addresses?: SOAddressesDto;

  @ApiProperty({
    description: 'Metadata',
    type: SOMetadataDto,
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => SOMetadataDto)
  @IsOptional()
  metadata?: SOMetadataDto;

  @ApiProperty({
    description: 'Header discount percent',
    example: 5.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

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

