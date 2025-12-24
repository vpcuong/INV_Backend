import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUomDto {
  @ApiProperty({
    description: 'UOM code (unique)',
    example: 'M',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  code!: string;

  @ApiProperty({
    description: 'UOM name',
    example: 'Meter',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Standard unit for measuring length',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'UOM class code',
    example: 'LENGTH',
  })
  @IsString()
  classCode!: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}
