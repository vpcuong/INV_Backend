import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateUomClassDto {
  @ApiProperty({
    description: 'UOM class code (unique)',
    example: 'LENGTH',
    maxLength: 50,
  })
  @IsString()
  code!: string;

  @ApiProperty({
    description: 'UOM class name',
    example: 'Length Units',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Description',
    example: 'Units for measuring length/distance',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Base UOM code for this class',
    example: 'M',
    required: false,
  })
  @IsOptional()
  @IsString()
  baseUOMCode?: string;

  @ApiProperty({
    description: 'Sort order',
    example: 1,
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
