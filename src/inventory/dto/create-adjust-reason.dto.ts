import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdjustDirection } from '../domain/adjust-reason.entity';

export class CreateAdjustReasonDto {
  @ApiProperty({ description: 'Unique code', example: 'DAMAGED' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Name', example: 'Damaged Goods' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description', required: false, example: 'Adjustment for damaged goods' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Direction', enum: ['INCREASE', 'DECREASE', 'BOTH'], example: 'DECREASE' })
  @IsString()
  @IsIn(['INCREASE', 'DECREASE', 'BOTH'])
  direction: AdjustDirection;

  @ApiProperty({ description: 'Affects cost calculation', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  affectCost?: boolean;

  @ApiProperty({ description: 'Requires note when used', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  requireNote?: boolean;

  @ApiProperty({ description: 'Requires approval when used', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  requireApproval?: boolean;
}
