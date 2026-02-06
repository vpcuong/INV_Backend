import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { InvTransType } from '../enums/inv-trans.enum';

export class CreateInvTransLineDto {
  @ApiProperty({ description: 'Line number', example: 1 })
  @IsNumber()
  @Min(1)
  lineNum: number;

  @ApiProperty({ description: 'Item SKU ID', example: '' })
  @IsString()
  itemSkuId: string;

  @ApiProperty({ description: 'Quantity', example: 10 })
  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @ApiProperty({ description: 'UOM Code', example: 'PCS' })
  @IsString()
  @IsNotEmpty()
  uomCode: string;

  @ApiProperty({ description: 'Note', required: false, example: 'Line note' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateInvTransHeaderDto {
  @ApiProperty({ description: 'Transaction Type', enum: InvTransType, example: InvTransType.GOODS_RECEIPT })
  @IsString()
  @IsNotEmpty()
  type: InvTransType;

  @ApiProperty({ description: 'Source Warehouse ID', required: false, example: 1 })
  @IsNumber()
  @IsOptional()
  fromWarehouseId?: number;

  @ApiProperty({ description: 'Destination Warehouse ID', required: false, example: 2 })
  @IsNumber()
  @IsOptional()
  toWarehouseId?: number;

  @ApiProperty({ description: 'Reference Type', required: false, example: 'PO' })
  @IsString()
  @IsOptional()
  referenceType?: string;

  @ApiProperty({ description: 'Reference ID', required: false, example: 5001 })
  @IsNumber()
  @IsOptional()
  referenceId?: number;

  @ApiProperty({ description: 'Reference Number', required: false, example: 'PO-2023-001' })
  @IsString()
  @IsOptional()
  referenceNum?: string;

  @ApiProperty({ description: 'Reason Code', required: false, example: 'DAMAGED' })
  @IsString()
  @IsOptional()
  reasonCode?: string;

  @ApiProperty({ description: 'Transaction Date', required: false, example: '2023-01-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  transactionDate?: string;

  @ApiProperty({ description: 'Note', required: false, example: 'Transaction note' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: 'Created By', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiProperty({ description: 'Transaction Lines', type: [CreateInvTransLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvTransLineDto)
  lines: CreateInvTransLineDto[];
}
