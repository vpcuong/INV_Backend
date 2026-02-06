import { InvTransHeader } from './inv-trans-header.entity';

export type PrismaTransaction = any;

export interface IInvTransHeaderRepository {
  create(header: InvTransHeader, transaction?: PrismaTransaction): Promise<InvTransHeader>;
  findAll(transaction?: PrismaTransaction): Promise<InvTransHeader[]>;
  findOne(id: number, transaction?: PrismaTransaction): Promise<InvTransHeader | null>;
  findByPublicId(publicId: string, transaction?: PrismaTransaction): Promise<InvTransHeader | null>;
  findByTransNum(transNum: string, transaction?: PrismaTransaction): Promise<InvTransHeader | null>;
  update(id: number, header: InvTransHeader, transaction?: PrismaTransaction): Promise<InvTransHeader>;
  delete(id: number, transaction?: PrismaTransaction): Promise<InvTransHeader>;
  findLastTransByPrefix(prefix: string, transaction?: PrismaTransaction): Promise<{ transNum: string } | null>;
  findOneWithRelations(id: number, transaction?: PrismaTransaction): Promise<any | null>;
  findByReference(
    refType: string,
    refId: number,
    transaction?: PrismaTransaction
  ): Promise<InvTransHeader[]>;
  transaction<T>(callback: (repo: IInvTransHeaderRepository) => Promise<T>): Promise<T>;
}
