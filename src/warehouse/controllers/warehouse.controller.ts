import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { WarehouseService } from '../application/warehouse.service';
import { WarehouseQueryService } from '../application/warehouse-query.service';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';
import { WarehouseFilterDto } from '../dto/warehouse-filter.dto';

@ApiTags('Warehouses')
@ApiBearerAuth()
@Controller('warehouses')
export class WarehouseController {
  constructor(
    private readonly warehouseService: WarehouseService,
    private readonly warehouseQueryService: WarehouseQueryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({ status: 201, description: 'Warehouse created successfully' })
  @ApiResponse({ status: 400, description: 'Duplicate warehouse code' })
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehouseService.createWarehouse(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all warehouses with optional filtering' })
  @ApiResponse({ status: 200, description: 'Return all warehouses' })
  findAll(@Query() filterDto: WarehouseFilterDto) {
    return this.warehouseQueryService.findAll(filterDto);
  }

  @Get(':publicId')
  @ApiOperation({ summary: 'Get warehouse by public ID' })
  @ApiResponse({ status: 200, description: 'Return the warehouse' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  @ApiParam({ name: 'publicId', description: 'Warehouse Public ID (ULID)' })
  findOne(@Param('publicId') publicId: string) {
    return this.warehouseQueryService.findByPublicId(publicId);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get warehouse by code' })
  @ApiResponse({ status: 200, description: 'Return the warehouse' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  @ApiParam({ name: 'code', description: 'Warehouse code' })
  findByCode(@Param('code') code: string) {
    return this.warehouseQueryService.findByCode(code);
  }

  @Patch(':publicId')
  @ApiOperation({ summary: 'Update warehouse' })
  @ApiParam({ name: 'publicId', description: 'Warehouse Public ID (ULID)' })
  update(
    @Param('publicId') publicId: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.warehouseService.updateWarehouse(publicId, dto);
  }

  @Delete(':publicId')
  @ApiOperation({ summary: 'Delete warehouse' })
  @ApiParam({ name: 'publicId', description: 'Warehouse Public ID (ULID)' })
  @ApiResponse({ status: 200, description: 'Warehouse deleted successfully' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  remove(@Param('publicId') publicId: string) {
    return this.warehouseService.deleteWarehouse(publicId);
  }

  @Post(':publicId/activate')
  @ApiOperation({ summary: 'Activate warehouse' })
  @ApiParam({ name: 'publicId', description: 'Warehouse Public ID (ULID)' })
  activate(@Param('publicId') publicId: string) {
    return this.warehouseService.activateWarehouse(publicId);
  }

  @Post(':publicId/deactivate')
  @ApiOperation({ summary: 'Deactivate warehouse' })
  @ApiParam({ name: 'publicId', description: 'Warehouse Public ID (ULID)' })
  deactivate(@Param('publicId') publicId: string) {
    return this.warehouseService.deactivateWarehouse(publicId);
  }

  @Get(':publicId/summary')
  @ApiOperation({ summary: 'Get warehouse stock summary' })
  @ApiParam({ name: 'publicId', description: 'Warehouse Public ID (ULID)' })
  getStockSummary(@Param('publicId') publicId: string) {
    return this.warehouseQueryService.getStockSummary(publicId);
  }
}
