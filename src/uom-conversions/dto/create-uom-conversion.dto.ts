import { ApiProperty } from '@nestjs/swagger';

export class CreateUomConversionDto {
  @ApiProperty({
    description: 'From UOM ID',
    example: 1,
  })
  fromUOMId!: number;

  @ApiProperty({
    description: 'To UOM ID',
    example: 2,
  })
  toUOMId!: number;

  @ApiProperty({
    description: 'Conversion factor (e.g., 1 M = 100 CM, factor = 100)',
    example: 100,
  })
  factor!: number;
}
