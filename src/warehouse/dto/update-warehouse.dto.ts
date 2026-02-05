import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWarehouseDto {
  @ApiPropertyOptional({
    description: 'Warehouse name',
    example: 'Main Warehouse Updated',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    description: 'Warehouse address',
    example: '456 Industrial Street, District 7',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string | null;

  @ApiPropertyOptional({
    description: 'Warehouse status',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  @IsOptional()
  @IsString()
  status?: string;
}
