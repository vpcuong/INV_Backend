import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class UpdateModelDto {
  @ApiProperty({
    description: 'Model code (unique)',
    example: 'MODEL001',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Model description',
    example: 'Updated model description',
    required: false,
  })
  @IsOptional()
  @IsString()
  desc?: string;

  @ApiProperty({
    description: 'Customer ID associated with this model',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  customerId?: number;
}