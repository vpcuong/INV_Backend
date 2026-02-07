import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdjustDirection } from '../domain/adjust-reason.entity';

export class UpdateAdjustReasonDto {
  @ApiProperty({ description: 'Name', required: false, example: 'Damaged Goods' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Description', required: false, example: 'Adjustment for damaged goods' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Direction', required: false, enum: ['INCREASE', 'DECREASE', 'BOTH'] })
  @IsString()
  @IsIn(['INCREASE', 'DECREASE', 'BOTH'])
  @IsOptional()
  direction?: AdjustDirection;

  @ApiProperty({ description: 'Affects cost calculation', required: false })
  @IsBoolean()
  @IsOptional()
  affectCost?: boolean;

  @ApiProperty({ description: 'Requires note when used', required: false })
  @IsBoolean()
  @IsOptional()
  requireNote?: boolean;

  @ApiProperty({ description: 'Requires approval when used', required: false })
  @IsBoolean()
  @IsOptional()
  requireApproval?: boolean;
}
