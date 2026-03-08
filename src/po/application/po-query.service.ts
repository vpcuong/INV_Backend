import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FindPOsDto } from '../dto/find-pos.dto';

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
export class POQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindPOsDto): Promise<any[]> {
    const { skip, take, supplierId, status } = params;

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
          orderBy: { lineNum: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<any> {
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

    if (!result) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    return result;
  }
}
