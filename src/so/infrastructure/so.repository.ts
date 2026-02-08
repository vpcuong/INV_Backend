import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ISOHeaderRepository,
  PrismaTransaction,
} from '../domain/so-header.repository.interface';
import { SOHeader } from '../domain/so-header.entity';
import { SOLine } from '../domain/so-line.entity';
import { RowMode } from '../../common/enums/row-mode.enum';

@Injectable()
export class SOHeaderRepository implements ISOHeaderRepository {
  constructor(private prisma: PrismaService) {}

  private getDb(transaction?: PrismaTransaction) {
    return transaction ||this.prisma.client;
  }

  async create(
    soHeader: SOHeader,
    transaction?: PrismaTransaction
  ): Promise<SOHeader> {
    const db = this.getDb(transaction);
    const { id, publicId, createdAt, updatedAt, ...headerData } = soHeader.toPersistence();
    const lines = soHeader.getLines().map((line) => line.toPersistence());

    const created = await db.sOHeader.create({
      data: {
        ...headerData,
        lines: {
          create: lines.map(({ id, publicId, soHeaderId, createdAt: lCreatedAt, updatedAt: lUpdatedAt, ...lineData }) => lineData),
        },
      },
      include: {
        lines: {
          orderBy: {
            lineNum: 'asc',
          },
        },
      },
    });

    return SOHeader.fromPersistence(created);
  }

  async findAll(transaction?: PrismaTransaction): Promise<SOHeader[]> {
    const db = this.getDb(transaction);
    const headers = await db.sOHeader.findMany({
      include: {
        lines: {
          orderBy: {
            lineNum: 'asc',
          },
        },
      },
      orderBy: [{ orderDate: 'desc' }, { soNum: 'desc' }],
    });

    return headers.map((header) => SOHeader.fromPersistence(header));
  }

  /**
   * Find a sales order by ID
   * @param id 
   * @param transaction 
   * @returns 
   */
  async findOne(id: number, transaction?: PrismaTransaction): Promise<SOHeader | null> {
    const db = this.getDb(transaction);
    const header = await db.sOHeader.findUnique({
      where: { id },
      include: {
        lines: {
          orderBy: {
            lineNum: 'asc',
          },
        },
      },
    });

    if (!header) {
      return null;
    }

    return SOHeader.fromPersistence(header);
  }

  async findBySONum(
    soNum: string,
    transaction?: PrismaTransaction
  ): Promise<SOHeader | null> {
    const db = this.getDb(transaction);
    const header = await db.sOHeader.findUnique({
      where: { soNum },
      include: {
        lines: {
          orderBy: {
            lineNum: 'asc',
          },
        },
      },
    });

    if (!header) {
      return null;
    }

    return SOHeader.fromPersistence(header);
  }

  async findByPublicId(
    publicId: string,
    transaction?: PrismaTransaction
  ): Promise<SOHeader | null> {
    const db = this.getDb(transaction);
    const header = await db.sOHeader.findUnique({
      where: { publicId: publicId },
      include: {
        lines: {
          include: {
            itemSku: {
              include: {
                color: true,
                gender: true,
                size: true,
              },
            },
            uom: true,
          },
          orderBy: {
            lineNum: 'asc',
          },
        },
        customer: true,
        billingAddress: true,
        shippingAddress: true,
      },
    });

    if (!header) {
      return null;
    }

    return SOHeader.fromPersistence(header);
  }

  async update(
    id: number,
    soHeader: SOHeader,
    transaction?: PrismaTransaction
  ): Promise<SOHeader> {
    const db = this.getDb(transaction);

    // Use rowMode to determine which lines need DB operations
    // getAllLinesForPersistence() includes deleted lines for sync
    const allLines = soHeader.getAllLinesForPersistence();

    const newLines = allLines.filter((l) => l.getRowMode() === RowMode.NEW);
    const updatedLines = allLines.filter((l) => l.getRowMode() === RowMode.UPDATED);
    const deletedLines = allLines.filter((l) => l.getRowMode() === RowMode.DELETED);

    // Update header and lines
    const {
      id: rootId,
      publicId,
      createdAt,
      updatedAt,
      ...headerData
    } = soHeader.toPersistence();

    // Get IDs of lines to delete
    const deletedIds = deletedLines
      .map((l) => l.getId())
      .filter((id): id is number => id !== undefined);

    // Use transaction if not already in one
    const executeUpdate = async (txDb: any) => {
      const updated = await txDb.sOHeader.update({
        where: { id },
        data: {
          ...headerData,
          lines: {
            // Delete lines marked as DELETED
            deleteMany:
              deletedIds.length > 0
                ? { id: { in: deletedIds } }
                : undefined,
            // Update only lines marked as UPDATED
            updateMany: updatedLines.map((line) => {
              const {
                id: lineId,
                publicId: linePublicId,
                soHeaderId,
                createdAt: lineCreatedAt,
                updatedAt: lineUpdatedAt,
                ...lineData
              } = line.toPersistence();
              return {
                where: { id: lineId! },
                data: lineData,
              };
            }),
            // Create only lines marked as NEW
            create: newLines.map((line) => {
              const {
                id: lineId,
                publicId: linePublicId,
                soHeaderId,
                createdAt: lineCreatedAt,
                updatedAt: lineUpdatedAt,
                ...lineData
              } = line.toPersistence();
              return lineData;
            }),
          },
        },
        include: {
          lines: {
            orderBy: {
              lineNum: 'asc',
            },
          },
        },
      });

      return SOHeader.fromPersistence(updated);
    };

    // If already inside a transaction, or if $transaction is not available
    // (e.g. this repo was created with a tx client), execute directly
    if (transaction || typeof this.prisma.client.$transaction !== 'function') {
      return executeUpdate(db);
    }
    return this.prisma.client.$transaction(async (tx) => executeUpdate(tx));
  }

  async delete(id: number, transaction?: PrismaTransaction): Promise<SOHeader> {
    const db = this.getDb(transaction);
    const deleted = await db.sOHeader.delete({
      where: { id },
      include: {
        lines: {
          orderBy: {
            lineNum: 'asc',
          },
        },
      },
    });

    return SOHeader.fromPersistence(deleted);
  }

  async findOneWithRelations(
    id: number,
    transaction?: PrismaTransaction
  ): Promise<any | null> {
    const db = this.getDb(transaction);
    const soHeader = await db.sOHeader.findUnique({
      where: { id },
      include: {
        customer: true,
        billingAddress: true,
        shippingAddress: true,
        lines: {
          include: {
            itemSku: {
              include: {
                color: true,
                gender: true,
                size: true,
              },
            },
            uom: true,
          },
          orderBy: {
            lineNum: 'asc',
          },
        },
      },
    });

    return soHeader;
  }

  async findLastSOByPrefix(
    prefix: string,
    transaction?: PrismaTransaction
  ): Promise<{ soNum: string } | null> {
    const db = this.getDb(transaction);
    const lastSO = await db.sOHeader.findFirst({
      where: {
        soNum: {
          startsWith: prefix,
        },
      },
      orderBy: {
        soNum: 'desc',
      },
      select: {
        soNum: true,
      },
    });

    return lastSO;
  }

  async transaction<T>(
    callback: (repo: ISOHeaderRepository) => Promise<T>
  ): Promise<T> {
    return await this.prisma.client.$transaction(async (tx) => {
      const transactionalRepo = new SOHeaderRepository({
        client: tx,
      } as PrismaService);
      return await callback(transactionalRepo);
    });
  }
}
