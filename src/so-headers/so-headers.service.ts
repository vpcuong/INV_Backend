import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSOHeaderDto } from './dto/create-so-header.dto';
import { UpdateSOHeaderDto } from './dto/update-so-header.dto';

@Injectable()
export class SoHeadersService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateSOHeaderDto) {
    // Auto-generate SO number if not provided
    const soNum = createDto.soNum || await this.generateSONumber();

    return this.prisma.client.sOHeader.create({
      data: {
        soNum,
        customerId: createDto.customerId,
        customerPoNum: createDto.customerPoNum,
        orderDate: createDto.orderDate || new Date(),
        requestDate: createDto.requestDate,
        needByDate: createDto.needByDate,
        orderStatus: (createDto.orderStatus || 'OPEN') as any,
        channel: createDto.channel,
        fobCode: createDto.fobCode,
        shipViaCode: createDto.shipViaCode,
        paymentTermCode: createDto.paymentTermCode as any,
        currencyCode: createDto.currencyCode,
        exchangeRate: createDto.exchangeRate || 1,
        headerDiscountPercent: createDto.headerDiscountPercent || 0,
        headerDiscountAmount: createDto.headerDiscountAmount || 0,
        totalLineAmount: createDto.totalLineAmount,
        totalDiscount: createDto.totalDiscount || 0,
        totalTax: createDto.totalTax || 0,
        totalCharges: createDto.totalCharges || 0,
        orderTotal: createDto.orderTotal,
        openAmount: createDto.openAmount,
        billingAddressId: createDto.billingAddressId,
        shippingAddressId: createDto.shippingAddressId,
        headerNote: createDto.headerNote,
        internalNote: createDto.internalNote,
        createdBy: createDto.createdBy,
        lines: createDto.lines ? {
          create: createDto.lines.map(line => ({
            lineNum: line.lineNum,
            itemId: line.itemId,
            itemSkuId: line.itemSkuId,
            itemCode: line.itemCode,
            description: line.description,
            orderQty: line.orderQty,
            uomCode: line.uomCode,
            unitPrice: line.unitPrice,
            lineDiscountPercent: line.lineDiscountPercent || 0,
            lineDiscountAmount: line.lineDiscountAmount || 0,
            lineTaxPercent: line.lineTaxPercent || 0,
            lineTaxAmount: line.lineTaxAmount || 0,
            lineTotal: line.lineTotal,
            needByDate: line.needByDate,
            lineStatus: (line.lineStatus || 'OPEN') as any,
            openQty: line.openQty,
            shippedQty: line.shippedQty || 0,
            warehouseCode: line.warehouseCode,
            lineNote: line.lineNote,
          }))
        } : undefined,
      },
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
              }
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

  async findAll(params?: {
    skip?: number;
    take?: number;
    customerId?: number;
    orderStatus?: string;
  }) {
    const { skip, take, customerId, orderStatus } = params || {};

    return this.prisma.client.sOHeader.findMany({
      skip,
      take,
      where: {
        ...(customerId && { customerId }),
        ...(orderStatus && { orderStatus: orderStatus as any }),
      },
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            customerName: true,
          },
        },
        lines: {
          select: {
            id: true,
            lineNum: true,
            itemCode: true,
            orderQty: true,
            lineTotal: true,
            lineStatus: true,
          },
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
    const soHeader = await this.prisma.client.sOHeader.findUnique({
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
              }
            },
            uom: true,
          },
          orderBy: {
            lineNum: 'asc',
          },
        },
      },
    });

    if (!soHeader) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }

    return soHeader;
  }

  async findBySONum(soNum: string) {
    const soHeader = await this.prisma.client.sOHeader.findUnique({
      where: { soNum },
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
              }
            },
            uom: true,
          },
          orderBy: {
            lineNum: 'asc',
          },
        },
      },
    });

    if (!soHeader) {
      throw new NotFoundException(`Sales Order ${soNum} not found`);
    }

    return soHeader;
  }

  async findByCustomer(customerId: number) {
    return this.prisma.client.sOHeader.findMany({
      where: { customerId },
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            customerName: true,
          },
        },
        lines: {
          select: {
            id: true,
            lineNum: true,
            itemCode: true,
            orderQty: true,
            lineTotal: true,
            lineStatus: true,
          },
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

  async update(id: number, updateDto: UpdateSOHeaderDto) {
    await this.findOne(id);

    return this.prisma.client.sOHeader.update({
      where: { id },
      data: {
        ...updateDto,
        orderStatus: updateDto.orderStatus as any,
        paymentTermCode: updateDto.paymentTermCode as any,
      },
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
              }
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

  async updateStatus(id: number, status: 'DRAFT' | 'OPEN' | 'PARTIAL' | 'CLOSED' | 'CANCELLED' | 'ON_HOLD') {
    await this.findOne(id);

    return this.prisma.client.sOHeader.update({
      where: { id },
      data: { orderStatus: status as any },
      include: {
        customer: true,
        lines: {
          select: {
            id: true,
            lineNum: true,
            itemCode: true,
            orderQty: true,
            lineStatus: true,
          },
        },
      },
    });
  }

  async cancel(id: number) {
    return this.updateStatus(id, 'CANCELLED');
  }

  async close(id: number) {
    return this.updateStatus(id, 'CLOSED');
  }

  async hold(id: number) {
    return this.updateStatus(id, 'ON_HOLD');
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.client.sOHeader.delete({
      where: { id },
    });
  }

  // Helper method to generate SO number
  private async generateSONumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    // Find the last SO number for this month
    const lastSO = await this.prisma.client.sOHeader.findFirst({
      where: {
        soNum: {
          startsWith: `SO-${year}${month}`,
        },
      },
      orderBy: {
        soNum: 'desc',
      },
    });

    let sequence = 1;
    if (lastSO) {
      const lastSequence = parseInt(lastSO.soNum.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `SO-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }
}
