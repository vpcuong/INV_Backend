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

export class CreateStockTransferDto {
  @ApiProperty({ description: 'Source Warehouse ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  fromWarehouseId: number; // Required (Source)

  @ApiProperty({ description: 'Destination Warehouse ID', example: 2 })
  @IsNumber()
  @IsNotEmpty()
  toWarehouseId: number; // Required (Destination)

  @ApiProperty({ description: 'Transaction Date', required: false, example: '2023-01-10T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  transactionDate?: string;

  @ApiProperty({ description: 'Note', required: false, example: 'Transfer to branch B' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: 'Transfer Lines', type: [CreateInvTransLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvTransLineDto)
  lines: CreateInvTransLineDto[];
}
