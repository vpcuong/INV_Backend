import { Theme } from './theme.entity';

export interface IThemeRepository {
  save(theme: Theme): Promise<Theme>;
  findById(id: number): Promise<Theme | null>;
  update(id: number, data: Partial<any>): Promise<Theme>;
  getAll(): Promise<Theme[]>;
  delete(id: number): Promise<void>;
}
