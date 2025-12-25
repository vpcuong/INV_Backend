import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSOHeaderDto } from './update-so-header.dto';
import { UpdateSOLineDto } from './update-so-line.dto';

export class UpdateSOLineWithIdDto extends UpdateSOLineDto {
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

export class UpdateSOWithLinesDto {
  @ApiPropertyOptional({
    description: 'SO Header fields to update',
    type: UpdateSOHeaderDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSOHeaderDto)
  header?: UpdateSOHeaderDto;

  @ApiPropertyOptional({
    description: 'SO Lines to add or update',
    type: [UpdateSOLineWithIdDto],
    example: [
      {
        id: 1,
        quantity: 120,
        unitPrice: 25.00,
      },
      {
        // New line (no id)
        lineNum: 2,
        skuId: 5,
        quantity: 50,
        unitPrice: 30.00,
        uomCode: 'PCS',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSOLineWithIdDto)
  lines?: UpdateSOLineWithIdDto[];

  @ApiPropertyOptional({
    description: 'Line IDs to delete',
    type: [Number],
    example: [3, 4],
  })
  @IsOptional()
  @IsArray()
  linesToDelete?: number[];
}