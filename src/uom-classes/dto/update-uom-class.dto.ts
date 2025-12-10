import { PartialType } from '@nestjs/swagger';
import { CreateUomClassDto } from './create-uom-class.dto';

export class UpdateUomClassDto extends PartialType(CreateUomClassDto) {}
