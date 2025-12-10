import { PartialType } from '@nestjs/swagger';
import { CreateUomConversionDto } from './create-uom-conversion.dto';

export class UpdateUomConversionDto extends PartialType(CreateUomConversionDto) {}
