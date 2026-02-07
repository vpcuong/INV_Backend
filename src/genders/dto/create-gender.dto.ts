import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGenderDto {
  @ApiProperty({
    description: 'Gender code (unique)',
    example: 'M',
    maxLength: 10,
  })
  @IsString()
  @MaxLength(10)
  code!: string;

  @ApiProperty({
    description: 'Gender description',
    example: 'Male',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  desc!: string;

  @ApiProperty({
    description: 'Sort order',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sortOrder?: number;

}
