import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { WarehouseService } from '../application/warehouse.service';
import { WarehouseQueryService } from '../application/warehouse-query.service';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  AdjustInventoryDto,
  ReserveInventoryDto,
  ReleaseReservationDto,
} from '../dto/inventory.dto';

@ApiTags('Warehouse Inventory')
@Controller('warehouses/:warehousePublicId/inventory')
export class WarehouseInventoryController {
  constructor(
    private readonly warehouseService: WarehouseService,
    private readonly warehouseQueryService: WarehouseQueryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all inventory items in a warehouse' })
  @ApiResponse({ status: 200, description: 'Return inventory list' })
  @ApiParam({
    name: 'warehousePublicId',
    description: 'Warehouse Public ID (ULID)',
  })
  getInventory(@Param('warehousePublicId') warehousePublicId: string) {
    return this.warehouseQueryService.getInventory(warehousePublicId);
  }

  @Post()
  @ApiOperation({ summary: 'Add or set inventory for a SKU in warehouse' })
  @ApiResponse({ status: 201, description: 'Inventory added/updated' })
  @ApiParam({
    name: 'warehousePublicId',
    description: 'Warehouse Public ID (ULID)',
  })
  addInventory(
    @Param('warehousePublicId') warehousePublicId: string,
    @Body() dto: CreateInventoryDto,
  ) {
    return this.warehouseService.addInventory(warehousePublicId, dto);
  }

  @Patch(':skuPublicId')
  @ApiOperation({ summary: 'Set inventory quantity (absolute value)' })
  @ApiParam({
    name: 'warehousePublicId',
    description: 'Warehouse Public ID (ULID)',
  })
  @ApiParam({ name: 'skuPublicId', description: 'SKU Public ID (ULID)' })
  setInventory(
    @Param('warehousePublicId') warehousePublicId: string,
    @Param('skuPublicId') skuPublicId: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.warehouseService.setInventory(
      warehousePublicId,
      skuPublicId,
      dto,
    );
  }

  @Post(':skuPublicId/adjust')
  @ApiOperation({ summary: 'Adjust inventory quantity (add/subtract)' })
  @ApiParam({
    name: 'warehousePublicId',
    description: 'Warehouse Public ID (ULID)',
  })
  @ApiParam({ name: 'skuPublicId', description: 'SKU Public ID (ULID)' })
  adjustInventory(
    @Param('warehousePublicId') warehousePublicId: string,
    @Param('skuPublicId') skuPublicId: string,
    @Body() dto: AdjustInventoryDto,
  ) {
    return this.warehouseService.adjustInventory(
      warehousePublicId,
      skuPublicId,
      dto,
    );
  }

  @Post(':skuPublicId/reserve')
  @ApiOperation({ summary: 'Reserve inventory quantity' })
  @ApiParam({
    name: 'warehousePublicId',
    description: 'Warehouse Public ID (ULID)',
  })
  @ApiParam({ name: 'skuPublicId', description: 'SKU Public ID (ULID)' })
  reserveInventory(
    @Param('warehousePublicId') warehousePublicId: string,
    @Param('skuPublicId') skuPublicId: string,
    @Body() dto: ReserveInventoryDto,
  ) {
    return this.warehouseService.reserveInventory(
      warehousePublicId,
      skuPublicId,
      dto,
    );
  }

  @Post(':skuPublicId/release')
  @ApiOperation({ summary: 'Release reserved inventory quantity' })
  @ApiParam({
    name: 'warehousePublicId',
    description: 'Warehouse Public ID (ULID)',
  })
  @ApiParam({ name: 'skuPublicId', description: 'SKU Public ID (ULID)' })
  releaseReservation(
    @Param('warehousePublicId') warehousePublicId: string,
    @Param('skuPublicId') skuPublicId: string,
    @Body() dto: ReleaseReservationDto,
  ) {
    return this.warehouseService.releaseReservation(
      warehousePublicId,
      skuPublicId,
      dto,
    );
  }
}

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly warehouseQueryService: WarehouseQueryService,
  ) {}

  @Get('sku/:skuPublicId')
  @ApiOperation({ summary: 'Get stock for a SKU across all warehouses' })
  @ApiResponse({ status: 200, description: 'Return inventory list by SKU' })
  @ApiParam({ name: 'skuPublicId', description: 'SKU Public ID (ULID)' })
  getInventoryBySku(@Param('skuPublicId') skuPublicId: string) {
    return this.warehouseQueryService.getInventoryBySku(skuPublicId);
  }

  @Get('sku/:skuPublicId/summary')
  @ApiOperation({ summary: 'Get total stock summary for a SKU' })
  @ApiParam({ name: 'skuPublicId', description: 'SKU Public ID (ULID)' })
  getSkuStockSummary(@Param('skuPublicId') skuPublicId: string) {
    return this.warehouseQueryService.getTotalStockBySku(skuPublicId);
  }
}
