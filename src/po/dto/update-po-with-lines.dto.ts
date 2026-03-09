import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, ValidateNested, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdatePOHeaderDto } from './update-po-header.dto';
import { UpdatePOLineDto } from './update-po-line.dto';

export class UpdatePOLineWithIdDto extends UpdatePOLineDto {
  @ApiPropertyOptional({
    description: 'Line publicId (for updating existing line, omit for new line)',
    example: '01JNXXX...',
  })
  @IsOptional()
  @IsString()
  publicId?: string;

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
        publicId: '01JNYYY...',
        orderQty: 120,
        unitPrice: 25.0,
      },
      {
        skuPublicId: '01JNXXX...',
        orderQty: 50,
        unitPrice: 30.0,
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
    description: 'Line publicIds to delete',
    type: [String],
    example: ['01JNZZZ...', '01JNAAA...'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  linesToDelete?: string[];
}
