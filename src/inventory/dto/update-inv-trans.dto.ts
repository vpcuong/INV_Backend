import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInvTransLineDto {
  @ApiProperty({ description: 'Line ID (for updates)', required: false, example: 123 })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ description: 'Line Number', example: 1 })
  @IsNumber()
  @Min(1)
  lineNum: number;

  @ApiProperty({ description: 'Item SKU ID', required: false, example: 101 })
  @IsNumber()
  @IsOptional()
  itemSkuId?: number;

  @ApiProperty({ description: 'Quantity', required: false, example: 20 })
  @IsNumber()
  @Min(0.0001)
  @IsOptional()
  quantity?: number;

  @ApiProperty({ description: 'UOM Code', required: false, example: 'KG' })
  @IsString()
  @IsOptional()
  uomCode?: string;

  @ApiProperty({ description: 'Note', required: false, example: 'Updated note' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateInvTransHeaderDto {
  @ApiProperty({ description: 'Transaction Date', required: false, example: '2023-01-05T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  transactionDate?: string;

  @ApiProperty({ description: 'Reference Type', required: false, example: 'PO' })
  @IsString()
  @IsOptional()
  referenceType?: string;

  @ApiProperty({ description: 'Reference ID', required: false, example: 5002 })
  @IsNumber()
  @IsOptional()
  referenceId?: number;

  @ApiProperty({ description: 'Reference Number', required: false, example: 'PO-2023-002' })
  @IsString()
  @IsOptional()
  referenceNum?: string;

  @ApiProperty({ description: 'Adjustment Reason ID', required: false, example: 1 })
  @IsNumber()
  @IsOptional()
  reasonId?: number;

  @ApiProperty({ description: 'Note', required: false, example: 'Correction for previous error' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: 'Lines to update/create', type: [UpdateInvTransLineDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInvTransLineDto)
  @IsOptional()
  lines?: UpdateInvTransLineDto[];
}
