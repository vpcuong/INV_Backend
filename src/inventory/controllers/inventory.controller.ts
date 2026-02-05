import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InventoryService } from '../application/inventory.service';
import { InventoryQueryService } from '../application/inventory-query.service';
import { CreateInvTransHeaderDto, CreateInvTransLineDto } from '../dto/create-inv-trans.dto';
import { UpdateInvTransHeaderDto } from '../dto/update-inv-trans.dto';
import { InvTransFilterDto } from '../dto/inv-trans-filter.dto';

@Controller('api/inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly queryService: InventoryQueryService
  ) {}

  /**
   * Create new inventory transaction
   * POST /api/inventory
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateInvTransHeaderDto) {
    return this.inventoryService.create(dto);
  }

  /**
   * Get all transactions with filtering
   * GET /api/inventory
   */
  @Get()
  async findAll(@Query() filterDto: InvTransFilterDto) {
    return this.queryService.findAll(filterDto);
  }

  /**
   * Get transaction by public ID
   * GET /api/inventory/:publicId
   */
  @Get(':publicId')
  async findByPublicId(@Param('publicId') publicId: string) {
    return this.queryService.findByPublicId(publicId);
  }

  /**
   * Update transaction (DRAFT only)
   * PUT /api/inventory/:publicId
   */
  @Put(':publicId')
  async update(
    @Param('publicId') publicId: string,
    @Body() dto: UpdateInvTransHeaderDto
  ) {
    return this.inventoryService.updateByPublicId(publicId, dto);
  }

  /**
   * Complete transaction - updates stock
   * POST /api/inventory/:publicId/complete
   */
  @Post(':publicId/complete')
  @HttpCode(HttpStatus.OK)
  async complete(@Param('publicId') publicId: string) {
    return this.inventoryService.completeByPublicId(publicId);
  }

  /**
   * Cancel transaction
   * POST /api/inventory/:publicId/cancel
   */
  @Post(':publicId/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('publicId') publicId: string) {
    return this.inventoryService.cancelByPublicId(publicId);
  }

  /**
   * Delete transaction (DRAFT only)
   * DELETE /api/inventory/:publicId
   */
  @Delete(':publicId')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('publicId') publicId: string) {
    return this.inventoryService.removeByPublicId(publicId);
  }

  /**
   * Add line to transaction
   * POST /api/inventory/:publicId/lines
   */
  @Post(':publicId/lines')
  @HttpCode(HttpStatus.CREATED)
  async addLine(
    @Param('publicId') publicId: string,
    @Body() lineDto: CreateInvTransLineDto
  ) {
    return this.inventoryService.addLine(publicId, lineDto);
  }

  /**
   * Remove line from transaction
   * DELETE /api/inventory/:publicId/lines/:lineNum
   */
  @Delete(':publicId/lines/:lineNum')
  @HttpCode(HttpStatus.OK)
  async removeLine(
    @Param('publicId') publicId: string,
    @Param('lineNum') lineNum: string
  ) {
    return this.inventoryService.removeLine(publicId, parseInt(lineNum, 10));
  }
}
