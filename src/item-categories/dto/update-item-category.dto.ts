import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductCategoryDto {
  @ApiPropertyOptional({
    description: 'Category description',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  desc?: string;

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
