import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ISOHeaderRepository,
  PrismaTransaction,
} from '../domain/so-header.repository.interface';
import { SOHeader } from '../domain/so-header.entity';
import { SOLine } from '../domain/so-line.entity';

@Injectable()
export class SOHeaderRepository implements ISOHeaderRepository {
  constructor(private prisma: PrismaService) {}

  private getDb(transaction?: PrismaTransaction) {
    return transaction || this.prisma.client;
  }

  async create(
    soHeader: SOHeader,
    transaction?: PrismaTransaction
  ): Promise<SOHeader> {
    const db = this.getDb(transaction);
    const data = soHeader.toPersistence();
    const lines = soHeader.getLines().map((line) => line.toPersistence());

    const created = await db.sOHeader.create({
      data: {
        ...data,
        lines: {
          create: lines.map(({ id, soHeaderId, ...lineData }) => lineData),
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

  async findOne(
    id: number,
    transaction?: PrismaTransaction
  ): Promise<SOHeader | null> {
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

  async update(
    id: number,
    soHeader: SOHeader,
    transaction?: PrismaTransaction
  ): Promise<SOHeader> {
    const db = this.getDb(transaction);
    const data = soHeader.toPersistence();
    const lines = soHeader.getLines();

    // Get existing lines
    const existing = await db.sOHeader.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!existing) {
      throw new Error(`SOHeader with ID ${id} not found`);
    }

    const existingLineIds = existing.lines.map((line) => line.id);
    const currentLineIds = lines
      .map((line) => line.getId())
      .filter((id): id is number => id !== undefined);

    // Lines to delete (exist in DB but not in current)
    const linesToDelete = existingLineIds.filter(
      (id) => !currentLineIds.includes(id)
    );

    // Update header and lines
    const updated = await db.sOHeader.update({
      where: { id },
      data: {
        ...data,
        lines: {
          // Delete removed lines
          deleteMany:
            linesToDelete.length > 0
              ? { id: { in: linesToDelete } }
              : undefined,
          // Update existing lines
          updateMany: lines
            .filter((line) => line.getId())
            .map((line) => ({
              where: { id: line.getId()! },
              data: line.toPersistence(),
            })),
          // Create new lines
          create: lines
            .filter((line) => !line.getId())
            .map((line) => {
              const { id, soHeaderId, ...lineData } = line.toPersistence();
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
            item: true,
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
