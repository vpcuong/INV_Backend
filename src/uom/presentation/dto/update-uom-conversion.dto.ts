import { IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUomConversionDto {
  @ApiProperty({
    description: 'Conversion factor to base UOM',
    example: 12,
    minimum: 0,
  })
  @IsNumber()
  @Min(0.0001)
  toBaseFactor!: number;
}

export class ConvertUomDto {
  @ApiProperty({
    description: 'Value to convert',
    example: 10,
  })
  @IsNumber()
  value!: number;

  @ApiProperty({
    description: 'Source UOM code',
    example: 'DZ',
  })
  fromUomCode!: string;

  @ApiProperty({
    description: 'Target UOM code',
    example: 'PC',
  })
  toUomCode!: string;
}