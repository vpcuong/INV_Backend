import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateInvTransLineDto } from './create-inv-trans.dto';

export class CreateAdjustmentDto {
  @ApiProperty({ description: 'Warehouse ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  fromWarehouseId: number; // Required for Adjustment

  @ApiProperty({ description: 'Reason Code', example: 'CYCLE_COUNT' })
  @IsString()
  @IsNotEmpty()
  reasonCode: string; // Required for Adjustment

  @ApiProperty({ description: 'Transaction Date', required: false, example: '2023-01-05T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  transactionDate?: string;

  @ApiProperty({ description: 'Note', required: false, example: 'Inventory adjustment' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: 'Created By', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiProperty({ description: 'Adjustment Lines', type: [CreateInvTransLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvTransLineDto)
  lines: CreateInvTransLineDto[];
}
