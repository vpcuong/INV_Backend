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
import { InvTransType } from '../enums/inv-trans.enum';

export class CreateInvTransLineDto {
  @IsNumber()
  @Min(1)
  lineNum: number;

  @IsNumber()
  @IsNotEmpty()
  itemSkuId: number;

  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  uomCode: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateInvTransHeaderDto {
  @IsString()
  @IsNotEmpty()
  type: InvTransType;

  @IsNumber()
  @IsOptional()
  fromWarehouseId?: number;

  @IsNumber()
  @IsOptional()
  toWarehouseId?: number;

  @IsString()
  @IsOptional()
  referenceType?: string;

  @IsNumber()
  @IsOptional()
  referenceId?: number;

  @IsString()
  @IsOptional()
  referenceNum?: string;

  @IsString()
  @IsOptional()
  reasonCode?: string;

  @IsDateString()
  @IsOptional()
  transactionDate?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvTransLineDto)
  lines: CreateInvTransLineDto[];
}
