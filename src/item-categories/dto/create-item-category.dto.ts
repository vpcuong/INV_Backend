import { IsString, IsOptional, MaxLength, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  description?: string;

  @ApiPropertyOptional({ description: 'Category is outsourced' })
  @IsOptional()
  @IsBoolean()
  isOutsourced?: boolean;

  @ApiPropertyOptional({ description: 'Category is finished good' })
  @IsOptional()
  @IsBoolean()
  isFinishedGood?: boolean;

  @ApiPropertyOptional({ description: 'Category is fabric' })
  @IsOptional()
  @IsBoolean()
  isFabric?: boolean;
}
