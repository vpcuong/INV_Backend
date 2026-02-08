import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SOHeader } from '../domain/so-header.entity';
import { SOLine } from '../domain/so-line.entity';
import { ISOHeaderRepository } from '../domain/so-header.repository.interface';
import {
  SO_HEADER_REPOSITORY,
  SO_NUMBER_GENERATOR,
  EXCHANGE_RATE_SERVICE,
  ITEM_REPOSITORY,
} from '../constant/so.token';
import { CreateSOHeaderDto } from '../dto/create-so-header.dto';
import { UpdateSOHeaderDto } from '../dto/update-so-header.dto';
import { UpdateSOWithLinesDto } from '../dto/update-so-with-lines.dto';
import { UpdateSOLineDto } from '../dto/update-so-line.dto';
import { AuditLoggerService } from '../common/audit-logger.service';
import { SONumberGeneratorService } from '../domain/services/so-number-generator.service';
import { IExchangeRateService } from '../domain/services/exchange-rate.service';
import { IItemRepository } from 'src/items/domain/item.repository.interface';
import { ItemAggregateService } from '@/items/application/item-aggregate.service';
import { CreateSOLineDto } from '../dto/composed/create-so-line.dto';

/**
 * Application Service - Orchestrates SO use cases
 */
@Injectable()
export class SOService {
  constructor(
    @Inject(SO_HEADER_REPOSITORY)
    private readonly soHeaderRepository: ISOHeaderRepository,
    @Inject(SO_NUMBER_GENERATOR)
    private readonly soNumberGenerator: SONumberGeneratorService,
    @Inject(EXCHANGE_RATE_SERVICE)
    private readonly exchangeRateService: IExchangeRateService,
    @Inject(ITEM_REPOSITORY)
    private readonly itemRepository: IItemRepository,
    private readonly auditLogger: AuditLoggerService,
    private readonly itemAggregateService: ItemAggregateService
  ) {}

  /**
   * Use Case: Create new Sales Order
   */
  async create(createDto: CreateSOHeaderDto, createdBy: string): Promise<any> {
    const itemSkus = await Promise.all(
      createDto.lines.map(async (line) => {
        const item = await this.itemAggregateService.getItemBySkuPublicId(line.itemSkuId);
        const itemSku = item.findSkuByPublicId(line.itemSkuId);
        if (!itemSku) {
          throw new NotFoundException(
            `Item with ID ${line.itemSkuId} not found`
          );
        }
        return itemSku;
      })
    );
    // Auto-generate SO number using domain service
    const soNum = await this.soNumberGenerator.generate();

    // Check for duplicate SO number
    const existing = await this.soHeaderRepository.findBySONum(soNum);
    if (existing) {
      throw new BadRequestException(`SO number ${soNum} already exists`);
    }

    // Create lines with calculated fields
    const lines = createDto.lines
      ? createDto.lines.map((lineDto, index) => {
         
          return new SOLine({
            lineNum: lineDto.lineNum || index + 1, // Auto-generate line number
            itemSkuId: itemSkus[index].getId(),
            description: lineDto.description,
            orderQty: lineDto.orderQty,
            uomCode: lineDto.uomCode || '', // Should ideally be required or fetched
            unitPrice: lineDto.unitPrice,
            discountPercent: lineDto.pricing?.discountType === 'PERCENT' ? lineDto.pricing?.discountValue : 0,
            discountAmount: lineDto.pricing?.discountType === 'AMOUNT' ? lineDto.pricing?.discountValue : 0,
            taxPercent: lineDto.pricing?.taxPercent,
            //taxAmount: taxAmount,
            //totalAmount: totalAmount,
            needByDate: lineDto.needByDate,
            // Calculated fields - not from DTO
            status: 'OPEN', // Default status
            warehouseCode: lineDto.warehouseCode,
            lineNote: lineDto.lineNote,
          });
        })
      : [];

    // Create domain entity with calculated fields
    // NOTE: We don't need to manually calculate totalAmount or discountAmount logic here anymore
    // The SOHeader.create() will internally call SOPricing.recalculate() based on the lines provided.
    const soHeader = SOHeader.create({
      soNum,
      customerId: createDto.customerId,
      orderDate: createDto.orderDate || new Date(),
      requestDate: createDto.requestDate,
      needByDate: createDto.needByDate,
      // Calculated fields - not from DTO
      orderStatus: 'OPEN', // Default status for new SO
      // Pricing - Only need to pass user inputs (percents/fixed amounts)
      discountPercent: createDto?.discountType === 'PERCENT' ? createDto.discountValue: undefined,
      discountAmount: createDto?.discountType === 'AMOUNT' ? createDto.discountValue: undefined,
      
      billingAddressId: createDto.addresses?.billingAddressId,
      shippingAddressId: createDto.addresses?.shippingAddressId,
      channel: createDto.metadata?.channel,
      fobCode: createDto.metadata?.fobCode,
      shipViaCode: createDto.metadata?.shipViaCode,
      paymentTermCode: createDto.metadata?.paymentTermCode,
      currencyCode: createDto.metadata?.currencyCode || 'USD',
      customerPoNum: createDto.metadata?.customerPoNum,
      headerNote: createDto.metadata?.headerNote,
      internalNote: createDto.metadata?.internalNote,
      createdBy,
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
   * Use Case: Get Sales Order by ID
   */
  async findSOById(id: number): Promise<SOHeader> {
    const soHeader = await this.soHeaderRepository.findOne(id);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }
    return soHeader;
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
   * Use Case: Get Sales Order by Public ID
   */
  async findByPublicId(publicId: string): Promise<any> {
    const soHeader = await this.soHeaderRepository.findByPublicId(publicId);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with public ID ${publicId} not found`);
    }
    return this.findOneWithRelations(soHeader.getId()!);
  }

  async findSOByPublicId(publicId: string): Promise<SOHeader> {
    const soHeader = await this.soHeaderRepository.findByPublicId(publicId);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with public ID ${publicId} not found`);
    }
    return soHeader;
  }

  /**
   * Use Case: Update Sales Order by Public ID
   */
  async updateByPublicId(
    publicId: string,
    updateDto: UpdateSOHeaderDto
  ): Promise<any> {
    const soHeader = await this.soHeaderRepository.findByPublicId(publicId);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with public ID ${publicId} not found`);
    }

    // Delegate to existing update logic using internal ID
    return this.update(soHeader.getId()!, updateDto);
  }

  /**
   * Use Case: Add line to Sales Order by Public ID
   */
  async addLineByPublicId(publicId: string, lineDto: CreateSOLineDto): Promise<any> {
    // Resolve item SKU before transaction (read-only, no need to be in tx)
    const item = await this.itemAggregateService.getItemBySkuPublicId(lineDto.itemSkuId);
    const sku = item.findSkuByPublicId(lineDto.itemSkuId);
    if (!sku) {
      throw new NotFoundException(`Item SKU with public ID ${lineDto.itemSkuId} not found`);
    }

    return await this.soHeaderRepository.transaction(async (txRepo) => {
      let soHeader = await txRepo.findByPublicId(publicId);
      if (!soHeader) {
        throw new NotFoundException(`Sales Order with public ID ${publicId} not found`);
      }

      // Check SO status - cannot add line to cancelled/closed orders
      const status = soHeader.getStatus();
      if (status === 'CANCELLED' || status === 'CLOSED') {
        throw new BadRequestException(`Cannot add line to ${status} sales order`);
      }

      // Calculate next line number
      const currentLines = soHeader.getLines();
      const nextLineNum = currentLines.length > 0
        ? Math.max(...currentLines.map(l => l.getLineNum())) + 1
        : 1;

      const lineNum = lineDto.lineNum || nextLineNum;

      // Check duplicate lineNum
      const duplicateLine = currentLines.find(l => l.getLineNum() === lineNum);
      if (duplicateLine) {
        throw new BadRequestException(`Line number ${lineNum} already exists in SO ${soHeader.getSONum()}`);
      }

      // Create new line
      const newLine = new SOLine({
        lineNum,
        itemSkuId: sku.getId(),
        description: lineDto.description,
        orderQty: lineDto.orderQty,
        uomCode: lineDto.uomCode,
        unitPrice: lineDto.unitPrice,
        discountPercent: lineDto.pricing?.discountType === 'PERCENT' ? lineDto.pricing?.discountValue : undefined,
        discountAmount: lineDto.pricing?.discountType === 'AMOUNT' ? lineDto.pricing?.discountValue : undefined,
        taxPercent: lineDto.pricing?.taxPercent,
        needByDate: lineDto.needByDate,
        status: 'OPEN',
        warehouseCode: lineDto.warehouseCode,
        lineNote: lineDto.lineNote,
      });

      // Add line to SO - entity will auto-recalculate header totals
      soHeader.addLine(newLine);

      // Persist changes
      const updated = await txRepo.update(soHeader.getId()!, soHeader);

      // Audit log
      this.auditLogger.logSOLinesUpdated(
        updated.getId()!,
        updated.getSONum(),
        1, // linesAdded
        0, // linesUpdated
        0  // linesDeleted
      );

      return this.findOneWithRelations(updated.getId()!);
    });
  }

  /**
   * Use Case: Update a single SO line by public IDs
   */
  async updateLineByPublicId(
    headerPublicId: string,
    linePublicId: string,
    updateDto: UpdateSOLineDto
  ): Promise<any> {
    return await this.soHeaderRepository.transaction(async (txRepo) => {
      let soHeader = await txRepo.findByPublicId(headerPublicId);
      if (!soHeader) {
        throw new NotFoundException(
          `Sales Order with public ID ${headerPublicId} not found`
        );
      }

      // Check SO status - cannot update line on cancelled/closed orders
      const status = soHeader.getStatus();
      if (status === 'CANCELLED' || status === 'CLOSED') {
        throw new BadRequestException(`Cannot update line on ${status} sales order`);
      }

      const lines = soHeader.getLines();
      const existingLine = lines.find((line) => line.getPublicId() === linePublicId);
      if (!existingLine) {
        throw new NotFoundException(
          `Line with public ID ${linePublicId} not found in SO ${soHeader.getSONum()}`
        );
      }

      // Apply updates on the existing line entity using domain methods
      if (updateDto.unitPrice !== undefined) {
        existingLine.updateUnitPrice(updateDto.unitPrice);
      }

      if (updateDto.orderQty !== undefined) {
        existingLine.updateQuantity(updateDto.orderQty);
      }

      if (updateDto.pricing) {
        if (updateDto.pricing.discountValue !== undefined) {
          const discountPercent = updateDto.pricing.discountType === 'PERCENT' ? updateDto.pricing.discountValue : undefined;
          const discountAmount = updateDto.pricing.discountType === 'AMOUNT' ? updateDto.pricing.discountValue : undefined;
          existingLine.updateDiscount(discountPercent, discountAmount);
        }
        if (updateDto.pricing.taxPercent !== undefined) {
          existingLine.updateTax(updateDto.pricing.taxPercent);
        }
      }

      // Trigger header pricing recalculation after line update
      // Since the line was mutated in place, we just need to trigger recalc
      // Note: The line's rowMode is already set to UPDATED by the domain methods

      // Persist changes
      const updated = await txRepo.update(soHeader.getId()!, soHeader);

      // Audit log
      this.auditLogger.logSOLinesUpdated(
        updated.getId()!,
        updated.getSONum(),
        0, // linesAdded
        1, // linesUpdated
        0  // linesDeleted
      );

      return this.findOneWithRelations(updated.getId()!);
    });
  }

  /**
   * Use Case: Delete line by public IDs
   */
  async deleteLineByPublicId(
    headerPublicId: string,
    linePublicId: string
  ): Promise<any> {
    const soHeader = await this.soHeaderRepository.findByPublicId(headerPublicId);
    if (!soHeader) {
      throw new NotFoundException(
        `Sales Order with public ID ${headerPublicId} not found`
      );
    }

    const lines = soHeader.getLines();
    const lineToDelete = lines.find((line) => line.getPublicId() === linePublicId);
    if (!lineToDelete) {
      throw new NotFoundException(
        `Line with public ID ${linePublicId} not found in SO ${soHeader.getSONum()}`
      );
    }

    // Use lineNum to delete (internal logic unchanged)
    return this.deleteLine(soHeader.getId()!, lineToDelete.getLineNum());
  }

  /**
   * Use Case: Update Sales Order with Lines by Public ID
   */
  async updateWithLinesByPublicId(
    publicId: string,
    dto: UpdateSOWithLinesDto
  ): Promise<any> {
    const soHeader = await this.soHeaderRepository.findByPublicId(publicId);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with public ID ${publicId} not found`);
    }

    // Delegate to existing updateWithLines logic using internal ID
    return this.updateWithLines(soHeader.getId()!, dto);
  }

  /**
   * Use Case: Hold Sales Order by Public ID
   */
  async holdByPublicId(publicId: string): Promise<any> {
    const soHeader = await this.soHeaderRepository.findByPublicId(publicId);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with public ID ${publicId} not found`);
    }

    return this.hold(soHeader.getId()!);
  }

  /**
   * Use Case: Release from Hold by Public ID
   */
  async releaseByPublicId(publicId: string): Promise<any> {
    const soHeader = await this.soHeaderRepository.findByPublicId(publicId);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with public ID ${publicId} not found`);
    }

    return this.release(soHeader.getId()!);
  }

  /**
   * Use Case: Cancel Sales Order by Public ID
   */
  async cancelByPublicId(publicId: string): Promise<any> {
    const soHeader = await this.soHeaderRepository.findByPublicId(publicId);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with public ID ${publicId} not found`);
    }

    return this.cancel(soHeader.getId()!);
  }

  /**
   * Use Case: Complete Sales Order by Public ID
   */
  async completeByPublicId(publicId: string): Promise<any> {
    const soHeader = await this.soHeaderRepository.findByPublicId(publicId);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with public ID ${publicId} not found`);
    }

    return this.complete(soHeader.getId()!);
  }

  /**
   * Use Case: Delete Sales Order by Public ID
   */
  async removeByPublicId(publicId: string): Promise<any> {
    const soHeader = await this.soHeaderRepository.findByPublicId(publicId);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with public ID ${publicId} not found`);
    }

    return this.remove(soHeader.getId()!);
  }

  /**
   * Use Case: Update Sales Order
   */
  async update(id: number, updateDto: UpdateSOHeaderDto): Promise<any> {
    let soHeader = await this.soHeaderRepository.findOne(id);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }

    // Update discount if provided
    if (updateDto.discountValue !== undefined && updateDto.discountType) {
      if (updateDto.discountType === 'AMOUNT') {
        soHeader.updateDiscountAmount(updateDto.discountValue);
      } else {
        soHeader.updateDiscountPercent(updateDto.discountValue);
      }
    }

    // Update root fields if provided
    if (
      updateDto.orderDate ||
      updateDto.requestDate !== undefined ||
      updateDto.needByDate !== undefined
    ) {
      soHeader.updateDates({
        orderDate: updateDto.orderDate,
        requestDate: updateDto.requestDate,
        needByDate: updateDto.needByDate,
      });
    }

    if (updateDto.orderStatus) {
      soHeader.updateStatus(updateDto.orderStatus);
    }

    // Update addresses if provided
    if (updateDto.addresses) {
      soHeader.updateAddresses(
        updateDto.addresses.billingAddressId || null,
        updateDto.addresses.shippingAddressId || null
      );
    }

    // Update metadata if provided
    if (updateDto.metadata) {
      soHeader.updateMetadata(updateDto.metadata);
    }

    const updated = await this.soHeaderRepository.update(id, soHeader);

    // Audit log
    const changes: Record<string, any> = {};
    if (updateDto.discountValue !== undefined && updateDto.discountType)
      changes.discount = { type: updateDto.discountType, value: updateDto.discountValue };
    if (updateDto.orderStatus) changes.orderStatus = updateDto.orderStatus;
    if (updateDto.addresses) changes.addresses = updateDto.addresses;
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
      let soHeader = await txRepo.findOne(id);
      if (!soHeader) {
        throw new NotFoundException(`Sales Order with ID ${id} not found`);
      }

      // Update header fields if provided
      if (dto.header) {
        if (dto.header.discountValue !== undefined && dto.header.discountType) {
          if (dto.header.discountType === 'AMOUNT') {
            soHeader.updateDiscountAmount(dto.header.discountValue);
          } else {
            soHeader.updateDiscountPercent(dto.header.discountValue);
          }
        }

        // Update root fields if provided
        if (
          dto.header.orderDate ||
          dto.header.requestDate !== undefined ||
          dto.header.needByDate !== undefined
        ) {
          soHeader.updateDates({
            orderDate: dto.header.orderDate,
            requestDate: dto.header.requestDate,
            needByDate: dto.header.needByDate,
          });
        }

        if (dto.header.orderStatus) {
          soHeader.updateStatus(dto.header.orderStatus);
        }

        if (dto.header.addresses) {
          soHeader.updateAddresses(
            dto.header.addresses.billingAddressId || null,
            dto.header.addresses.shippingAddressId || null
          );
        }

        if (dto.header.metadata) {
          soHeader.updateMetadata(dto.header.metadata);
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

          // Calculate line total: (qty * price) - discount + tax
          const subtotal = lineDto.orderQty * lineDto.unitPrice;
          //
          const item = await this.itemAggregateService.getItemBySkuPublicId(lineDto.itemSkuId);
          const sku = item.findSkuByPublicId(lineDto.itemSkuId);
          //
          const newLine = new SOLine({
            id: lineDto.id,
            lineNum: lineDto.lineNum || 0,
            itemSkuId: sku.getId(),
            description: lineDto.description,
            orderQty: lineDto.orderQty,
            uomCode: lineDto.uomCode,
            unitPrice: lineDto.unitPrice,
            discountPercent: lineDto.pricing?.discountType === 'PERCENT' ? lineDto.pricing?.discountValue : 0,
            discountAmount: lineDto.pricing?.discountType === 'AMOUNT' ? lineDto.pricing?.discountValue : 0,
            taxPercent: lineDto.pricing?.taxPercent,
            needByDate: lineDto.needByDate,
            // For updates, preserve existing status/quantities if it's an update
            // For new lines, use defaults
            status: lineDto.id ? undefined : 'OPEN',
            warehouseCode: lineDto.warehouseCode,
            lineNote: lineDto.lineNote,
          });
          // Entity will auto-recalculate header totals!
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
   * Use Case: Delete SO Line
   * Remove a specific line from the sales order
   */
  async deleteLine(soId: number, lineNum: number): Promise<any> {
    const soHeader = await this.soHeaderRepository.findOne(soId);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order with ID ${soId} not found`);
    }

    // Check if line exists
    const lines = soHeader.getLines();
    const lineToDelete = lines.find((line) => line.getLineNum() === lineNum);
    if (!lineToDelete) {
      throw new NotFoundException(
        `Line number ${lineNum} not found in SO ${soHeader.getSONum()}`
      );
    }

    // Remove line using domain method
    // Entity will auto-recalculate header totals!
    soHeader.removeLine(lineNum);

    // Persist changes
    const updated = await this.soHeaderRepository.update(soId, soHeader);

    // Audit log
    this.auditLogger.logSOLinesUpdated(
      updated.getId()!,
      updated.getSONum(),
      0, // linesAdded
      0, // linesUpdated
      1 // linesDeleted
    );

    return this.findOneWithRelations(updated.getId()!);
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
      // Pricing
      discountPercent: pricing.getDiscountPercent(),
      discountAmount: pricing.getDiscountAmount(),
      taxAmount: pricing.getTaxAmount(),
      totalAmount: pricing.getTotalAmount(),
      subtotalAmount: pricing.getSubtotalAmount(),
      totalLinesDiscountAmount: pricing.getTotalLinesDiscountAmount(),
      
      billingAddressId: addresses.getBillingAddressId(),
      shippingAddressId: addresses.getShippingAddressId(),
      channel: metadata.getChannel(),
      fobCode: metadata.getFobCode(),
      shipViaCode: metadata.getShipViaCode(),
      paymentTermCode: metadata.getPaymentTermCode(),
      currencyCode: metadata.getCurrencyCode(),
      //exchangeRate: metadata.getExchangeRate(),
      customerPoNum: metadata.getCustomerPoNum(),
      headerNote: metadata.getHeaderNote(),
      internalNote: metadata.getInternalNote(),
      createdAt: soHeader.getCreatedAt(),
      updatedAt: soHeader.getUpdatedAt(),
      lines: soHeader.getLines().map((line) => ({
        id: line.getId(),
        lineNum: line.getLineNum(),
        itemSkuId: line.getItemSkuId(),
        description: line.getDescription(),
        orderQty: line.getOrderQty(),
        uomCode: line.getUomCode(),
        unitPrice: line.getUnitPrice(),
        discountPercent: line.getDiscountPercent(),
        discountAmount: line.getDiscountAmount(),
        taxPercent: line.getTaxPercent(),
        taxAmount: line.getTaxAmount(),
        totalAmount: line.getTotalAmount(),
        needByDate: line.getNeedByDate(),
        status: line.getStatus(),
        warehouseCode: line.getWarehouseCode(),
        lineNote: line.getLineNote(),
        createdAt: line.getCreatedAt(),
        updatedAt: line.getUpdatedAt(),
      })),
    };
  }

  async addShippedQty(soId: number, lineNum: number, quantity: number): Promise<void> {
    const soHeader = await this.soHeaderRepository.findOne(soId);
    if (!soHeader) {
      throw new NotFoundException(`Sales Order ${soId} not found`);
    }

    const line = soHeader.getLines().find(l => l.getLineNum() === lineNum);
    if (!line) {
      throw new NotFoundException(`SO Line ${lineNum} not found in SO ${soId}`);
    }

    console.log(`Adding ${quantity} to SO Line ${lineNum} in SO ${soId}`);

    // Delegate calculation to domain entity
    line.addShippedQty(quantity);

    await this.soHeaderRepository.update(soId, soHeader);
  }
}
