import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateMaterialDto {
  @ApiProperty({
    description: 'Material code (unique)',
    example: 'COTTON',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  code!: string;

  @ApiProperty({
    description: 'Material description',
    example: 'Cotton fabric 100%',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  desc!: string;

  @ApiProperty({
    description: 'Active status',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  status?: boolean;

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
