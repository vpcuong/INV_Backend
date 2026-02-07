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

export class CreateGoodsReceiptLineDto {
  @ApiProperty({ description: 'Line number', example: 1 })
  @IsNumber()
  @Min(1)
  lineNum: number;

  @ApiProperty({ description: 'Item SKU ID', example: '' })
  @IsNumber()
  itemSkuId: string;

  @ApiProperty({ description: 'Quantity', example: 50 })
  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @ApiProperty({ description: 'UOM Code', example: 'BOX' })
  @IsString()
  @IsNotEmpty()
  uomCode: string;

  @ApiProperty({ description: 'Line note', required: false, example: 'Handle with care' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateGoodsReceiptDto {
  @ApiProperty({ description: 'Warehouse ID (Destination)', example: 2 })
  @IsNumber()
  @IsNotEmpty()
  toWarehouseId: number; // Required for Goods Receipt

  @ApiProperty({ description: 'Transaction Date', required: false, example: '2023-01-02T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  transactionDate?: string;

  @ApiProperty({ description: 'Note', required: false, example: 'Manual receipt' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: 'Receipt Lines', type: [CreateGoodsReceiptLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGoodsReceiptLineDto)
  lines: CreateGoodsReceiptLineDto[];
}

export class CreateGoodsReceiptFromPoDto {
  @ApiProperty({ description: 'Purchase Order ID', example: 5001 })
  @IsNumber()
  @IsNotEmpty()
  poId: number; // Required PO reference

  @ApiProperty({ description: 'Warehouse ID (Destination)', example: 2 })
  @IsNumber()
  @IsNotEmpty()
  toWarehouseId: number;

  @ApiProperty({ description: 'Transaction Date', required: false, example: '2023-01-02T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  transactionDate?: string;

  @ApiProperty({ description: 'Note', required: false, example: 'Receipt from PO #5001' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: 'Receipt Lines', type: [CreateGoodsReceiptLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGoodsReceiptLineDto)
  lines: CreateGoodsReceiptLineDto[];
}
