import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsBoolean,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSkuUomDto {
  @ApiPropertyOptional({
    description: 'Conversion factor to base UOM',
    example: 12,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  toBaseFactor?: number;

  @ApiPropertyOptional({
    description: 'Rounding precision (decimal places)',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
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
    example: false,
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
    description: 'Description of the UOM conversion',
    example: '1 DOZEN = 12 PCS',
  })
  @IsOptional()
  @IsString()
  desc?: string;
}
