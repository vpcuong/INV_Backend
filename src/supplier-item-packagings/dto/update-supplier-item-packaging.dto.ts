import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplierItemPackagingDto } from './create-supplier-item-packaging.dto';

export class UpdateSupplierItemPackagingDto extends PartialType(
  CreateSupplierItemPackagingDto
) {}
