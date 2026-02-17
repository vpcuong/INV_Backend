import { Injectable } from '@nestjs/common';
import { POStatus, POLineStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IPORepository,
  POHeaderData,
  CreatePOData,
  UpdatePOHeaderData,
  UpdatePOLineData,
  CreateNewLineData,
  FindAllParams,
} from '../domain/po.repository.interface';

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

  async create(data: CreatePOData): Promise<POHeaderData> {
    const { lines, ...headerData } = data;

    return this.prisma.client.pOHeader.create({
      data: {
        ...headerData,
        lines: lines
          ? {
              create: lines.map((line) => ({
                lineNum: line.lineNum,
                skuId: line.skuId,
                description: line.description,
                uomCode: line.uomCode,
                orderQty: line.orderQty,
                unitPrice: line.unitPrice,
                lineAmount: line.lineAmount,
                receivedQty: line.receivedQty,
                warehouseCode: line.warehouseCode,
                status: line.status,
                note: line.note,
                createdBy: line.createdBy,
              })),
            }
          : undefined,
      },
      include: {
        lines: true,
      },
    }) as unknown as POHeaderData;
  }

  async findAll(params: FindAllParams): Promise<POHeaderData[]> {
    const { skip, take, supplierId, status } = params;

    return this.prisma.client.pOHeader.findMany({
      skip,
      take,
      where: {
        ...(supplierId && { supplierId }),
        ...(status && { status }),
      },
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        lines: {
          orderBy: {
            lineNum: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }) as unknown as POHeaderData[];
  }

  async findOne(id: number): Promise<POHeaderData | null> {
    return this.prisma.client.pOHeader.findUnique({
      where: { id },
      include: {
        supplier: true,
        lines: {
          include: PO_LINES_INCLUDE,
          orderBy: {
            lineNum: 'asc',
          },
        },
      },
    }) as unknown as POHeaderData | null;
  }

  async findOneWithLines(id: number): Promise<POHeaderData | null> {
    return this.prisma.client.pOHeader.findUnique({
      where: { id },
      include: {
        lines: true,
      },
    }) as unknown as POHeaderData | null;
  }

  async update(id: number, data: UpdatePOHeaderData): Promise<POHeaderData> {
    return this.prisma.client.pOHeader.update({
      where: { id },
      data,
      include: {
        supplier: true,
        lines: {
          include: PO_LINES_INCLUDE,
          orderBy: {
            lineNum: 'asc',
          },
        },
      },
    }) as unknown as POHeaderData;
  }

  async updateWithLines(
    id: number,
    headerData: UpdatePOHeaderData | undefined,
    linesToUpdate: { id: number; data: UpdatePOLineData }[],
    linesToCreate: CreateNewLineData[],
    linesToDelete: number[],
  ): Promise<POHeaderData> {
    return this.prisma.client.$transaction(async (tx) => {
      // 1. Update header if provided
      if (headerData) {
        await tx.pOHeader.update({
          where: { id },
          data: headerData,
        });
      }

      // 2. Delete lines if specified
      if (linesToDelete.length > 0) {
        await tx.pODetail.deleteMany({
          where: {
            id: { in: linesToDelete },
            poId: id,
          },
        });
      }

      // 3. Update existing lines
      for (const line of linesToUpdate) {
        await tx.pODetail.update({
          where: { id: line.id },
          data: line.data,
        });
      }

      // 4. Create new lines
      for (const line of linesToCreate) {
        await tx.pODetail.create({
          data: line,
        });
      }

      // 5. Return updated PO
      return tx.pOHeader.findUnique({
        where: { id },
        include: {
          supplier: true,
          lines: {
            include: PO_LINES_INCLUDE,
            orderBy: { lineNum: 'asc' },
          },
        },
      });
    }) as unknown as POHeaderData;
  }

  async remove(id: number): Promise<void> {
    await this.prisma.client.pOHeader.delete({
      where: { id },
    });
  }

  async findLastPOByPrefix(prefix: string): Promise<string | null> {
    const lastPO = await this.prisma.client.pOHeader.findFirst({
      where: {
        poNum: { startsWith: prefix },
      },
      orderBy: {
        poNum: 'desc',
      },
      select: {
        poNum: true,
      },
    });

    return lastPO?.poNum ?? null;
  }

  async getMaxLineNum(poId: number): Promise<number> {
    const result = await this.prisma.client.pODetail.aggregate({
      where: { poId },
      _max: { lineNum: true },
    });

    return result._max.lineNum || 0;
  }

  async updateLineReceivedQty(
    lineId: number,
    receivedQty: number,
    status: POLineStatus,
  ): Promise<void> {
    await this.prisma.client.pODetail.update({
      where: { id: lineId },
      data: { receivedQty, status },
    });
  }

  async updatePOStatus(poId: number, status: POStatus): Promise<void> {
    await this.prisma.client.pOHeader.update({
      where: { id: poId },
      data: { status },
    });
  }
}
