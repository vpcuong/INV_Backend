import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IPORepository } from './domain/po.repository.interface';
import { POHeader } from './domain/po-header.entity';
import { PONumberGeneratorService } from './domain/services/po-number-generator.service';
import { PO_REPOSITORY, PO_NUMBER_GENERATOR } from './constant/po.token';
import { CreatePOHeaderDto } from './dto/create-po-header.dto';
import { UpdatePOHeaderDto } from './dto/update-po-header.dto';
import { UpdatePOWithLinesDto } from './dto/update-po-with-lines.dto';
import { PrismaService } from '../prisma/prisma.service';
import { POType } from '@prisma/client';

@Injectable()
export class PoService {
  constructor(
    @Inject(PO_REPOSITORY)
    private readonly repository: IPORepository,
    @Inject(PO_NUMBER_GENERATOR)
    private readonly numberGenerator: PONumberGeneratorService,
    private readonly prisma: PrismaService
  ) {}

  private async resolveSoLineId(soLinePublicId: string): Promise<number> {
    const soLine = await this.prisma.client.sODetail.findUnique({
      where: { publicId: soLinePublicId },
      select: { id: true },
    });
    if (!soLine) {
      throw new NotFoundException(`SO Line with publicId ${soLinePublicId} not found`);
    }
    return soLine.id;
  }

  private async resolveSkuId(skuPublicId: string): Promise<number> {
    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { publicId: skuPublicId },
      select: { id: true },
    });
    if (!sku) {
      throw new NotFoundException(`SKU with publicId ${skuPublicId} not found`);
    }
    return sku.id;
  }

  async create(createDto: CreatePOHeaderDto, createdBy: string): Promise<POHeader> {
    /**
     * SUBCONTRACT PO must have at least one line mapped to an SO line
     */
    if (createDto.type === POType.SUBCONTRACT) {
      const hasMapping = (createDto.lines ?? []).some((l) => l.soLinePublicId);
      if (!hasMapping) {
        throw new BadRequestException(
          'SUBCONTRACT PO must have at least one line mapped to an SO line (soLinePublicId required)'
        );
      }
    }

    const poNum = await this.numberGenerator.generate();

    const resolvedLines = await Promise.all(
      (createDto.lines ?? []).map(async (line) => ({
        skuId: await this.resolveSkuId(line.skuPublicId),
        description: line.description,
        uomCode: line.uomCode,
        orderQty: line.orderQty,
        unitPrice: line.unitPrice,
        warehouseCode: line.warehouseCode,
        soLineId: line.soLinePublicId
          ? await this.resolveSoLineId(line.soLinePublicId)
          : undefined,
        note: line.note,
      }))
    );

    const po = POHeader.create({
      poNum,
      supplierId: createDto.supplierId,
      orderDate: createDto.orderDate,
      expectedDate: createDto.expectedDate,
      type: createDto.type,
      currencyCode: 'VND',
      exchangeRate: 1,
      note: createDto.note,
      createdBy,
      lines: resolvedLines,
    });

    return this.repository.save(po);
  }

  async findById(id: number): Promise<POHeader> {
    const po = await this.repository.findById(id);
    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }
    return po;
  }

  private findEntity(id: number): Promise<POHeader> {
    return this.findById(id);
  }

  async findByPublicId(publicId: string): Promise<POHeader> {

    const po = await this.repository.findByPublicId(publicId);
    if (!po) {
      throw new NotFoundException(`Purchase Order with publicId ${publicId} not found`);
    }
    return po;
  }

  async update(id: number, updateDto: UpdatePOHeaderDto): Promise<POHeader> {
    const po = await this.findEntity(id);

    po.updateHeader({
      supplierId: updateDto.supplierId,
      orderDate: updateDto.orderDate ? new Date(updateDto.orderDate) : undefined,
      expectedDate: updateDto.expectedDate ? new Date(updateDto.expectedDate) : undefined,
      type: updateDto.type,
      currencyCode: updateDto.currencyCode,
      exchangeRate: updateDto.exchangeRate,
      note: updateDto.note,
    });

    return this.repository.save(po);
  }

  async updateWithLines(
    publicId: string,
    dto: UpdatePOWithLinesDto,
    createdBy?: string
  ): Promise<POHeader> {
    const po = await this.findByPublicId(publicId);

    // Update header
    if (dto.header) {
      po.updateHeader({
        supplierId: dto.header.supplierId,
        orderDate: dto.header.orderDate ? new Date(dto.header.orderDate) : undefined,
        expectedDate: dto.header.expectedDate ? new Date(dto.header.expectedDate) : undefined,
        type: dto.header.type,
        currencyCode: dto.header.currencyCode,
        exchangeRate: dto.header.exchangeRate,
        note: dto.header.note,
      });
    }

    // Delete lines by publicId
    for (const linePublicId of dto.linesToDelete ?? []) {
      po.removeLine(linePublicId);
    }

    // Update or add lines
    for (const lineDto of dto.lines ?? []) {
      if (lineDto.publicId) {
        // UPDATE existing line — find by publicId
        const line = po.getLines().find((l) => l.getPublicId() === lineDto.publicId);
        if (line) {
          const skuId = lineDto.skuPublicId
            ? await this.resolveSkuId(lineDto.skuPublicId)
            : undefined;
          const soLineId = lineDto.soLinePublicId
            ? await this.resolveSoLineId(lineDto.soLinePublicId)
            : undefined;
          line.updateFields({
            skuId,
            description: lineDto.description,
            uomCode: lineDto.uomCode,
            orderQty: lineDto.orderQty,
            unitPrice: lineDto.unitPrice,
            warehouseCode: lineDto.warehouseCode,
            soLineId,
            note: lineDto.note,
          });
          po.recalculatePricing();
        }
      } else {
        // ADD new line
        po.addLine({
          skuId: await this.resolveSkuId(lineDto.skuPublicId!),
          description: lineDto.description,
          uomCode: lineDto.uomCode ?? '',
          orderQty: lineDto.orderQty!,
          unitPrice: lineDto.unitPrice!,
          warehouseCode: lineDto.warehouseCode,
          soLineId: lineDto.soLinePublicId
            ? await this.resolveSoLineId(lineDto.soLinePublicId)
            : undefined,
          note: lineDto.note,
          createdBy,
        });
      }
    }

    return this.repository.save(po);
  }

  async approve(publicId: string): Promise<POHeader> {
    const po = await this.findByPublicId(publicId);
    po.approve();
    return this.repository.save(po);
  }

  async cancel(publicId: string): Promise<POHeader> {
    const po = await this.findByPublicId(publicId);
    po.cancel();
    return this.repository.save(po);
  }

  async close(publicId: string): Promise<POHeader> {
    const po = await this.findByPublicId(publicId);
    po.close();
    return this.repository.save(po);
  }

  async remove(id: number): Promise<void> {
    await this.findEntity(id);
    await this.repository.remove(id);
  }

  /**
   * Update receivedQty for a PO line and recalculate statuses.
   * Called by inventory service after Goods Receipt.
   */
  async updateLineReceivedQty(
    poId: number,
    skuId: number,
    additionalQty: number
  ): Promise<void> {
    const po = await this.findEntity(poId);
    po.updateLineReceivedQty(skuId, additionalQty);
    await this.repository.save(po);
  }
}
