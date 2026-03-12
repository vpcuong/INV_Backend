import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindPOsDto {
  @ApiPropertyOptional({ description: 'Offset for pagination', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  skip?: number;

  @ApiPropertyOptional({ description: 'Limit for pagination', example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  take?: number;

  @ApiPropertyOptional({ description: 'Filter by supplier ID', example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  supplierId?: number;

  @ApiPropertyOptional({
    description: 'Filter by PO status',
    example: 'DRAFT',
    enum: ['DRAFT', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED', 'CANCELLED'],
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by PO type',
    example: 'SUBCONTRACT',
    enum: ['STANDARD', 'SUBCONTRACT'],
  })
  @IsOptional()
  @IsEnum(['STANDARD', 'SUBCONTRACT'])
  type?: string;
}
