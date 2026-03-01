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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InventoryService } from '../application/inventory.service';
import { InventoryQueryService } from '../application/inventory-query.service';
import { CreateInvTransHeaderDto, CreateInvTransLineDto } from '../dto/create-inv-trans.dto';
import { UpdateInvTransHeaderDto } from '../dto/update-inv-trans.dto';
import { InvTransCursorFilterDto, InvTransFilterDto } from '../dto/inv-trans-filter.dto';
import { CreateGoodsReceiptDto, CreateGoodsReceiptFromPoDto } from '../dto/goods-receipt.dto';
import { CreateGoodsIssueDto, CreateGoodsIssueFromSoDto } from '../dto/goods-issue.dto';
import { CreateAdjustmentDto } from '../dto/adjustment.dto';
import { CreateStockTransferDto } from '../dto/stock-transfer.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Inventory')
@ApiBearerAuth()
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
  create(
    @Body() dto: CreateInvTransHeaderDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.inventoryService.create(dto, user.userId);
  }

  // =================================================================================================
  // GOODS RECEIPT
  // =================================================================================================

  @Post('goods-receipt')
  @HttpCode(HttpStatus.CREATED)
  createGoodsReceipt(
    @Body() dto: CreateGoodsReceiptDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.inventoryService.createGoodsReceipt(dto, user.userId);
  }

  @Post('goods-receipt/from-po')
  @HttpCode(HttpStatus.CREATED)
  createGoodsReceiptFromPo(
    @Body() dto: CreateGoodsReceiptFromPoDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.inventoryService.createGoodsReceiptFromPo(dto, user.userId);
  }

  // =================================================================================================
  // GOODS ISSUE
  // =================================================================================================

  @Post('goods-issue')
  @HttpCode(HttpStatus.CREATED)
  createGoodsIssue(
    @Body() dto: CreateGoodsIssueDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.inventoryService.createGoodsIssue(dto, user.userId);
  }

  @Post('goods-issue/from-so')
  @HttpCode(HttpStatus.CREATED)
  createGoodsIssueFromSo(
    @Body() dto: CreateGoodsIssueFromSoDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.inventoryService.createGoodsIssueFromSo(dto, user.userId);
  }

  // =================================================================================================
  // ADJUSTMENT
  // =================================================================================================

  @Post('adjustment')
  @HttpCode(HttpStatus.CREATED)
  createAdjustment(
    @Body() dto: CreateAdjustmentDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.inventoryService.createAdjustment(dto, user.userId);
  }

  // =================================================================================================
  // STOCK TRANSFER
  // =================================================================================================

  @Post('stock-transfer')
  @HttpCode(HttpStatus.CREATED)
  createStockTransfer(
    @Body() dto: CreateStockTransferDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.inventoryService.createStockTransfer(dto, user.userId);
  }

  // =================================================================================================
  // QUERIES
  // =================================================================================================

  @Get('cursor')
  findAllWithCursor(@Query() filterDto: InvTransCursorFilterDto) {
    return this.queryService.findAllWithCursor(filterDto);
  }

  @Get()
  findAll(@Query() filterDto: InvTransFilterDto) {
    return this.queryService.findAll(filterDto);
  }

  @Get('export')
  export(@Query() filterDto: InvTransFilterDto) {
    // This could check permissions, etc.
    // For now, it just reuses the finding logic 
    // but in a real app would stream CSV/Excel
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
