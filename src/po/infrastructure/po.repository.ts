import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IPORepository } from '../domain/po.repository.interface';
import { POHeader, POHeaderPersistenceData } from '../domain/po-header.entity';
import { RowMode } from '../domain/po-line.entity';

const PO_LINES_INCLUDE = {
  sku: {
    include: {
      color: true,
      gender: true,
      size: true,
    },
  },
  uom: true,
};

@Injectable()
export class PORepository implements IPORepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(po: POHeader): Promise<POHeader> {
    if (po.getId() === 0) {
      return this.createPO(po);
    }
    return this.updatePO(po);
  }

  private async createPO(po: POHeader): Promise<POHeader> {
    const persistence = po.toPersistence();
    const newLines = po.getLines().filter((l) => l.rowMode === RowMode.NEW);

    const result = await this.prisma.client.pOHeader.create({
      data: {
        poNum: persistence.poNum,
        supplierId: persistence.supplierId,
        orderDate: persistence.orderDate,
        expectedDate: persistence.expectedDate,
        status: persistence.status as any,
        currencyCode: persistence.currencyCode,
        exchangeRate: persistence.exchangeRate,
        totalAmount: persistence.totalAmount,
        note: persistence.note,
        createdBy: persistence.createdBy,
        lines: newLines.length > 0
          ? {
              create: newLines.map((line) => {
                const lp = line.toPersistence();
                return {
                  lineNum: lp.lineNum,
                  skuId: lp.skuId,
                  description: lp.description,
                  uomCode: lp.uomCode,
                  orderQty: lp.orderQty,
                  unitPrice: lp.unitPrice,
                  lineAmount: lp.lineAmount,
                  receivedQty: lp.receivedQty,
                  warehouseCode: lp.warehouseCode,
                  status: lp.status as any,
                  note: lp.note,
                  createdBy: lp.createdBy,
                };
              }),
            }
          : undefined,
      },
      include: {
        supplier: true,
        lines: {
          include: PO_LINES_INCLUDE,
          orderBy: { lineNum: 'asc' },
        },
      },
    });

    return POHeader.fromPersistence(result as unknown as POHeaderPersistenceData);
  }

  private async updatePO(po: POHeader): Promise<POHeader> {
    const persistence = po.toPersistence();
    const allLines = po.getAllLinesForPersistence();

    const newLines = allLines.filter((l) => l.rowMode === RowMode.NEW);
    const updatedLines = allLines.filter((l) => l.rowMode === RowMode.UPDATED);
    const deletedLines = allLines.filter((l) => l.rowMode === RowMode.DELETED);

    const deletedIds = deletedLines
      .map((l) => l.getId())
      .filter((id): id is number => id !== 0);

    const updated = await this.prisma.client.pOHeader.update({
      where: { id: persistence.id },
      data: {
        supplierId: persistence.supplierId,
        orderDate: persistence.orderDate,
        expectedDate: persistence.expectedDate,
        status: persistence.status as any,
        currencyCode: persistence.currencyCode,
        exchangeRate: persistence.exchangeRate,
        totalAmount: persistence.totalAmount,
        note: persistence.note,
        lines: {
          deleteMany: deletedIds.length > 0 ? { id: { in: deletedIds } } : undefined,
          updateMany: updatedLines.map((line) => {
            const lp = line.toPersistence();
            return {
              where: { id: lp.id },
              data: {
                skuId: lp.skuId,
                description: lp.description,
                uomCode: lp.uomCode,
                orderQty: lp.orderQty,
                unitPrice: lp.unitPrice,
                lineAmount: lp.lineAmount,
                receivedQty: lp.receivedQty,
                warehouseCode: lp.warehouseCode,
                status: lp.status as any,
                note: lp.note,
              },
            };
          }),
          create: newLines.map((line) => {
            const lp = line.toPersistence();
            return {
              lineNum: lp.lineNum,
              skuId: lp.skuId,
              description: lp.description,
              uomCode: lp.uomCode,
              orderQty: lp.orderQty,
              unitPrice: lp.unitPrice,
              lineAmount: lp.lineAmount,
              receivedQty: lp.receivedQty,
              warehouseCode: lp.warehouseCode,
              status: lp.status as any,
              note: lp.note,
              createdBy: lp.createdBy,
            };
          }),
        },
      },
      include: {
        supplier: true,
        lines: {
          include: PO_LINES_INCLUDE,
          orderBy: { lineNum: 'asc' },
        },
      },
    });

    return POHeader.fromPersistence(updated as unknown as POHeaderPersistenceData);
  }

  async findById(id: number): Promise<POHeader | null> {
    const result = await this.prisma.client.pOHeader.findUnique({
      where: { id },
      include: {
        supplier: true,
        lines: {
          include: PO_LINES_INCLUDE,
          orderBy: { lineNum: 'asc' },
        },
      },
    });

    if (!result) return null;
    return POHeader.fromPersistence(result as unknown as POHeaderPersistenceData);
  }

  async remove(id: number): Promise<void> {
    await this.prisma.client.pOHeader.delete({ where: { id } });
  }

  async findLastPOByPrefix(prefix: string): Promise<string | null> {
    const lastPO = await this.prisma.client.pOHeader.findFirst({
      where: { poNum: { startsWith: prefix } },
      orderBy: { poNum: 'desc' },
      select: { poNum: true },
    });

    return lastPO?.poNum ?? null;
  }
}
