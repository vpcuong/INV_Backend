import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdatePOHeaderDto } from './update-po-header.dto';
import { UpdatePOLineDto } from './update-po-line.dto';

export class UpdatePOLineWithIdDto extends UpdatePOLineDto {
  @ApiPropertyOptional({
    description: 'Line ID (for updating existing line, omit for new line)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({
    description: 'Line number',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  lineNum?: number;
}

export class UpdatePOWithLinesDto {
  @ApiPropertyOptional({
    description: 'PO Header fields to update',
    type: UpdatePOHeaderDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePOHeaderDto)
  header?: UpdatePOHeaderDto;

  @ApiPropertyOptional({
    description: 'PO Lines to add or update',
    type: [UpdatePOLineWithIdDto],
    example: [
      {
        id: 1,
        orderQty: 120,
        unitPrice: 25.00,
      },
      {
        // New line (no id)
        lineNum: 2,
        skuId: 5,
        orderQty: 50,
        unitPrice: 30.00,
        uomCode: 'PCS',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePOLineWithIdDto)
  lines?: UpdatePOLineWithIdDto[];

  @ApiPropertyOptional({
    description: 'Line IDs to delete',
    type: [Number],
    example: [3, 4],
  })
  @IsOptional()
  @IsArray()
  linesToDelete?: number[];
}