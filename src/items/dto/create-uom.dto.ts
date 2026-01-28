import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateUomDto {
  @ApiProperty({
    description: 'Unit of Measure code',
    example: 'BOX',
  })
  @IsString()
  uomCode!: string;

  @ApiProperty({
    description: 'Conversion factor to base UOM',
    example: 12,
  })
  @IsNumber()
  @Min(0)
  toBaseFactor!: number;

  @ApiProperty({
    description: 'Rounding precision for calculations',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  roundingPrecision?: number;

  @ApiProperty({
    description: 'Is default transaction UOM',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefaultTransUom?: boolean;

  @ApiProperty({
    description: 'Is purchasing UOM',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPurchasingUom?: boolean;

  @ApiProperty({
    description: 'Is sales UOM',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isSalesUom?: boolean;

  @ApiProperty({
    description: 'Is manufacturing UOM',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isManufacturingUom?: boolean;

  @ApiProperty({
    description: 'Is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Description',
    example: 'Box of 12 pieces',
    required: false,
  })
  @IsOptional()
  @IsString()
  desc?: string;
}