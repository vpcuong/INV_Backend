import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class CreateUomConversionDto {
  @ApiProperty({
    description: 'UOM Class Code',
    example: 'LENGTH',
  })
  @IsString()
  uomClassCode!: string;

  @ApiProperty({
    description: 'UOM Code',
    example: 'CM',
  })
  @IsString()
  uomCode!: string;

  @ApiProperty({
    description: 'Conversion factor to base UOM (e.g., 1 M = 100 CM, factor = 100)',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  toBaseFactor!: number;
}

