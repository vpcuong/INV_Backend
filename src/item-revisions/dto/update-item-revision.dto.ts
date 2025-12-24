import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateItemRevisionDto {
  @ApiPropertyOptional({
    description: 'Revision number/code',
    example: 'R001',
  })
  @IsOptional()
  @IsString()
  revision?: string;

  @ApiPropertyOptional({
    description: 'Revision name',
    example: 'Initial revision',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Notes about this revision',
    example: 'First version of the product',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Revision status',
    example: 'Draft',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Effective date (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  effectiveAt?: string;
}
