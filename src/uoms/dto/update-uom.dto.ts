import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUomDto } from './create-uom.dto';

export class UpdateUomDto extends PartialType(
  OmitType(CreateUomDto, ['code'] as const)
) {}
