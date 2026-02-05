import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class WarehouseFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by code (partial match)',
    example: 'WH',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Filter by name (partial match)',
    example: 'Main',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
