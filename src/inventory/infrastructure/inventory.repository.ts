import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IInvTransHeaderRepository,
  PrismaTransaction,
} from '../domain/inv-trans-header.repository.interface';
import { InvTransHeader } from '../domain/inv-trans-header.entity';
import { InvTransLine } from '../domain/inv-trans-line.entity';
import { RowMode } from '../../common/enums/row-mode.enum';

@Injectable()
export class InvTransHeaderRepository implements IInvTransHeaderRepository {
  constructor(private prisma: PrismaService) {}

  private getDb(transaction?: PrismaTransaction) {
    return transaction || this.prisma.client;
  }

  async create(
    header: InvTransHeader,
    transaction?: PrismaTransaction
  ): Promise<InvTransHeader> {
    const db = this.getDb(transaction);
    const { id, publicId, createdAt, updatedAt, lines, ...headerData } = header.toPersistence();
    const lineData = header.getLines().map(line => line.toPersistence());

    const created = await db.invTransHeader.create({
      data: {
        ...headerData,
        lines: {
          create: lineData.map(({ id, publicId, headerId, createdAt: lCreatedAt, updatedAt: lUpdatedAt, rowMode, ...ld }) => ld),
        },
      },
      include: {
        lines: {
          orderBy: { lineNum: 'asc' },
        },
      },
    });

    return InvTransHeader.fromPersistence(created);
  }

  async findAll(transaction?: PrismaTransaction): Promise<InvTransHeader[]> {
    const db = this.getDb(transaction);
    const headers = await db.invTransHeader.findMany({
      include: {
        lines: {
          orderBy: { lineNum: 'asc' },
        },
      },
      orderBy: [{ transactionDate: 'desc' }, { transNum: 'desc' }],
    });

    return headers.map((h: any) => InvTransHeader.fromPersistence(h));
  }

  async findOne(id: number, transaction?: PrismaTransaction): Promise<InvTransHeader | null> {
    const db = this.getDb(transaction);
    const header = await db.invTransHeader.findUnique({
      where: { id },
      include: {
        lines: {
          orderBy: { lineNum: 'asc' },
        },
      },
    });

    if (!header) {
      return null;
    }

    return InvTransHeader.fromPersistence(header);
  }

  async findByPublicId(
    publicId: string,
    transaction?: PrismaTransaction
  ): Promise<InvTransHeader | null> {
    const db = this.getDb(transaction);
    const header = await db.invTransHeader.findUnique({
      where: { publicId },
      include: {
        lines: {
          include: {
            itemSku: {
              include: {
                color: true,
                size: true,
              },
            },
            uom: true,
          },
          orderBy: { lineNum: 'asc' },
        },
        fromWarehouse: true,
        toWarehouse: true,
      },
    });

    if (!header) {
      return null;
    }

    return InvTransHeader.fromPersistence(header);
  }

  async findByTransNum(
    transNum: string,
    transaction?: PrismaTransaction
  ): Promise<InvTransHeader | null> {
    const db = this.getDb(transaction);
    const header = await db.invTransHeader.findUnique({
      where: { transNum },
      include: {
        lines: {
          orderBy: { lineNum: 'asc' },
        },
      },
    });

    if (!header) {
      return null;
    }

    return InvTransHeader.fromPersistence(header);
  }

  async update(
    id: number,
    header: InvTransHeader,
    transaction?: PrismaTransaction
  ): Promise<InvTransHeader> {
    const db = this.getDb(transaction);
    const allLines = header.getAllLinesForPersistence();

    // Filter lines by RowMode (same pattern as SO module)
    const newLines = allLines.filter(l => l.getRowMode() === RowMode.NEW);
    const deletedLines = allLines.filter(l => l.getRowMode() === RowMode.DELETED && l.getId());
    const updatedLines = allLines.filter(l => l.getRowMode() === RowMode.UPDATED && l.getId());

    const { id: rootId, publicId, createdAt, updatedAt, lines, ...headerData } = header.toPersistence();
    const deletedIds = deletedLines.map(l => l.getId()).filter((id): id is number => id !== undefined);

    const executeUpdate = async (txDb: any) => {
      const updated = await txDb.invTransHeader.update({
        where: { id },
        data: {
          ...headerData,
          lines: {
            deleteMany: deletedIds.length > 0 ? { id: { in: deletedIds } } : undefined,
            updateMany: updatedLines.map(line => {
              const { id: lineId, publicId: linePublicId, headerId, createdAt: lCreatedAt, updatedAt: lUpdatedAt, rowMode, ...lineData } = line.toPersistence();
              return {
                where: { id: lineId! },
                data: lineData,
              };
            }),
            create: newLines.map(line => {
              const { id: lineId, publicId: linePublicId, headerId, createdAt: lCreatedAt, updatedAt: lUpdatedAt, rowMode, ...lineData } = line.toPersistence();
              return lineData;
            }),
          },
        },
        include: {
          lines: {
            orderBy: { lineNum: 'asc' },
          },
        },
      });

      return InvTransHeader.fromPersistence(updated);
    };

    if (transaction || typeof this.prisma.client.$transaction !== 'function') {
      return executeUpdate(db);
    }
    return this.prisma.client.$transaction(async (tx: any) => executeUpdate(tx));
  }

  async delete(id: number, transaction?: PrismaTransaction): Promise<InvTransHeader> {
    const db = this.getDb(transaction);
    const deleted = await db.invTransHeader.delete({
      where: { id },
      include: {
        lines: {
          orderBy: { lineNum: 'asc' },
        },
      },
    });

    return InvTransHeader.fromPersistence(deleted);
  }

  async findLastTransByPrefix(
    prefix: string,
    transaction?: PrismaTransaction
  ): Promise<{ transNum: string } | null> {
    const db = this.getDb(transaction);
    const lastTrans = await db.invTransHeader.findFirst({
      where: {
        transNum: {
          startsWith: prefix,
        },
      },
      orderBy: {
        transNum: 'desc',
      },
      select: {
        transNum: true,
      },
    });

    return lastTrans;
  }

  async findOneWithRelations(
    id: number,
    transaction?: PrismaTransaction
  ): Promise<any | null> {
    const db = this.getDb(transaction);
    const header = await db.invTransHeader.findUnique({
      where: { id },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        lines: {
          include: {
            itemSku: {
              include: {
                color: true,
                size: true,
              },
            },
            uom: true,
          },
          orderBy: { lineNum: 'asc' },
        },
      },
    });

    return header;
  }

  async transaction<T>(
    callback: (repo: IInvTransHeaderRepository) => Promise<T>
  ): Promise<T> {
    return await this.prisma.client.$transaction(async (tx: any) => {
      const transactionalRepo = new InvTransHeaderRepository({
        client: tx,
      } as PrismaService);
      return await callback(transactionalRepo);
    });
  }
}
