import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSizeDto {
  @ApiProperty({
    description: 'Size code (unique)',
    example: 'XL',
    maxLength: 10,
  })
  @IsString()
  @MaxLength(10)
  code!: string;

  @ApiProperty({
    description: 'Size description',
    example: 'Extra Large',
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

  @ApiProperty({
    description: 'Created by user',
    example: 'admin',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  createdBy?: string;
}
