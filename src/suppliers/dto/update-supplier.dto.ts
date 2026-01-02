import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsEmail, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSupplierDto } from './create-supplier.dto';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @IsNumber()
  @ApiPropertyOptional({ description: 'Rating for supplier', example: '1, 2, 3, 4, 5' })
  rating?: number;
}
