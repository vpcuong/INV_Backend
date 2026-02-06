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
import { CreateGoodsReceiptDto, CreateGoodsReceiptFromPoDto } from '../dto/goods-receipt.dto';
import { CreateGoodsIssueDto, CreateGoodsIssueFromSoDto } from '../dto/goods-issue.dto';
import { CreateAdjustmentDto } from '../dto/adjustment.dto';
import { CreateStockTransferDto } from '../dto/stock-transfer.dto';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly queryService: InventoryQueryService
  ) {}

  /**
   * Create generic transaction (Legacy/Internal)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateInvTransHeaderDto) {
    return this.inventoryService.create(dto);
  }

  // =================================================================================================
  // GOODS RECEIPT
  // =================================================================================================

  @Post('goods-receipt')
  @HttpCode(HttpStatus.CREATED)
  createGoodsReceipt(@Body() dto: CreateGoodsReceiptDto) {
    return this.inventoryService.createGoodsReceipt(dto);
  }

  @Post('goods-receipt/from-po')
  @HttpCode(HttpStatus.CREATED)
  createGoodsReceiptFromPo(@Body() dto: CreateGoodsReceiptFromPoDto) {
    return this.inventoryService.createGoodsReceiptFromPo(dto);
  }

  // =================================================================================================
  // GOODS ISSUE
  // =================================================================================================

  @Post('goods-issue')
  @HttpCode(HttpStatus.CREATED)
  createGoodsIssue(@Body() dto: CreateGoodsIssueDto) {
    return this.inventoryService.createGoodsIssue(dto);
  }

  @Post('goods-issue/from-so')
  @HttpCode(HttpStatus.CREATED)
  createGoodsIssueFromSo(@Body() dto: CreateGoodsIssueFromSoDto) {
    return this.inventoryService.createGoodsIssueFromSo(dto);
  }

  // =================================================================================================
  // ADJUSTMENT
  // =================================================================================================

  @Post('adjustment')
  @HttpCode(HttpStatus.CREATED)
  createAdjustment(@Body() dto: CreateAdjustmentDto) {
    return this.inventoryService.createAdjustment(dto);
  }

  // =================================================================================================
  // STOCK TRANSFER
  // =================================================================================================

  @Post('stock-transfer')
  @HttpCode(HttpStatus.CREATED)
  createStockTransfer(@Body() dto: CreateStockTransferDto) {
    return this.inventoryService.createStockTransfer(dto);
  }

  // =================================================================================================
  // QUERIES
  // =================================================================================================

  @Get()
  findAll(@Query() filterDto: InvTransFilterDto) {
    return this.queryService.findAll(filterDto);
  }

  @Get('export')
  export(@Query() filterDto: InvTransFilterDto) {
    // This could check permissions, etc.
    // For now, it just reuses the finding logic but in a real app would stream CSV/Excel
    return this.queryService.findAll(filterDto);
  }

  @Get(':publicId')
  findOne(@Param('publicId') publicId: string) {
    return this.inventoryService.findByPublicId(publicId);
  }

  // =================================================================================================
  // ACTIONS (DRAFT ONLY)
  // =================================================================================================

  @Put(':publicId')
  update(
    @Param('publicId') publicId: string,
    @Body() dto: UpdateInvTransHeaderDto
  ) {
    return this.inventoryService.updateByPublicId(publicId, dto);
  }

  @Post(':publicId/complete')
  complete(@Param('publicId') publicId: string) {
    return this.inventoryService.completeByPublicId(publicId);
  }

  @Post(':publicId/cancel')
  cancel(@Param('publicId') publicId: string) {
    return this.inventoryService.cancelByPublicId(publicId);
  }

  @Delete(':publicId')
  remove(@Param('publicId') publicId: string) {
    return this.inventoryService.removeByPublicId(publicId);
  }

  // =================================================================================================
  // LINE MANAGEMENT
  // =================================================================================================

  @Post(':publicId/lines')
  addLine(
    @Param('publicId') publicId: string,
    @Body() dto: CreateInvTransLineDto
  ) {
    return this.inventoryService.addLine(publicId, dto);
  }

  @Delete(':publicId/lines/:lineNum')
  removeLine(
    @Param('publicId') publicId: string,
    @Param('lineNum') lineNum: number
  ) {
    return this.inventoryService.removeLine(publicId, +lineNum);
  }
}
