import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateItemModelDto {
  @ApiPropertyOptional({
    description: 'Model code (cannot be changed for data integrity)',
    example: 'MODEL001',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Summer 2024 Collection',
  })
  @IsOptional()
  @IsString()
  desc?: string;

  @ApiPropertyOptional({
    description: 'Status',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;
}
