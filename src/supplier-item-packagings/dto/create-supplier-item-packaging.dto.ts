import { IsInt, IsOptional, Min, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierItemPackagingDto {
  @ApiProperty({
    description: 'Supplier item ID',
    example: 1,
  })
  @IsInt()
  supplierItemId!: number;

  @ApiProperty({
    description: 'Packaging level (1 = smallest, 2 = larger, 3 = largest...)',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  level!: number;

  @ApiProperty({
    description: 'UOM code for this packaging level',
    example: 'BOX',
  })
  @IsString()
  uomCode!: string;

  @ApiProperty({
    description:
      'Quantity of previous level in this packaging level. For level 1, this is qty of base units (EA)',
    example: 100,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  qtyPerPrevLevel!: number;

  @ApiPropertyOptional({
    description:
      'Pre-calculated total quantity to base unit. If null, will be calculated at runtime',
    example: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  qtyToBase?: number;
}
