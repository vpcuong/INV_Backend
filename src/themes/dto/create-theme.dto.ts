import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNumber, IsOptional, ValidateIf } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateThemeDto {
  @ApiProperty({
    description: 'Theme code',
    example: '5060',
  })
  @IsString()
  code!: string

  @ApiProperty({
    description: 'description',
    example: 'Classic T-Shirt',
  })
  @IsString()
  desc?: string

  @ApiProperty({
    description: 'Supplier ID',
    example: 1,
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  supplierId!: number

  @ApiProperty({
    description: 'color code',
    example: 'RED',
  })
  @IsString()
  colorCode!: string

  @ApiProperty({
    description: 'price',
    example: 100,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  @IsNumber()
  price?: number

  @ApiProperty({
    description: 'UOM (required if price is provided)',
    example: 'KG',
    required: false
  })
  @ValidateIf((o) => o.price !== undefined && o.price !== null)
  @IsString()
  uom?: string
}