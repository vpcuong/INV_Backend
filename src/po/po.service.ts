import {
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { IPORepository } from './domain/po.repository.interface';
import { POHeader } from './domain/po-header.entity';
import { PONumberGeneratorService } from './domain/services/po-number-generator.service';
import { PO_REPOSITORY, PO_NUMBER_GENERATOR } from './constant/po.token';
import { CreatePOHeaderDto } from './dto/create-po-header.dto';
import { UpdatePOHeaderDto } from './dto/update-po-header.dto';
import { UpdatePOWithLinesDto } from './dto/update-po-with-lines.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PoService {
  constructor(
    @Inject(PO_REPOSITORY)
    private readonly repository: IPORepository,
    @Inject(PO_NUMBER_GENERATOR)
    private readonly numberGenerator: PONumberGeneratorService,
    private readonly prisma: PrismaService
  ) {}

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
    const poNum = await this.numberGenerator.generate();

    const resolvedLines = await Promise.all(
      (createDto.lines ?? []).map(async (line) => ({
        skuId: await this.resolveSkuId(line.skuPublicId),
        description: line.description,
        uomCode: line.uomCode,
        orderQty: line.orderQty,
        unitPrice: line.unitPrice,
        warehouseCode: line.warehouseCode,
        note: line.note,
      }))
    );

    const po = POHeader.create({
      poNum,
      supplierId: createDto.supplierId,
      orderDate: createDto.orderDate,
      expectedDate: createDto.expectedDate,
      currencyCode: createDto.currencyCode,
      exchangeRate: createDto.exchangeRate,
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

  private async findEntityByPublicId(publicId: string): Promise<POHeader> {
    console.log(publicId)
    const po = await this.repository.findByPublicId(publicId);
    console.log(po)
    if (!po) {
      throw new NotFoundException(`Purchase Order with publicId ${publicId} not found`);
    }
    return po;
  }

  async update(id: number, updateDto: UpdatePOHeaderDto): Promise<POHeader> {
    const po = await this.findEntity(id);

    if (updateDto.status) {
      const nextStatus = updateDto.status.toUpperCase();
      if (nextStatus === 'APPROVED') po.approve();
      else if (nextStatus === 'CANCELLED') po.cancel();
      else if (nextStatus === 'CLOSED') po.close();
      else po.transitionStatus(nextStatus);
    }

    po.updateHeader({
      supplierId: updateDto.supplierId,
      orderDate: updateDto.orderDate ? new Date(updateDto.orderDate) : undefined,
      expectedDate: updateDto.expectedDate ? new Date(updateDto.expectedDate) : undefined,
      currencyCode: updateDto.currencyCode,
      exchangeRate: updateDto.exchangeRate,
      note: updateDto.note,
    });

    return this.repository.save(po);
  }

  async updateWithLines(
    id: number,
    dto: UpdatePOWithLinesDto,
    createdBy?: string
  ): Promise<POHeader> {
    const po = await this.findEntity(id);

    // Update header
    if (dto.header) {
      po.updateHeader({
        supplierId: dto.header.supplierId,
        orderDate: dto.header.orderDate ? new Date(dto.header.orderDate) : undefined,
        expectedDate: dto.header.expectedDate ? new Date(dto.header.expectedDate) : undefined,
        currencyCode: dto.header.currencyCode,
        exchangeRate: dto.header.exchangeRate,
        note: dto.header.note,
      });

      if (dto.header.status) {
        const nextStatus = dto.header.status.toUpperCase();
        if (nextStatus === 'APPROVED') po.approve();
        else if (nextStatus === 'CANCELLED') po.cancel();
        else if (nextStatus === 'CLOSED') po.close();
        else po.transitionStatus(nextStatus);
      }
    }

    // Delete lines
    for (const lineId of dto.linesToDelete ?? []) {
      po.removeLine(lineId);
    }

    // Update or add lines
    for (const lineDto of dto.lines ?? []) {
      if (lineDto.id) {
        const line = po.getLines().find((l) => l.getId() === lineDto.id);
        if (line) {
          const skuId = lineDto.skuPublicId
            ? await this.resolveSkuId(lineDto.skuPublicId)
            : undefined;
          line.updateFields({
            skuId,
            description: lineDto.description,
            uomCode: lineDto.uomCode,
            orderQty: lineDto.orderQty,
            unitPrice: lineDto.unitPrice,
            warehouseCode: lineDto.warehouseCode,
            note: lineDto.note,
          });
          po.recalculatePricing();
        }
      } else {
        po.addLine({
          skuId: await this.resolveSkuId(lineDto.skuPublicId!),
          description: lineDto.description,
          uomCode: lineDto.uomCode ?? '',
          orderQty: lineDto.orderQty!,
          unitPrice: lineDto.unitPrice!,
          warehouseCode: lineDto.warehouseCode,
          note: lineDto.note,
          createdBy,
        });
      }
    }

    return this.repository.save(po);
  }

  async approve(publicId: string): Promise<POHeader> {
    const po = await this.findEntityByPublicId(publicId);
    po.approve();
    return this.repository.save(po);
  }

  async cancel(publicId: string): Promise<POHeader> {
    const po = await this.findEntityByPublicId(publicId);
    po.cancel();
    return this.repository.save(po);
  }

  async close(publicId: string): Promise<POHeader> {
    const po = await this.findEntityByPublicId(publicId);
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
