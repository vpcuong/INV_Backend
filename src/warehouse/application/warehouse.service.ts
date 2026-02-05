import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WAREHOUSE_REPOSITORY } from '../constant/warehouse.token';
import { IWarehouseRepository } from '../domain/warehouse.repository.interface';
import { Warehouse } from '../domain/warehouse.entity';
import { WarehouseItem } from '../domain/warehouse-item.entity';
import {
  DuplicateWarehouseCodeException,
  WarehouseNotFoundException,
} from '../domain/exceptions/warehouse-domain.exception';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';
import {
  AdjustInventoryDto,
  CreateInventoryDto,
  ReserveInventoryDto,
  ReleaseReservationDto,
  UpdateInventoryDto,
} from '../dto/inventory.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WarehouseService {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY)
    private readonly warehouseRepository: IWarehouseRepository,
    private readonly prisma: PrismaService,
  ) {}

  // Warehouse CRUD operations
  async createWarehouse(dto: CreateWarehouseDto): Promise<any> {
    // Check if code already exists
    const exists = await this.warehouseRepository.existsByCode(dto.code);
    if (exists) {
      throw new DuplicateWarehouseCodeException(dto.code);
    }

    const warehouse = new Warehouse({
      code: dto.code,
      name: dto.name,
      address: dto.address,
    });

    const saved = await this.warehouseRepository.save(warehouse);
    return saved.toPersistence();
  }

  async updateWarehouse(publicId: string, dto: UpdateWarehouseDto): Promise<any> {
    const warehouse = await this.warehouseRepository.findByPublicId(publicId);
    if (!warehouse) {
      throw new WarehouseNotFoundException(publicId);
    }

    warehouse.update({
      name: dto.name,
      address: dto.address,
      status: dto.status,
    });

    const updated = await this.warehouseRepository.update(warehouse);
    return updated.toPersistence();
  }

  async deleteWarehouse(publicId: string): Promise<void> {
    const warehouse = await this.warehouseRepository.findByPublicId(publicId);
    if (!warehouse) {
      throw new WarehouseNotFoundException(publicId);
    }

    await this.warehouseRepository.delete(warehouse.getId()!);
  }

  async activateWarehouse(publicId: string): Promise<any> {
    const warehouse = await this.warehouseRepository.findByPublicId(publicId);
    if (!warehouse) {
      throw new WarehouseNotFoundException(publicId);
    }

    warehouse.activate();
    const updated = await this.warehouseRepository.update(warehouse);
    return updated.toPersistence();
  }

  async deactivateWarehouse(publicId: string): Promise<any> {
    const warehouse = await this.warehouseRepository.findByPublicId(publicId);
    if (!warehouse) {
      throw new WarehouseNotFoundException(publicId);
    }

    warehouse.deactivate();
    const updated = await this.warehouseRepository.update(warehouse);
    return updated.toPersistence();
  }

  // Inventory operations
  async addInventory(
    warehousePublicId: string,
    dto: CreateInventoryDto,
  ): Promise<any> {
    const warehouse =
      await this.warehouseRepository.findByPublicId(warehousePublicId);
    if (!warehouse) {
      throw new WarehouseNotFoundException(warehousePublicId);
    }

    // Resolve SKU publicId to id
    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { publicId: dto.skuPublicId },
    });
    if (!sku) {
      throw new NotFoundException(
        `SKU with publicId ${dto.skuPublicId} not found`,
      );
    }

    // Check if inventory already exists
    const existingInventory = await this.warehouseRepository.findInventory(
      warehouse.getId()!,
      sku.id,
    );

    if (existingInventory) {
      // Update existing inventory
      existingInventory.setQuantity(dto.quantity);
      const updated =
        await this.warehouseRepository.updateInventory(existingInventory);
      return this.buildInventoryResponse(warehouse, sku, updated);
    }

    // Create new inventory
    const item = new WarehouseItem({
      warehouseId: warehouse.getId()!,
      itemSkuId: sku.id,
      quantity: dto.quantity,
    });

    const saved = await this.warehouseRepository.saveInventory(item);
    return this.buildInventoryResponse(warehouse, sku, saved);
  }

  async adjustInventory(
    warehousePublicId: string,
    skuPublicId: string,
    dto: AdjustInventoryDto,
  ): Promise<any> {
    const warehouse =
      await this.warehouseRepository.findByPublicId(warehousePublicId);
    if (!warehouse) {
      throw new WarehouseNotFoundException(warehousePublicId);
    }

    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { publicId: skuPublicId },
    });
    if (!sku) {
      throw new NotFoundException(`SKU with publicId ${skuPublicId} not found`);
    }

    let inventory = await this.warehouseRepository.findInventory(
      warehouse.getId()!,
      sku.id,
    );

    if (!inventory) {
      // Create new inventory if adjustment is positive
      if (dto.adjustment < 0) {
        throw new NotFoundException(
          `No inventory found for SKU ${skuPublicId} in warehouse ${warehousePublicId}`,
        );
      }
      inventory = new WarehouseItem({
        warehouseId: warehouse.getId()!,
        itemSkuId: sku.id,
        quantity: dto.adjustment,
      });
      const saved = await this.warehouseRepository.saveInventory(inventory);
      return this.buildInventoryResponse(warehouse, sku, saved);
    }

    inventory.adjustQuantity(dto.adjustment);
    const updated = await this.warehouseRepository.updateInventory(inventory);
    return this.buildInventoryResponse(warehouse, sku, updated);
  }

  async setInventory(
    warehousePublicId: string,
    skuPublicId: string,
    dto: UpdateInventoryDto,
  ): Promise<any> {
    const warehouse =
      await this.warehouseRepository.findByPublicId(warehousePublicId);
    if (!warehouse) {
      throw new WarehouseNotFoundException(warehousePublicId);
    }

    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { publicId: skuPublicId },
    });
    if (!sku) {
      throw new NotFoundException(`SKU with publicId ${skuPublicId} not found`);
    }

    let inventory = await this.warehouseRepository.findInventory(
      warehouse.getId()!,
      sku.id,
    );

    if (!inventory) {
      inventory = new WarehouseItem({
        warehouseId: warehouse.getId()!,
        itemSkuId: sku.id,
        quantity: dto.quantity ?? 0,
      });
      const saved = await this.warehouseRepository.saveInventory(inventory);
      return this.buildInventoryResponse(warehouse, sku, saved);
    }

    if (dto.quantity !== undefined) {
      inventory.setQuantity(dto.quantity);
    }

    const updated = await this.warehouseRepository.updateInventory(inventory);
    return this.buildInventoryResponse(warehouse, sku, updated);
  }

  async reserveInventory(
    warehousePublicId: string,
    skuPublicId: string,
    dto: ReserveInventoryDto,
  ): Promise<any> {
    const warehouse =
      await this.warehouseRepository.findByPublicId(warehousePublicId);
    if (!warehouse) {
      throw new WarehouseNotFoundException(warehousePublicId);
    }

    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { publicId: skuPublicId },
    });
    if (!sku) {
      throw new NotFoundException(`SKU with publicId ${skuPublicId} not found`);
    }

    const inventory = await this.warehouseRepository.findInventory(
      warehouse.getId()!,
      sku.id,
    );

    if (!inventory) {
      throw new NotFoundException(
        `No inventory found for SKU ${skuPublicId} in warehouse ${warehousePublicId}`,
      );
    }

    inventory.reserve(dto.quantity);
    const updated = await this.warehouseRepository.updateInventory(inventory);
    return this.buildInventoryResponse(warehouse, sku, updated);
  }

  async releaseReservation(
    warehousePublicId: string,
    skuPublicId: string,
    dto: ReleaseReservationDto,
  ): Promise<any> {
    const warehouse =
      await this.warehouseRepository.findByPublicId(warehousePublicId);
    if (!warehouse) {
      throw new WarehouseNotFoundException(warehousePublicId);
    }

    const sku = await this.prisma.client.itemSKU.findUnique({
      where: { publicId: skuPublicId },
    });
    if (!sku) {
      throw new NotFoundException(`SKU with publicId ${skuPublicId} not found`);
    }

    const inventory = await this.warehouseRepository.findInventory(
      warehouse.getId()!,
      sku.id,
    );

    if (!inventory) {
      throw new NotFoundException(
        `No inventory found for SKU ${skuPublicId} in warehouse ${warehousePublicId}`,
      );
    }

    inventory.releaseReservation(dto.quantity);
    const updated = await this.warehouseRepository.updateInventory(inventory);
    return this.buildInventoryResponse(warehouse, sku, updated);
  }

  private buildInventoryResponse(
    warehouse: Warehouse,
    sku: any,
    item: WarehouseItem,
  ): any {
    return {
      warehousePublicId: warehouse.getPublicId(),
      warehouseCode: warehouse.getCode(),
      warehouseName: warehouse.getName(),
      skuPublicId: sku.publicId,
      skuCode: sku.skuCode,
      quantity: item.getQuantity(),
      reservedQty: item.getReservedQty(),
      availableQty: item.getAvailableQty(),
    };
  }
}
