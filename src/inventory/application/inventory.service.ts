import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InvTransHeader } from '../domain/inv-trans-header.entity';
import { InvTransLine } from '../domain/inv-trans-line.entity';
import { IInvTransHeaderRepository } from '../domain/inv-trans-header.repository.interface';
import { InvTransNumberGeneratorService } from '../domain/services/inv-trans-number-generator.service';
import { StockService } from '../domain/services/stock.service';
import { CreateInvTransHeaderDto, CreateInvTransLineDto } from '../dto/create-inv-trans.dto';
import { UpdateInvTransHeaderDto } from '../dto/update-inv-trans.dto';
import { InvTransType, InvTransStatus } from '../enums/inv-trans.enum';
import {
  INV_TRANS_HEADER_REPOSITORY,
  INV_TRANS_NUMBER_GENERATOR,
  STOCK_SERVICE,
} from '../constant/inventory.token';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(INV_TRANS_HEADER_REPOSITORY)
    private readonly repository: IInvTransHeaderRepository,
    @Inject(INV_TRANS_NUMBER_GENERATOR)
    private readonly numberGenerator: InvTransNumberGeneratorService,
    @Inject(STOCK_SERVICE)
    private readonly stockService: StockService
  ) {}

  /**
   * Create a new inventory transaction (GOODS_RECEIPT, GOODS_ISSUE, STOCK_TRANSFER, ADJUSTMENT)
   */
  async create(dto: CreateInvTransHeaderDto): Promise<any> {
    // Generate transaction number
    const transNum = await this.numberGenerator.generate(dto.type as InvTransType);

    // Create lines
    const lines = dto.lines.map(
      (lineDto: CreateInvTransLineDto) =>
        new InvTransLine({
          lineNum: lineDto.lineNum,
          itemSkuId: lineDto.itemSkuId,
          quantity: lineDto.quantity,
          uomCode: lineDto.uomCode,
          note: lineDto.note,
        })
    );

    // Create header entity (validation happens in constructor)
    const header = InvTransHeader.create({
      transNum,
      type: dto.type as InvTransType,
      fromWarehouseId: dto.fromWarehouseId,
      toWarehouseId: dto.toWarehouseId,
      referenceType: dto.referenceType,
      referenceId: dto.referenceId,
      referenceNum: dto.referenceNum,
      reasonCode: dto.reasonCode,
      transactionDate: dto.transactionDate ? new Date(dto.transactionDate) : undefined,
      note: dto.note,
      createdBy: dto.createdBy,
      lines,
    });

    const created = await this.repository.create(header);
    return this.toDto(created);
  }

  /**
   * Get all transactions
   */
  async findAll(): Promise<any[]> {
    const headers = await this.repository.findAll();
    return headers.map(h => this.toDto(h));
  }

  /**
   * Get transaction by ID
   */
  async findOne(id: number): Promise<any> {
    const header = await this.repository.findOne(id);
    if (!header) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return this.toDto(header);
  }

  /**
   * Get transaction by Public ID
   */
  async findByPublicId(publicId: string): Promise<any> {
    const header = await this.repository.findByPublicId(publicId);
    if (!header) {
      throw new NotFoundException(`Transaction with Public ID ${publicId} not found`);
    }
    return this.toDto(header);
  }

  /**
   * Update transaction (only DRAFT status)
   */
  async updateByPublicId(publicId: string, dto: UpdateInvTransHeaderDto): Promise<any> {
    const header = await this.repository.findByPublicId(publicId);
    if (!header) {
      throw new NotFoundException(`Transaction with Public ID ${publicId} not found`);
    }

    if (header.getStatus() !== InvTransStatus.DRAFT) {
      throw new BadRequestException('Can only update draft transactions');
    }

    // Update fields
    if (dto.transactionDate) {
      header.updateTransactionDate(new Date(dto.transactionDate));
    }
    if (dto.note !== undefined) {
      header.updateNote(dto.note);
    }
    if (dto.referenceType !== undefined || dto.referenceId !== undefined || dto.referenceNum !== undefined) {
      header.updateReference(
        dto.referenceType ?? header.getReferenceType() ?? null,
        dto.referenceId ?? header.getReferenceId() ?? null,
        dto.referenceNum ?? header.getReferenceNum() ?? null
      );
    }

    const updated = await this.repository.update(header.getId()!, header);
    return this.toDto(updated);
  }

  /**
   * Complete transaction - updates stock levels
   */
  async completeByPublicId(publicId: string): Promise<any> {
    const header = await this.repository.findByPublicId(publicId);
    if (!header) {
      throw new NotFoundException(`Transaction with Public ID ${publicId} not found`);
    }

    // Business validation and status change
    header.complete();

    // Update stock levels
    await this.stockService.updateStock(
      header.getType(),
      header.getFromWarehouseId(),
      header.getToWarehouseId(),
      header.getLines()
    );

    const updated = await this.repository.update(header.getId()!, header);
    return this.toDto(updated);
  }

  /**
   * Cancel transaction
   */
  async cancelByPublicId(publicId: string): Promise<any> {
    const header = await this.repository.findByPublicId(publicId);
    if (!header) {
      throw new NotFoundException(`Transaction with Public ID ${publicId} not found`);
    }

    header.cancel();

    const updated = await this.repository.update(header.getId()!, header);
    return this.toDto(updated);
  }

  /**
   * Delete transaction (only DRAFT status)
   */
  async removeByPublicId(publicId: string): Promise<any> {
    const header = await this.repository.findByPublicId(publicId);
    if (!header) {
      throw new NotFoundException(`Transaction with Public ID ${publicId} not found`);
    }

    if (header.getStatus() !== InvTransStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft transactions');
    }

    const deleted = await this.repository.delete(header.getId()!);
    return this.toDto(deleted);
  }

  /**
   * Add line to existing transaction
   */
  async addLine(publicId: string, lineDto: CreateInvTransLineDto): Promise<any> {
    const header = await this.repository.findByPublicId(publicId);
    if (!header) {
      throw new NotFoundException(`Transaction with Public ID ${publicId} not found`);
    }

    const line = new InvTransLine({
      lineNum: lineDto.lineNum,
      itemSkuId: lineDto.itemSkuId,
      quantity: lineDto.quantity,
      uomCode: lineDto.uomCode,
      note: lineDto.note,
    });

    header.addLine(line);

    const updated = await this.repository.update(header.getId()!, header);
    return this.toDto(updated);
  }

  /**
   * Remove line from transaction
   */
  async removeLine(publicId: string, lineNum: number): Promise<any> {
    const header = await this.repository.findByPublicId(publicId);
    if (!header) {
      throw new NotFoundException(`Transaction with Public ID ${publicId} not found`);
    }

    header.removeLine(lineNum);

    const updated = await this.repository.update(header.getId()!, header);
    return this.toDto(updated);
  }

  /**
   * Get transaction with all relations for detailed view
   */
  async findOneWithRelations(id: number): Promise<any | null> {
    return this.repository.findOneWithRelations(id);
  }

  /**
   * Convert domain entity to DTO
   */
  private toDto(header: InvTransHeader): any {
    return {
      id: header.getId(),
      publicId: header.getPublicId(),
      transNum: header.getTransNum(),
      type: header.getType(),
      status: header.getStatus(),
      fromWarehouseId: header.getFromWarehouseId(),
      toWarehouseId: header.getToWarehouseId(),
      referenceType: header.getReferenceType(),
      referenceId: header.getReferenceId(),
      referenceNum: header.getReferenceNum(),
      reasonCode: header.getReasonCode(),
      transactionDate: header.getTransactionDate(),
      note: header.getNote(),
      createdBy: header.getCreatedBy(),
      createdAt: header.getCreatedAt(),
      updatedAt: header.getUpdatedAt(),
      totalQuantity: header.getTotalQuantity(),
      lines: header.getLines().map(line => ({
        id: line.getId(),
        publicId: line.getPublicId(),
        lineNum: line.getLineNum(),
        itemSkuId: line.getItemSkuId(),
        quantity: line.getQuantity(),
        uomCode: line.getUomCode(),
        note: line.getNote(),
        createdAt: line.getCreatedAt(),
        updatedAt: line.getUpdatedAt(),
      })),
    };
  }
}
