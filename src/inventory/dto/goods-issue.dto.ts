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

export class CreateGoodsIssueLineDto {
  @ApiProperty({ description: 'Line number', example: 1 })
  @IsNumber()
  @Min(1)
  lineNum: number;

  @ApiProperty({ description: 'Item SKU ID', example: 101 })
  @IsNumber()
  @IsNotEmpty()
  itemSkuId: number;

  @ApiProperty({ description: 'Quantity', example: 10 })
  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @ApiProperty({ description: 'UOM Code', example: 'PCS' })
  @IsString()
  @IsNotEmpty()
  uomCode: string;

  @ApiProperty({ description: 'Line note', required: false, example: 'Fragile' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateGoodsIssueDto {
  @ApiProperty({ description: 'Warehouse ID (Source)', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  fromWarehouseId: number; // Required for Goods Issue

  @ApiProperty({ description: 'Transaction Date', required: false, example: '2023-01-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  transactionDate?: string;

  @ApiProperty({ description: 'Note', required: false, example: 'Manual issue' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: 'Created By', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiProperty({ description: 'Issue Lines', type: [CreateGoodsIssueLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGoodsIssueLineDto)
  lines: CreateGoodsIssueLineDto[];
}

export class CreateGoodsIssueFromSoDto {
  @ApiProperty({ description: 'Sales Order ID', example: 1001 })
  @IsNumber()
  @IsNotEmpty()
  soId: number; // Required SO reference

  @ApiProperty({ description: 'Warehouse ID (Source)', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  fromWarehouseId: number;

  @ApiProperty({ description: 'Transaction Date', required: false, example: '2023-01-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  transactionDate?: string;

  @ApiProperty({ description: 'Note', required: false, example: 'Issue for SO #1001' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: 'Created By', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiProperty({ description: 'Issue Lines', type: [CreateGoodsIssueLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGoodsIssueLineDto)
  lines: CreateGoodsIssueLineDto[];
}
