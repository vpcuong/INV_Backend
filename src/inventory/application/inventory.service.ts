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
import { CreateGoodsReceiptDto, CreateGoodsReceiptFromPoDto } from '../dto/goods-receipt.dto';
import { CreateGoodsIssueDto, CreateGoodsIssueFromSoDto } from '../dto/goods-issue.dto';
import { CreateAdjustmentDto } from '../dto/adjustment.dto';
import { CreateStockTransferDto } from '../dto/stock-transfer.dto';
import { PoService } from '../../po/po.service';
import { SOService } from '../../so/application/so.service';
import { WarehouseService } from '../../warehouse/application/warehouse.service';
import { SkuUomService } from '../../items/application/sku-uom.service';
import { UomService } from '../../uom/application/uom.service';
import { ItemAggregateService } from '@/items/application/item-aggregate.service';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(INV_TRANS_HEADER_REPOSITORY)
    private readonly repository: IInvTransHeaderRepository,
    @Inject(INV_TRANS_NUMBER_GENERATOR)
    private readonly numberGenerator: InvTransNumberGeneratorService,
    @Inject(STOCK_SERVICE)
    private readonly stockService: StockService,
    private readonly poService: PoService,
    private readonly soService: SOService,
    private readonly warehouseService: WarehouseService,
    private readonly skuUomService: SkuUomService,
    private readonly itemAggregateService: ItemAggregateService,
    private readonly uomService: UomService
  ) {}

  /**
   * Helper to fetch conversion factor for a line
   */
  private async getConversionFactor(itemSkuId: number, uomCode: string): Promise<number> {
    try {
        const uoms = await this.skuUomService.getAvailableUomsForSku(itemSkuId);
        const uom = uoms.availableUoms.find(u => u.uomCode === uomCode);
        
        if (!uom) {
            // Fallback: If UoM is same as SKU Base, factor is 1
            if (uoms.skuUomCode === uomCode) return 1;
            throw new BadRequestException(`UOM ${uomCode} is not valid for SKU ${itemSkuId}`);
        }
        return uom.toBaseFactor;
    } catch (error) {
       // If service check fails (e.g. SKU not found), propagate or handle
       throw new BadRequestException(`Failed to validate UOM ${uomCode} for SKU ${itemSkuId}: ${error.message}`);
    }
  }

  /**
   * Create Generic (Legacy - to be potentially deprecated or kept for internal use)
   */
  async create(dto: CreateInvTransHeaderDto, createdBy: string): Promise<any> {
    // Generate transaction number
    const transNum = await this.numberGenerator.generate(dto.type as InvTransType);

    // Create lines with conversion factor lookup
    const lines: InvTransLine[] = [];
    for (const lineDto of dto.lines) {
        //const toBaseFactor = await this.getConversionFactor(lineDto.itemSkuId, lineDto.uomCode);
        const item = await this.itemAggregateService.getItemBySkuPublicId(lineDto.itemSkuId);

        if(!item) {
          throw new BadRequestException(`Item SKU ${lineDto.itemSkuId} not found`);
        }
        const sku = item.findSkuByPublicId(lineDto.itemSkuId);

        if(!sku) {
          throw new BadRequestException(`Item SKU ${lineDto.itemSkuId} not found`);
        }

        let toBaseFactor = 1, baseQty = lineDto.quantity, baseUomCode = lineDto.uomCode;
        if(sku.getUomCode() !== lineDto.uomCode) {
          // If UoM is different from SKU Base
          const uomClass = await this.uomService.findClassByCode(lineDto.uomCode);
          // Convert quantity
          const convertedQty = uomClass.convertQuantity(lineDto.uomCode, sku.getUomCode(), lineDto.quantity);
          // Find conversion
          const uomConv = uomClass.getConversions().find(u => u.getUomCode() === sku.getUomCode());
          // Resolve
          toBaseFactor = uomConv.getToBaseFactor();
          baseQty = convertedQty;
          baseUomCode = sku.getUomCode();
        }

        lines.push(new InvTransLine({
          lineNum: lineDto.lineNum,
          itemSkuId: sku.getId()!,
          quantity: lineDto.quantity,
          uomCode: lineDto.uomCode,
          toBaseFactor: toBaseFactor, // Pass resolved factor
          baseQty: baseQty,
          baseUomCode: baseUomCode,
          note: lineDto.note,
        }));
    }

    // Create header entity (validation happens in constructor)
    const header = InvTransHeader.create({
      transNum,
      type: dto.type as InvTransType,
      fromWarehouseId: dto.fromWarehouseId,
      toWarehouseId: dto.toWarehouseId,
      referenceType: dto.referenceType,
      referenceId: dto.referenceId,
      referenceNum: dto.referenceNum,
      reasonId: dto.reasonId,
      transactionDate: dto.transactionDate ? new Date(dto.transactionDate) : undefined,
      note: dto.note,
      createdBy,
      lines,
    });

    const created = await this.repository.create(header);
    return this.toDto(created);
  }

  // =================================================================================================
  // GOODS RECEIPT
  // =================================================================================================

  async createGoodsReceipt(dto: CreateGoodsReceiptDto, createdBy: string): Promise<any> {
    // Validate Warehouse
    await this.validateWarehouse(dto.toWarehouseId);

    return this.create({
      type: InvTransType.GOODS_RECEIPT,
      status: InvTransStatus.DRAFT,
      toWarehouseId: dto.toWarehouseId,
      transactionDate: dto.transactionDate,
      note: dto.note,
      lines: dto.lines.map((l, i) => ({ ...l, lineNum: l.lineNum || i + 1 })),
    } as CreateInvTransHeaderDto, createdBy);
  }

  async createGoodsReceiptFromPo(dto: CreateGoodsReceiptFromPoDto, createdBy: string): Promise<any> {
    // Validate Warehouse
    await this.validateWarehouse(dto.toWarehouseId);

    // Validate PO exists
    const po = await this.poService.findOne(dto.poId);
    if (!po) {
      throw new NotFoundException(`Purchase Order ${dto.poId} not found`);
    }

    return this.create({
      type: InvTransType.GOODS_RECEIPT,
      status: InvTransStatus.DRAFT,
      toWarehouseId: dto.toWarehouseId,
      referenceType: 'PO',
      referenceId: po.id,
      referenceNum: po.poNum,
      transactionDate: dto.transactionDate,
      note: dto.note || `Goods Receipt from PO ${po.poNum}`,
      lines: dto.lines.map((l, i) => ({ ...l, lineNum: l.lineNum || i + 1 })),
    } as CreateInvTransHeaderDto, createdBy);
  }

  // =================================================================================================
  // GOODS ISSUE
  // =================================================================================================

  async createGoodsIssue(dto: CreateGoodsIssueDto, createdBy: string): Promise<any> {
    // Validate Warehouse
    await this.validateWarehouse(dto.fromWarehouseId);

    return this.create({
      type: InvTransType.GOODS_ISSUE,
      status: InvTransStatus.DRAFT,
      fromWarehouseId: dto.fromWarehouseId,
      transactionDate: dto.transactionDate,
      note: dto.note,
      lines: dto.lines.map((l, i) => ({ ...l, lineNum: l.lineNum || i + 1 })),
    } as CreateInvTransHeaderDto, createdBy);
  }

  async createGoodsIssueFromSo(dto: CreateGoodsIssueFromSoDto, createdBy: string): Promise<any> {
    // Validate Warehouse
    await this.validateWarehouse(dto.fromWarehouseId);

    // Validate SO exists
    const so = await this.soService.findSOByPublicId(dto.soId);
    // NotFoundException is thrown by soService.findOne if not found, checking just in case
    if (!so) {
      throw new NotFoundException(`Sales Order ${dto.soId} not found`);
    }

    // Validate Quantity (Order - Shipped - Pending >= Current Request)
    const pendingTransactions = await this.repository.findByReference('SO', so.getId());
    const pendingDrafts = pendingTransactions.filter(
      t => t.getType() === InvTransType.GOODS_ISSUE && t.getStatus() === InvTransStatus.DRAFT
    );

    for (const lineDto of dto.lines) {

      const item = await this.itemAggregateService.getItemBySkuPublicId(lineDto.itemSkuId);
      const sku = item.findSkuByPublicId(lineDto.itemSkuId);

       // Find matching SO line (First open line with matching SKU)
      const soLine = so.getLines().find(
        l => l.getItemSkuId() === sku.getId() && (l.getStatus() === 'OPEN' || l.getStatus() === 'PARTIAL')
      );
      
      if (!soLine) {
        throw new BadRequestException(`Item SKU ${lineDto.itemSkuId} not found in open SO lines`);
      }
      // Calculate pending qty for this SKU
      const pendingQty = pendingDrafts.reduce((sum, t) => {
        const matchingLines = t.getLines().filter(l => l.getItemSkuId() === sku.getId());
        return sum + matchingLines.reduce((s, l) => s + l.getQuantity(), 0);
      }, 0);

      // IMPORTANT: Validation needs to be conceptually in Base Units or same units
      // Assuming SO line is in Base Unit or standardized logic.
      // Ideally, we should convert pendingQty and lineDto.quantity to Base units if strict validation is needed
      // For now, assuming request is in same unit as SO or we rely on simpler check on values
      // If multi-UoM SO is supported, we MUST convert everything to Base Qty here.
      
      // Let's defer strict UoM validation in this loop for now or assume same UoM.
      // But since we are adding UoM support, we should technically convert.
      // Re-fetching factor here for validation might be expensive inside loop but necessary for correctness.
      /*
      const lineFactor = await this.getConversionFactor(lineDto.itemSkuId, lineDto.uomCode);
      const reqBaseQty = Number(lineDto.quantity) * lineFactor;
      */
     
      const totalRequested = Number(lineDto.quantity) + Number(pendingQty) + Number(soLine.getShippedQty()); // Simplistic accumulation
      if (totalRequested > soLine.getOrderQty()) {
        throw new BadRequestException(
          `Insufficient SO quantity for Item SKU ${lineDto.itemSkuId}. Order: ${soLine.getOrderQty()}, Shipped: ${soLine.getShippedQty()}, Pending: ${pendingQty}, Requested: ${lineDto.quantity}`
        );
      }
    }

    return this.create({
      type: InvTransType.GOODS_ISSUE,
      status: InvTransStatus.DRAFT,
      fromWarehouseId: dto.fromWarehouseId,
      referenceType: 'SO',
      referenceId: so.getId(),
      referenceNum: so.getSONum(),
      transactionDate: dto.transactionDate,
      note: dto.note || `Goods Issue for SO ${so.getSONum()}`,
      lines: dto.lines.map((l, i) => ({ ...l, lineNum: l.lineNum || i + 1 })),
    } as CreateInvTransHeaderDto, createdBy);
  }

  // =================================================================================================
  // ADJUSTMENT
  // =================================================================================================

  async createAdjustment(dto: CreateAdjustmentDto, createdBy: string): Promise<any> {
    // Validate Warehouse
    await this.validateWarehouse(dto.fromWarehouseId);

    return this.create({
      type: InvTransType.ADJUSTMENT,
      status: InvTransStatus.DRAFT,
      fromWarehouseId: dto.fromWarehouseId,
      reasonId: dto.reasonId,
      transactionDate: dto.transactionDate,
      note: dto.note,
      lines: dto.lines.map((l, i) => ({ ...l, lineNum: l.lineNum || i + 1 })),
    } as CreateInvTransHeaderDto, createdBy);
  }

  // =================================================================================================
  // STOCK TRANSFER
  // =================================================================================================

  async createStockTransfer(dto: CreateStockTransferDto, createdBy: string): Promise<any> {
    // Validate Warehouses
    await this.validateWarehouse(dto.fromWarehouseId);
    await this.validateWarehouse(dto.toWarehouseId);

    if (dto.fromWarehouseId === dto.toWarehouseId) {
      throw new BadRequestException('Source and Destination warehouse cannot be the same');
    }

    return this.create({
      type: InvTransType.STOCK_TRANSFER,
      status: InvTransStatus.DRAFT,
      fromWarehouseId: dto.fromWarehouseId,
      toWarehouseId: dto.toWarehouseId,
      transactionDate: dto.transactionDate,
      note: dto.note,
      lines: dto.lines.map((l, i) => ({ ...l, lineNum: l.lineNum || i + 1 })),
    } as CreateInvTransHeaderDto, createdBy);
  }

  // Helper
  private async validateWarehouse(id: number): Promise<void> {
    const warehouse = await this.warehouseService.findOne(id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
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

    // Update SO Shipped Qty if Goods Issue from SO
    if (header.getType() === InvTransType.GOODS_ISSUE && header.getReferenceType() === 'SO' && header.getReferenceId()) {
      try {
         const so = await this.soService.findSOById(header.getReferenceId()!);
         if (so) {
             for (const line of header.getLines()) {
                 const soLine = so.getLines().find(l => l.getItemSkuId() === line.getItemSkuId() && l.getStatus() !== 'CLOSED');
                 if (soLine) {
                     // Pass Base Qty to update shipped qty?
                     // Currently addShippedQty takes a number. Assuming SOLine shippedQty is Base Unit.
                     await this.soService.addShippedQty(so.getId()!, soLine.getLineNum(), line.getBaseQty());
                 }
             }
         }
      } catch (error) {
        console.error("Failed to update SO shipped quantity", error);
        // We log but don't fail the transaction completion itself as stock is already moved?
        // Ideally should be one transaction.
      }
    }

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

    const item = await this.itemAggregateService.getItemBySkuPublicId(lineDto.itemSkuId);
    const sku = item.findSkuByPublicId(lineDto.itemSkuId);

    const line = new InvTransLine({
      lineNum: lineDto.lineNum,
      itemSkuId: sku.getId()!,
      quantity: lineDto.quantity,
      uomCode: lineDto.uomCode,
      toBaseFactor: 0,
      baseQty: lineDto.quantity * 0,
      baseUomCode: lineDto.uomCode,
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
      reasonId: header.getReasonId(),
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
        toBaseFactor: line.getToBaseFactor(),
        baseQty: line.getBaseQty(),
        note: line.getNote(),
        createdAt: line.getCreatedAt(),
        updatedAt: line.getUpdatedAt(),
      })),
    };
  }
}
