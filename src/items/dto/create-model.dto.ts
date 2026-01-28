import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateModelDto {
  @ApiProperty({
    description: 'Model code (unique)',
    example: 'MODEL001',
  })
  @IsString()
  code!: string;

  @ApiProperty({
    description: 'Model description',
    example: 'Premium model variant',
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

  @ApiProperty({
    description: 'Model status',
    example: 'active',
    enum: ['active', 'inactive', 'draft'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'draft'])
  status?: string;
}