import { SOHeader } from './so-header.entity';

export type PrismaTransaction = any;

export interface ISOHeaderRepository {
  create(
    soHeader: SOHeader,
    transaction?: PrismaTransaction
  ): Promise<SOHeader>;
  findAll(transaction?: PrismaTransaction): Promise<SOHeader[]>;
  findOne(
    id: number,
    transaction?: PrismaTransaction
  ): Promise<SOHeader | null>;
  findBySONum(
    soNum: string,
    transaction?: PrismaTransaction
  ): Promise<SOHeader | null>;
  findByPublicId(
    publicId: string,
    transaction?: PrismaTransaction
  ): Promise<SOHeader | null>;
  findOneWithRelations(
    id: number,
    transaction?: PrismaTransaction
  ): Promise<any | null>;
  findLastSOByPrefix(
    prefix: string,
    transaction?: PrismaTransaction
  ): Promise<{ soNum: string } | null>;
  update(
    id: number,
    soHeader: SOHeader,
    transaction?: PrismaTransaction
  ): Promise<SOHeader>;
  delete(id: number, transaction?: PrismaTransaction): Promise<SOHeader>;
  transaction<T>(
    callback: (repo: ISOHeaderRepository) => Promise<T>
  ): Promise<T>;
}
