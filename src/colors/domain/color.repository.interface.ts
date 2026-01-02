import { Color } from './color.entity';

export interface IColorRepository {
  create(color: Color): Promise<Color>;
  findAll(): Promise<Color[]>;
  findOne(id: number): Promise<Color>;
  update(id: number, color: Color): Promise<Color>;
  remove(id: number): Promise<Color>;
  activate(id: number): Promise<Color>;
  deactivate(id: number): Promise<Color>;
}