import { Size } from './size.entity';

export interface ISizeRepository {
  create(size: Size): Promise<Size>;
  findAll(): Promise<Size[]>;
  findOne(id: number): Promise<Size | null>;
  findByCode(code: string): Promise<Size | null>;
  update(id: number, size: Size): Promise<Size>;
  remove(id: number): Promise<Size>;
  activate(id: number): Promise<Size>;
  deactivate(id: number): Promise<Size>;
}
