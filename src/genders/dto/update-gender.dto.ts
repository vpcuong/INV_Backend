import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateGenderDto {
  @ApiProperty({
    description: 'Gender code (unique)',
    example: 'M',
    maxLength: 10,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  code?: string;

  @ApiProperty({
    description: 'Gender description',
    example: 'Male',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  desc?: string;

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
