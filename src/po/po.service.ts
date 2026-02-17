import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { POStatus, POLineStatus } from '@prisma/client';
import { IPORepository, CreatePOLineData } from './domain/po.repository.interface';
import { PONumberGeneratorService } from './domain/services/po-number-generator.service';
import { PO_REPOSITORY, PO_NUMBER_GENERATOR } from './constant/po.token';
import { CreatePOHeaderDto } from './dto/create-po-header.dto';
import { UpdatePOHeaderDto } from './dto/update-po-header.dto';
import { UpdatePOWithLinesDto } from './dto/update-po-with-lines.dto';

const VALID_PO_TRANSITIONS: Record<POStatus, POStatus[]> = {
  [POStatus.DRAFT]: [POStatus.APPROVED, POStatus.CANCELLED],
  [POStatus.APPROVED]: [POStatus.PARTIALLY_RECEIVED, POStatus.RECEIVED, POStatus.CANCELLED],
  [POStatus.PARTIALLY_RECEIVED]: [POStatus.RECEIVED, POStatus.CANCELLED],
  [POStatus.RECEIVED]: [POStatus.CLOSED],
  [POStatus.CLOSED]: [],
  [POStatus.CANCELLED]: [],
};

const VALID_PO_LINE_TRANSITIONS: Record<POLineStatus, POLineStatus[]> = {
  [POLineStatus.OPEN]: [POLineStatus.PARTIALLY_RECEIVED, POLineStatus.RECEIVED, POLineStatus.CANCELLED],
  [POLineStatus.PARTIALLY_RECEIVED]: [POLineStatus.RECEIVED, POLineStatus.CANCELLED],
  [POLineStatus.RECEIVED]: [],
  [POLineStatus.CANCELLED]: [],
};

@Injectable()
export class PoService {
  constructor(
    @Inject(PO_REPOSITORY)
    private readonly repository: IPORepository,
    @Inject(PO_NUMBER_GENERATOR)
    private readonly numberGenerator: PONumberGeneratorService,
  ) {}

  async create(createDto: CreatePOHeaderDto, createdBy: string) {
    const poNum = await this.numberGenerator.generate();

    return this.repository.create({
      poNum,
      supplierId: createDto.supplierId,
      orderDate: createDto.orderDate || new Date(),
      expectedDate: createDto.expectedDate,
      status: (createDto.status as POStatus) || POStatus.DRAFT,
      currencyCode: createDto.currencyCode,
      exchangeRate: createDto.exchangeRate || 1,
      totalAmount: createDto.totalAmount,
      note: createDto.note,
      createdBy,
      lines: createDto.lines?.map((line): CreatePOLineData => ({
        lineNum: line.lineNum,
        skuId: line.skuId,
        description: line.description,
        uomCode: line.uomCode,
        orderQty: line.orderQty,
        unitPrice: line.unitPrice,
        lineAmount: line.lineAmount,
        receivedQty: line.receivedQty || 0,
        warehouseCode: line.warehouseCode,
        status: (line.status as POLineStatus) || POLineStatus.OPEN,
        note: line.note,
        createdBy,
      })),
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    supplierId?: number;
    status?: string;
  }) {
    const { skip, take, supplierId, status } = params || {};

    return this.repository.findAll({
      skip,
      take,
      supplierId,
      status: status as POStatus,
    });
  }

  async findOne(id: number) {
    const poHeader = await this.repository.findOne(id);

    if (!poHeader) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    return poHeader;
  }

  async update(id: number, updateDto: UpdatePOHeaderDto) {
    const po = await this.findOne(id);

    if (updateDto.status) {
      this.validatePOStatusTransition(po.status, updateDto.status as POStatus);
    }

    return this.repository.update(id, {
      ...updateDto,
      status: updateDto.status as POStatus,
    });
  }

  async updateWithLines(id: number, dto: UpdatePOWithLinesDto, createdBy?: string) {
    // Verify PO exists
    const poHeader = await this.repository.findOneWithLines(id);
    if (!poHeader) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    // Validate PO header status transition
    if (dto.header?.status) {
      this.validatePOStatusTransition(poHeader.status, dto.header.status as POStatus);
    }

    // Validate line status transitions
    if (dto.lines) {
      for (const line of dto.lines) {
        if (line.id && line.status) {
          const existingLine = poHeader.lines.find((l) => l.id === line.id);
          if (existingLine) {
            this.validatePOLineStatusTransition(existingLine.status, line.status as POLineStatus);
          }
        }
      }
    }

    // Prepare header data
    const headerData = dto.header
      ? { ...dto.header, status: dto.header.status as POStatus }
      : undefined;

    // Separate lines into updates and creates
    const linesToUpdate: { id: number; data: any }[] = [];
    const linesToCreate: any[] = [];

    if (dto.lines && dto.lines.length > 0) {
      for (const line of dto.lines) {
        if (line.id) {
          const { id: lineId, ...lineData } = line;
          linesToUpdate.push({
            id: lineId,
            data: {
              ...lineData,
              status: lineData.status as POLineStatus,
            },
          });
        } else {
          const maxLineNum = await this.repository.getMaxLineNum(id);
          const nextLineNum = line.lineNum || maxLineNum + 1;

          linesToCreate.push({
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
            status: (line.status as POLineStatus) || POLineStatus.OPEN,
            note: line.note,
            createdBy,
          });
        }
      }
    }

    return this.repository.updateWithLines(
      id,
      headerData,
      linesToUpdate,
      linesToCreate,
      dto.linesToDelete || [],
    );
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repository.remove(id);
  }

  /**
   * Update receivedQty for a PO line and recalculate line status
   * Called by inventory service after Goods Receipt
   */
  async updateLineReceivedQty(poId: number, skuId: number, additionalQty: number) {
    const po = await this.repository.findOneWithLines(poId);
    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${poId} not found`);
    }

    const line = po.lines.find((l) => l.skuId === skuId);
    if (!line) {
      throw new NotFoundException(`PO line with skuId ${skuId} not found in PO ${poId}`);
    }

    const currentReceivedQty = Number(line.receivedQty) || 0;
    const newReceivedQty = currentReceivedQty + additionalQty;
    const orderQty = Number(line.orderQty);

    // Determine new line status
    let newLineStatus: POLineStatus;
    if (newReceivedQty >= orderQty) {
      newLineStatus = POLineStatus.RECEIVED;
    } else if (newReceivedQty > 0) {
      newLineStatus = POLineStatus.PARTIALLY_RECEIVED;
    } else {
      newLineStatus = line.status;
    }

    await this.repository.updateLineReceivedQty(line.id, newReceivedQty, newLineStatus);
  }

  /**
   * Recalculate PO header status based on line statuses
   * Called after updating line receivedQty
   */
  async recalculatePOStatus(poId: number) {
    const po = await this.repository.findOneWithLines(poId);
    if (!po || po.lines.length === 0) return;

    const allReceived = po.lines.every((l) => l.status === POLineStatus.RECEIVED);
    const someReceived = po.lines.some(
      (l) => l.status === POLineStatus.RECEIVED || l.status === POLineStatus.PARTIALLY_RECEIVED,
    );

    let newStatus: POStatus;
    if (allReceived) {
      newStatus = POStatus.RECEIVED;
    } else if (someReceived) {
      newStatus = POStatus.PARTIALLY_RECEIVED;
    } else {
      return; // No change needed
    }

    if (po.status !== newStatus) {
      await this.repository.updatePOStatus(poId, newStatus);
    }
  }

  private validatePOStatusTransition(current: POStatus, next: POStatus) {
    const validNext = VALID_PO_TRANSITIONS[current];
    if (!validNext || !validNext.includes(next)) {
      throw new BadRequestException(
        `Invalid PO status transition: ${current} → ${next}. Valid transitions: ${validNext?.join(', ') || 'none'}`,
      );
    }
  }

  private validatePOLineStatusTransition(current: POLineStatus, next: POLineStatus) {
    const validNext = VALID_PO_LINE_TRANSITIONS[current];
    if (!validNext || !validNext.includes(next)) {
      throw new BadRequestException(
        `Invalid PO line status transition: ${current} → ${next}. Valid transitions: ${validNext?.join(', ') || 'none'}`,
      );
    }
  }
}
