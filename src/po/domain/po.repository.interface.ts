import { POHeader } from './po-header.entity';

export interface FindAllParams {
  skip?: number;
  take?: number;
  supplierId?: number;
  status?: string;
}

export interface IPORepository {
  save(po: POHeader): Promise<POHeader>;

  findAll(params: FindAllParams): Promise<POHeader[]>;

  findById(id: number): Promise<POHeader | null>;

  remove(id: number): Promise<void>;

  findLastPOByPrefix(prefix: string): Promise<string | null>;
}
