import { POHeader } from './po-header.entity';

export interface IPORepository {
  save(po: POHeader): Promise<POHeader>;

  findById(id: number): Promise<POHeader | null>;

  findByPublicId(publicId: string): Promise<POHeader | null>;

  remove(id: number): Promise<void>;

  findLastPOByPrefix(prefix: string): Promise<string | null>;
}
