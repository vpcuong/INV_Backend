import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsDate,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LinePricingDto } from './composed/create-so-line.dto';

export class UpdateSOLineDto {
  @ApiPropertyOptional({
    description: 'Item ID',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  itemId?: number;

  @ApiPropertyOptional({
    description: 'Item SKU ID',
    example: 25,
  })
  @IsOptional()
  @IsNumber()
  itemSkuId?: number;

  @ApiPropertyOptional({
    description: 'Item code',
    example: 'TS-COT-GRE-UNI-M',
  })
  @IsOptional()
  @IsString()
  itemCode?: string;

  @ApiPropertyOptional({
    description: 'Item description',
    example: 'Classic T-Shirt - Green, Unisex, Medium',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Order quantity',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  orderQty?: number;

  @ApiPropertyOptional({
    description: 'Unit of Measure code',
    example: 'PCS',
  })
  @IsOptional()
  @IsString()
  uomCode?: string;

  @ApiPropertyOptional({
    description: 'Unit price',
    example: 25.99,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice?: number;

  @ApiPropertyOptional({
    description: 'Line pricing (discount and tax)',
    type: LinePricingDto,
  })
  @ValidateNested()
  @Type(() => LinePricingDto)
  @IsOptional()
  pricing?: LinePricingDto;

  @ApiPropertyOptional({
    description: 'Need by date',
    example: '2024-12-31T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  needByDate?: Date;

  @ApiPropertyOptional({
    description: 'Line status',
    example: 'OPEN',
    enum: ['OPEN', 'PARTIAL', 'CLOSED', 'CANCELLED', 'BACKORDERED'],
  })
  @IsOptional()
  @IsEnum(['OPEN', 'PARTIAL', 'CLOSED', 'CANCELLED', 'BACKORDERED'])
  lineStatus?: string;

  @ApiPropertyOptional({
    description: 'Warehouse code',
    example: 'WH01',
  })
  @IsOptional()
  @IsString()
  warehouseCode?: string;

  @ApiPropertyOptional({
    description: 'Line note',
    example: 'Rush order',
  })
  @IsOptional()
  @IsString()
  lineNote?: string;
}
