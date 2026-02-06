import { UomClass } from './uom-class.entity';

export interface IUomRepository {
  save(uomClass: UomClass): Promise<UomClass>;
  findByCode(code: string): Promise<UomClass | null>;
  findAll(): Promise<UomClass[]>;
  remove(code: string): Promise<void>;
  
  // Additional query methods if needed
  findUomByCode(uomCode: string): Promise<any>; // Return raw or entity
  findClassByUomCode(uomCode: string): Promise<UomClass | null>;
}
