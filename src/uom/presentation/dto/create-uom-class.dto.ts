import { CreateUomDto } from './create-uom.dto';

export class CreateUomClassDto {
  code: string;
  name: string;
  description?: string;
  baseUomCode?: string;
  uoms?: CreateUomDto[];
}
