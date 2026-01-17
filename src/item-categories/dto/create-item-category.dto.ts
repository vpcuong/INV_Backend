import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemCategoryType } from '../enums/item-category-type.enum';

export class CreateProductCategoryDto {
  @ApiProperty({
    description: 'Unique category code',
    maxLength: 10,
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  code!: string;

  @ApiPropertyOptional({
    description: 'Category description',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  desc?: string;

  @ApiPropertyOptional({
    description:
      'Category type: OUT (Outsourced), FIG (Finished Good), FAB (Fabric)',
    enum: ItemCategoryType,
  })
  @IsOptional()
  @IsEnum(ItemCategoryType)
  type?: ItemCategoryType;
}
