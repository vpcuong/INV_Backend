import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SOHeader } from '../domain/so-header.entity';
import { SOLine } from '../domain/so-line.entity';
import { ISOHeaderRepository } from '../domain/so-header.repository.interface';
import { SO_HEADER_REPOSITORY } from '../constant/so.token';
import { CreateSOHeaderDto } from '../dto/create-so-header.dto';
import { UpdateSOHeaderDto } from '../dto/update-so-header.dto';
import { UpdateSOWithLinesDto } from '../dto/update-so-with-lines.dto';
import { AuditLoggerService } from '../common/audit-logger.service';

/**
 * Application Service - Orchestrates SO use cases
 */
@Injectable()
export class SOService {
  constructor(
    @Inject(SO_HEADER_REPOSITORY)
    private readonly soHeaderRepository: ISOHeaderRepository,
    private readonly auditLogger: AuditLoggerService
  ) {}

  /**
   * Use Case: Create new Sales Order
   */
  async create(createDto: CreateSOHeaderDto): Promise<any> {
    // Auto-generate SO number if not provided
    const soNum = createDto.soNum || (await this.generateSONumber());

    // Check for duplicate SO number
    const existing = await this.soHeaderRepository.findBySONum(soNum);
    if (existing) {
      throw new BadRequestException(`SO number ${soNum} already exists`);
    }

    // Create lines
    const lines = createDto.lines
      ? createDto.lines.map(
          (line) =>
            new SOLine({
              lineNum: line.lineNum || 0,
              itemId: line.itemId,
              itemSkuId: line.itemSkuId,
              itemCode: line.itemCode,
              description: line.description,
              orderQty: line.orderQty,
              uomCode: line.uomCode,
              unitPrice: line.unitPrice,
              lineDiscountPercent: line.pricing?.discountPercent,
              lineDiscountAmount: line.pricing?.discountAmount,
              lineTaxPercent: line.pricing?.taxPercent,
              lineTaxAmount: line.pricing?.taxAmount,
              lineTotal: line.lineTotal,
              needByDate: line.needByDate,
              lineStatus: line.lineStatus,
              openQty: line.openQty,
              shippedQty: line.shippedQty,
              warehouseCode: line.warehouseCode,
              lineNote: line.lineNote,
            })
        )
      : [];

    // Create domain entity
    const soHeader = SOHeader.create({
      soNum,
      customerId: createDto.customerId,
      orderDate: createDto.orderDate,
      requestDate: createDto.requestDate,
      needByDate: createDto.needByDate,
      orderStatus: createDto.orderStatus,
      totalLineAmount: createDto.totalLineAmount,
      headerDiscount: createDto.headerDiscountAmount,
      headerDiscountPercent: createDto.headerDiscountPercent,
      lineDiscounts: lines.map((line) => line.getLineDiscountAmount() || 0),
      taxes: lines.map((line) => line.getLineTaxAmount() || 0),
      charges: [],
      openAmount: createDto.openAmount,
      billingAddressId: createDto.addresses?.billingAddressId,
      shippingAddressId: createDto.addresses?.shippingAddressId,
      channel: createDto.metadata?.channel,
      fobCode: createDto.metadata?.fobCode,
      shipViaCode: createDto.metadata?.shipViaCode,
      paymentTermCode: createDto.metadata?.paymentTermCode,
      currencyCode: createDto.metadata?.currencyCode,
      exchangeRate: createDto.metadata?.exchangeRate,
      customerPoNum: createDto.metadata?.customerPoNum,
      headerNote: createDto.metadata?.headerNote,
      internalNote: createDto.metadata?.internalNote,
      createdBy: createDto.createdBy,
      lines,
    });

    const saved = await this.soHeaderRepository.create(soHeader);

    // Audit log
    this.auditLogger.logSOCreated(saved.getId()!, saved.getSONum());

    return this.findOneWithRelations(saved.getId()!);
  }

  /**
   * Use Case: Get all Sales Orders
   */
  async findAll(): Promise<any[]> {
    const headers = await this.soHeaderRepository.findAll();
    const headersWithRelations = await Promise.all(
      headers.map(async (header) => this.findOneWithRelations(header.getId()!))
    );
    return headersWithRelations;
  }

  /**
   * Use Case: Get Sales Order by ID
   */
  async findOne(id: number): Promise<any> {
    const soHeader = await this.soHeaderRepository.findOne(id);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }
    return this.findOneWithRelations(id);
  }

  /**
   * Use Case: Get Sales Order by SO Number
   */
  async findBySONum(soNum: string): Promise<any> {
    const soHeader = await this.soHeaderRepository.findBySONum(soNum);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order ${soNum} not found`);
    }
    return this.findOneWithRelations(soHeader.getId()!);
  }

  /**
   * Use Case: Update Sales Order
   */
  async update(id: number, updateDto: UpdateSOHeaderDto): Promise<any> {
    const soHeader = await this.soHeaderRepository.findOne(id);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }

    // Update discount if provided
    if (updateDto.headerDiscountAmount !== undefined) {
      soHeader.updateDiscount(updateDto.headerDiscountAmount);
    }

    // Update addresses if provided
    if (updateDto.addresses) {
      soHeader.updateAddresses(
        updateDto.addresses.billingAddressId || null,
        updateDto.addresses.shippingAddressId || null
      );
    }

    // Update shipping details if provided
    if (updateDto.metadata?.shipViaCode || updateDto.metadata?.fobCode) {
      soHeader.updateShippingDetails(
        updateDto.metadata.shipViaCode || null,
        updateDto.metadata.fobCode || null
      );
    }

    // Update notes if provided
    if (updateDto.metadata?.headerNote || updateDto.metadata?.internalNote) {
      soHeader.updateNotes(
        updateDto.metadata.headerNote || null,
        updateDto.metadata.internalNote || null
      );
    }

    const updated = await this.soHeaderRepository.update(id, soHeader);

    // Audit log
    const changes: Record<string, any> = {};
    if (updateDto.headerDiscountAmount !== undefined)
      changes.headerDiscountAmount = updateDto.headerDiscountAmount;
    if (updateDto.addresses?.billingAddressId !== undefined)
      changes.billingAddressId = updateDto.addresses.billingAddressId;
    if (updateDto.addresses?.shippingAddressId !== undefined)
      changes.shippingAddressId = updateDto.addresses.shippingAddressId;
    if (updateDto.metadata) changes.metadata = updateDto.metadata;

    this.auditLogger.logSOUpdated(
      updated.getId()!,
      updated.getSONum(),
      changes
    );

    return this.findOneWithRelations(updated.getId()!);
  }

  /**
   * Use Case: Update Sales Order with Lines
   * Uses transaction to ensure atomicity
   */
  async updateWithLines(id: number, dto: UpdateSOWithLinesDto): Promise<any> {
    return await this.soHeaderRepository.transaction(async (txRepo) => {
      const soHeader = await txRepo.findOne(id);
      if (!soHeader) {
        throw new NotFoundException(`Sales Order with ID ${id} not found`);
      }

      // Update header fields if provided
      if (dto.header) {
        if (dto.header.headerDiscountAmount !== undefined) {
          soHeader.updateDiscount(dto.header.headerDiscountAmount);
        }
        if (dto.header.addresses) {
          soHeader.updateAddresses(
            dto.header.addresses.billingAddressId || null,
            dto.header.addresses.shippingAddressId || null
          );
        }
        if (dto.header.metadata?.shipViaCode || dto.header.metadata?.fobCode) {
          soHeader.updateShippingDetails(
            dto.header.metadata.shipViaCode || null,
            dto.header.metadata.fobCode || null
          );
        }
        if (
          dto.header.metadata?.headerNote ||
          dto.header.metadata?.internalNote
        ) {
          soHeader.updateNotes(
            dto.header.metadata.headerNote || null,
            dto.header.metadata.internalNote || null
          );
        }
      }

      // Handle line deletions
      if (dto.linesToDelete && dto.linesToDelete.length > 0) {
        const currentLines = soHeader.getLines();
        const lineIdsToDelete = new Set(dto.linesToDelete);

        currentLines.forEach((line) => {
          if (lineIdsToDelete.has(line.getId()!)) {
            soHeader.removeLine(line.getLineNum());
          }
        });
      }

      // Handle line updates/additions
      if (dto.lines && dto.lines.length > 0) {
        for (const lineDto of dto.lines) {
          if (lineDto.id) {
            // Update existing line - need to remove and add back
            const currentLines = soHeader.getLines();
            const existingLine = currentLines.find(
              (line) => line.getId() === lineDto.id
            );
            if (existingLine) {
              soHeader.removeLine(existingLine.getLineNum());
            }
          }

          // Add/re-add line
          const newLine = new SOLine({
            id: lineDto.id,
            lineNum: lineDto.lineNum || 0,
            itemId: lineDto.itemId,
            itemSkuId: lineDto.itemSkuId,
            itemCode: lineDto.itemCode,
            description: lineDto.description,
            orderQty: lineDto.orderQty,
            uomCode: lineDto.uomCode,
            unitPrice: lineDto.unitPrice,
            lineDiscountPercent: lineDto.pricing?.discountPercent,
            lineDiscountAmount: lineDto.pricing?.discountAmount,
            lineTaxPercent: lineDto.pricing?.taxPercent,
            lineTaxAmount: lineDto.pricing?.taxAmount,
            lineTotal: lineDto.lineTotal,
            needByDate: lineDto.needByDate,
            lineStatus: lineDto.lineStatus,
            openQty: lineDto.openQty,
            shippedQty: lineDto.shippedQty,
            warehouseCode: lineDto.warehouseCode,
            lineNote: lineDto.lineNote,
          });
          soHeader.addLine(newLine);
        }
      }

      const updated = await txRepo.update(id, soHeader);

      // Audit log
      const linesAdded = dto.lines?.filter((l) => !l.id).length || 0;
      const linesUpdated = dto.lines?.filter((l) => l.id).length || 0;
      const linesDeleted = dto.linesToDelete?.length || 0;

      this.auditLogger.logSOLinesUpdated(
        updated.getId()!,
        updated.getSONum(),
        linesAdded,
        linesUpdated,
        linesDeleted
      );

      return this.findOneWithRelations(updated.getId()!);
    });
  }

  /**
   * Use Case: Hold Sales Order
   */
  async hold(id: number): Promise<any> {
    const soHeader = await this.soHeaderRepository.findOne(id);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }

    const oldStatus = soHeader.getStatus();
    soHeader.hold();
    const updated = await this.soHeaderRepository.update(id, soHeader);

    // Audit log
    this.auditLogger.logSOStatusChanged(
      updated.getId()!,
      updated.getSONum(),
      oldStatus,
      'ON_HOLD'
    );

    return this.findOneWithRelations(updated.getId()!);
  }

  /**
   * Use Case: Release from Hold
   */
  async release(id: number): Promise<any> {
    const soHeader = await this.soHeaderRepository.findOne(id);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }

    const oldStatus = soHeader.getStatus();
    soHeader.release();
    const updated = await this.soHeaderRepository.update(id, soHeader);

    // Audit log
    this.auditLogger.logSOStatusChanged(
      updated.getId()!,
      updated.getSONum(),
      oldStatus,
      'OPEN'
    );

    return this.findOneWithRelations(updated.getId()!);
  }

  /**
   * Use Case: Cancel Sales Order
   */
  async cancel(id: number): Promise<any> {
    const soHeader = await this.soHeaderRepository.findOne(id);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }

    const oldStatus = soHeader.getStatus();
    soHeader.cancel();
    const updated = await this.soHeaderRepository.update(id, soHeader);

    // Audit log
    this.auditLogger.logSOStatusChanged(
      updated.getId()!,
      updated.getSONum(),
      oldStatus,
      'CANCELLED'
    );

    return this.findOneWithRelations(updated.getId()!);
  }

  /**
   * Use Case: Complete Sales Order
   */
  async complete(id: number): Promise<any> {
    const soHeader = await this.soHeaderRepository.findOne(id);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }

    const oldStatus = soHeader.getStatus();
    soHeader.complete();
    const updated = await this.soHeaderRepository.update(id, soHeader);

    // Audit log
    this.auditLogger.logSOStatusChanged(
      updated.getId()!,
      updated.getSONum(),
      oldStatus,
      'CLOSED'
    );

    return this.findOneWithRelations(updated.getId()!);
  }

  /**
   * Use Case: Delete Sales Order
   */
  async remove(id: number): Promise<any> {
    const soHeader = await this.soHeaderRepository.findOne(id);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }

    const soNum = soHeader.getSONum();
    const deleted = await this.soHeaderRepository.delete(id);

    // Audit log
    this.auditLogger.logSODeleted(id, soNum);

    return this.toDto(deleted);
  }

  /**
   * Generate SO number
   */
  private async generateSONumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SO${year}`;

    const lastSO = await this.soHeaderRepository.findLastSOByPrefix(prefix);

    let nextNum = 1;
    if (lastSO) {
      const lastNum = parseInt(lastSO.soNum.replace(prefix, ''));
      nextNum = lastNum + 1;
    }

    return `${prefix}${nextNum.toString().padStart(6, '0')}`;
  }

  /**
   * Get SO with all relations
   */
  private async findOneWithRelations(id: number): Promise<any> {
    const soHeader = await this.soHeaderRepository.findOneWithRelations(id);

    if (!soHeader) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }

    return soHeader;
  }

  /**
   * Convert domain entity to DTO
   */
  private toDto(soHeader: SOHeader): any {
    const pricing = soHeader.getPricing();
    const addresses = soHeader.getAddresses();
    const metadata = soHeader.getMetadata();

    return {
      id: soHeader.getId(),
      soNum: soHeader.getSONum(),
      customerId: soHeader.getCustomerId(),
      orderDate: soHeader.getOrderDate(),
      requestDate: soHeader.getRequestDate(),
      needByDate: soHeader.getNeedByDate(),
      orderStatus: soHeader.getStatus(),
      totalLineAmount: pricing.getTotalLineAmount(),
      headerDiscountAmount: pricing.getHeaderDiscount(),
      totalDiscount: pricing.getTotalDiscount(),
      totalTax: pricing.getTotalTax(),
      totalCharges: pricing.getTotalCharges(),
      orderTotal: pricing.getOrderTotal(),
      billingAddressId: addresses.getBillingAddressId(),
      shippingAddressId: addresses.getShippingAddressId(),
      channel: metadata.getChannel(),
      fobCode: metadata.getFobCode(),
      shipViaCode: metadata.getShipViaCode(),
      paymentTermCode: metadata.getPaymentTermCode(),
      currencyCode: metadata.getCurrencyCode(),
      exchangeRate: metadata.getExchangeRate(),
      customerPoNum: metadata.getCustomerPoNum(),
      headerNote: metadata.getHeaderNote(),
      internalNote: metadata.getInternalNote(),
      createdAt: soHeader.getCreatedAt(),
      updatedAt: soHeader.getUpdatedAt(),
      lines: soHeader.getLines().map((line) => ({
        id: line.getId(),
        lineNum: line.getLineNum(),
        itemId: line.getItemId(),
        itemSkuId: line.getItemSkuId(),
        itemCode: line.getItemCode(),
        description: line.getDescription(),
        orderQty: line.getOrderQty(),
        uomCode: line.getUomCode(),
        unitPrice: line.getUnitPrice(),
        lineDiscountPercent: line.getLineDiscountPercent(),
        lineDiscountAmount: line.getLineDiscountAmount(),
        lineTaxPercent: line.getLineTaxPercent(),
        lineTaxAmount: line.getLineTaxAmount(),
        lineTotal: line.getLineTotal(),
        needByDate: line.getNeedByDate(),
        lineStatus: line.getLineStatus(),
        openQty: line.getOpenQty(),
        shippedQty: line.getShippedQty(),
        warehouseCode: line.getWarehouseCode(),
        lineNote: line.getLineNote(),
        createdAt: line.getCreatedAt(),
        updatedAt: line.getUpdatedAt(),
      })),
    };
  }
}
