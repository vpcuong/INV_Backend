import { Gender } from './gender.entity';

export interface IGenderRepository {
  create(gender: Gender): Promise<Gender>;
  findAll(): Promise<Gender[]>;
  findOne(id: number): Promise<Gender | null>;
  findByCode(code: string): Promise<Gender | null>;
  update(id: number, gender: Gender): Promise<Gender>;
  remove(id: number): Promise<Gender>;
  activate(id: number): Promise<Gender>;
  deactivate(id: number): Promise<Gender>;
}
