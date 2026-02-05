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

export class UpdateInvTransLineDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsNumber()
  @Min(1)
  lineNum: number;

  @IsNumber()
  @IsOptional()
  itemSkuId?: number;

  @IsNumber()
  @Min(0.0001)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  uomCode?: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateInvTransHeaderDto {
  @IsDateString()
  @IsOptional()
  transactionDate?: string;

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

  @IsString()
  @IsOptional()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInvTransLineDto)
  @IsOptional()
  lines?: UpdateInvTransLineDto[];
}
