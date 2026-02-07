import { AdjustReason } from './adjust-reason.entity';

export interface IAdjustReasonRepository {
  findAll(): Promise<AdjustReason[]>;
  findActive(): Promise<AdjustReason[]>;
  findById(id: number): Promise<AdjustReason | null>;
  findByCode(code: string): Promise<AdjustReason | null>;
  save(reason: AdjustReason): Promise<AdjustReason>;
  update(id: number, reason: AdjustReason): Promise<AdjustReason>;
  remove(id: number): Promise<void>;
}
