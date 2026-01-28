import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

export class UpdateUomDto {
  @ApiPropertyOptional({
    description: 'Conversion factor to base UOM',
    example: 12,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  toBaseFactor?: number;

  @ApiPropertyOptional({
    description: 'Rounding precision for calculations',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  roundingPrecision?: number;

  @ApiPropertyOptional({
    description: 'Is default transaction UOM',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefaultTransUom?: boolean;

  @ApiPropertyOptional({
    description: 'Is purchasing UOM',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPurchasingUom?: boolean;

  @ApiPropertyOptional({
    description: 'Is sales UOM',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isSalesUom?: boolean;

  @ApiPropertyOptional({
    description: 'Is manufacturing UOM',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isManufacturingUom?: boolean;

  @ApiPropertyOptional({
    description: 'Is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Updated box description',
  })
  @IsOptional()
  @IsString()
  desc?: string;
}