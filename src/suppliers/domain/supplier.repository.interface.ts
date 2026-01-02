import { Supplier } from './supplier.entity';

export interface ISupplierRepository {
  create(supplier: Supplier): Promise<Supplier>;
  findAll(): Promise<Supplier[]>;
  findOne(id: number): Promise<Supplier | null>;
  findByCode(code: string): Promise<Supplier | null>;
  update(id: number, supplier: Supplier): Promise<Supplier>;
  remove(id: number): Promise<Supplier>;
  activate(id: number): Promise<Supplier>;
  deactivate(id: number): Promise<Supplier>;
}
