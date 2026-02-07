import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePOHeaderDto } from './dto/create-po-header.dto';
import { UpdatePOHeaderDto } from './dto/update-po-header.dto';
import { UpdatePOWithLinesDto } from './dto/update-po-with-lines.dto';

@Injectable()
export class PoService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreatePOHeaderDto, createdBy: string) {
    // Auto-generate PO number if not provided
    const poNum = await this.generatePONumber();

    return this.prisma.client.pOHeader.create({
      data: {
        poNum,
        supplierId: createDto.supplierId,
        orderDate: createDto.orderDate || new Date(),
        expectedDate: createDto.expectedDate,
        status: (createDto.status || 'DRAFT') as any,
        currencyCode: createDto.currencyCode,
        exchangeRate: createDto.exchangeRate || 1,
        totalAmount: createDto.totalAmount,
        note: createDto.note,
        createdBy,
        lines: createDto.lines
          ? {
              create: createDto.lines.map((line) => ({
                lineNum: line.lineNum,
                skuId: line.skuId,
                description: line.description,
                uomCode: line.uomCode,
                orderQty: line.orderQty,
                unitPrice: line.unitPrice,
                lineAmount: line.lineAmount,
                receivedQty: line.receivedQty || 0,
                warehouseCode: line.warehouseCode,
                status: (line.status || 'OPEN') as any,
                note: line.note,
                createdBy,
              })),
            }
          : undefined,
      },
      include: {
        lines: true,
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    supplierId?: number;
    status?: string;
  }) {
    const { skip, take, supplierId, status } = params || {};

    return this.prisma.client.pOHeader.findMany({
      skip,
      take,
      where: {
        ...(supplierId && { supplierId }),
        ...(status && { status: status as any }),
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
    });
  }

  async findOne(id: number) {
    const poHeader = await this.prisma.client.pOHeader.findUnique({
      where: { id },
      include: {
        supplier: true,
        lines: {
          include: {
            sku: {
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

    if (!poHeader) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    return poHeader;
  }

  async update(id: number, updateDto: UpdatePOHeaderDto) {
    // Check if PO exists
    await this.findOne(id);

    return this.prisma.client.pOHeader.update({
      where: { id },
      data: {
        ...updateDto,
        status: updateDto.status as any,
      },
      include: {
        supplier: true,
        lines: {
          include: {
            sku: {
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
  }

  async updateWithLines(id: number, dto: UpdatePOWithLinesDto, createdBy?: string) {
    return this.prisma.client.$transaction(async (tx) => {
      // 1. Verify PO exists
      let poHeader = await tx.pOHeader.findUnique({
        where: { id },
        include: { lines: true },
      });

      if (!poHeader) {
        throw new NotFoundException(`Purchase Order with ID ${id} not found`);
      }

      // 2. Update header if provided
      if (dto.header) {
        await tx.pOHeader.update({
          where: { id },
          data: {
            ...dto.header,
            status: dto.header.status as any,
          },
        });
      }

      // 3. Delete lines if specified
      if (dto.linesToDelete && dto.linesToDelete.length > 0) {
        await tx.pODetail.deleteMany({
          where: {
            id: { in: dto.linesToDelete },
            poId: id,
          },
        });
      }

      // 4. Update or create lines
      if (dto.lines && dto.lines.length > 0) {
        for (const line of dto.lines) {
          console.log('line', line.id);
          if (line.id) {
            // Update existing line
            const { id: lineId, ...lineData } = line;
            await tx.pODetail.update({
              where: { id: lineId },
              data: {
                ...lineData,
                status: lineData.status as any,
              },
            });
          } else {
            // Create new line - need to get the next line number
            const maxLineNum = await tx.pODetail.aggregate({
              where: { poId: id },
              _max: { lineNum: true },
            });

            const nextLineNum =
              line.lineNum || (maxLineNum._max.lineNum || 0) + 1;

            await tx.pODetail.create({
              data: {
                poId: id,
                lineNum: nextLineNum,
                skuId: line.skuId!,
                description: line.description,
                uomCode: line.uomCode || '',
                orderQty: line.orderQty!,
                unitPrice: line.unitPrice!,
                lineAmount: line.lineAmount!,
                receivedQty: line.receivedQty || 0,
                warehouseCode: line.warehouseCode,
                status: (line.status || 'OPEN') as any,
                note: line.note,
                createdBy,
              },
            });
          }
        }
      }

      // 5. Return updated PO with all lines
      return tx.pOHeader.findUnique({
        where: { id },
        include: {
          supplier: true,
          lines: {
            include: {
              sku: {
                include: {
                  color: true,
                  gender: true,
                  size: true,
                },
              },
              uom: true,
            },
            orderBy: { lineNum: 'asc' },
          },
        },
      });
    });
  }

  async remove(id: number) {
    // Check if PO exists
    await this.findOne(id);

    return this.prisma.client.pOHeader.delete({
      where: { id },
    });
  }

  private async generatePONumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    // Get the count of POs created this month
    const startOfMonth = new Date(year, today.getMonth(), 1);
    const endOfMonth = new Date(year, today.getMonth() + 1, 0);

    const count = await this.prisma.client.pOHeader.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `PO-${year}${month}-${sequence}`;
  }
}
