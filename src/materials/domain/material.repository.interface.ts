import { Material } from './material.entity';

export interface IMaterialRepository {
  create(material: Material): Promise<Material>;
  findAll(): Promise<Material[]>;
  findOne(id: number): Promise<Material | null>;
  findByCode(code: string): Promise<Material | null>;
  update(id: number, material: Material): Promise<Material>;
  remove(id: number): Promise<Material>;
  activate(id: number): Promise<Material>;
  deactivate(id: number): Promise<Material>;
  isUsedByItems(id: number): Promise<boolean>;
}
