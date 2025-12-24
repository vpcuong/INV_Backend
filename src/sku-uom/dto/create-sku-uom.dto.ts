import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean, IsString, Min, IsNotEmpty } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateSkuUomDto {
  @ApiProperty({
    description: 'SKU ID',
    example: 10,
  })
  @IsNumber()
  @Type(() => Number)
  skuId!: number;

  @ApiProperty({
    description: 'UOM code',
    example: 'BOX',
  })
  @IsString({ message: 'uomCode must be a string' })
  @IsNotEmpty({ message: 'uomCode is required' })
  @Transform(({ value }) => value?.toString().trim())
  uomCode!: string;

  @ApiProperty({
    description: 'Conversion factor to base UOM (1 this UOM = toBaseFactor × base UOM)',
    example: 12,
    type: 'number',
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  toBaseFactor!: number;

  @ApiPropertyOptional({
    description: 'Rounding precision (decimal places)',
    example: 2,
    default: 2,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  roundingPrecision?: number;

  @ApiPropertyOptional({
    description: 'Is default transaction UOM',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefaultTransUom?: boolean;

  @ApiPropertyOptional({
    description: 'Is purchasing UOM',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPurchasingUom?: boolean;

  @ApiPropertyOptional({
    description: 'Is sales UOM',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSalesUom?: boolean;

  @ApiPropertyOptional({
    description: 'Is manufacturing UOM',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isManufacturingUom?: boolean;

  @ApiPropertyOptional({
    description: 'Is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Description of the UOM conversion',
    example: '1 DOZEN = 12 PCS',
    default: '',
  })
  @IsOptional()
  @IsString()
  desc?: string;
}