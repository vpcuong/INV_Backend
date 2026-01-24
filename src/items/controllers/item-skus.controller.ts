import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ItemAggregateService, CreateSkuDto, UpdateSkuDto } from '../application/item-aggregate.service';
import { ItemQueryService } from '../application/item-query.service';
import { SkuFilterDto } from '../dto/sku-filter.dto';

/**
 * Controller xử lý các endpoints liên quan đến Item SKUs
 *
 * Nested routes:
 * - /items/:itemId/skus/* (SKU trực tiếp của Item)
 * - /items/:itemId/models/:modelId/skus/* (SKU thuộc Model)
 *
 * Bao gồm:
 * - CRUD operations cho SKU
 * - Status management (activate, deactivate)
 */
@ApiTags('Item SKUs')
@Controller('items/:itemId')
export class ItemSkusController {
  constructor(
    private readonly itemAggregateService: ItemAggregateService,
    private readonly itemQueryService: ItemQueryService,
  ) {}

  // ==================== SKU trực tiếp của Item ====================

  @Post('skus')
  @ApiOperation({ summary: 'Add SKU directly to item (without model)' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  createForItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: CreateSkuDto,
  ) {
    return this.itemAggregateService.addSkuToItem(itemId, null, dto);
  }

  @Get('skus')
  @ApiOperation({ summary: 'Get all SKUs for item' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  findAllByItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Query() filterDto: SkuFilterDto,
  ) {
    return this.itemQueryService.findSkusByItemId(itemId, filterDto);
  }

  @Get('skus/:skuId')
  @ApiOperation({ summary: 'Get specific SKU' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiParam({ name: 'skuId', description: 'SKU ID' })
  findOne(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('skuId', ParseIntPipe) skuId: number,
  ) {
    return this.itemQueryService.findSkuById(skuId);
  }

  @Patch('skus/:skuId')
  @ApiOperation({ summary: 'Update SKU' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiParam({ name: 'skuId', description: 'SKU ID' })
  update(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('skuId', ParseIntPipe) skuId: number,
    @Body() dto: UpdateSkuDto,
  ) {
    return this.itemAggregateService.updateSku(itemId, skuId, dto);
  }

  @Delete('skus/:skuId')
  @ApiOperation({ summary: 'Remove SKU' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiParam({ name: 'skuId', description: 'SKU ID' })
  remove(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('skuId', ParseIntPipe) skuId: number,
  ) {
    return this.itemAggregateService.removeSku(itemId, skuId);
  }

  @Patch('skus/:skuId/activate')
  @ApiOperation({ summary: 'Activate SKU' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiParam({ name: 'skuId', description: 'SKU ID' })
  activate(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('skuId', ParseIntPipe) skuId: number,
  ) {
    return this.itemAggregateService.activateSku(itemId, skuId);
  }

  @Patch('skus/:skuId/deactivate')
  @ApiOperation({ summary: 'Deactivate SKU' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiParam({ name: 'skuId', description: 'SKU ID' })
  deactivate(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('skuId', ParseIntPipe) skuId: number,
  ) {
    return this.itemAggregateService.deactivateSku(itemId, skuId);
  }

  // ==================== SKU thuộc Model ====================

  @Post('models/:modelId/skus')
  @ApiOperation({ summary: 'Add SKU to model' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiParam({ name: 'modelId', description: 'Model ID' })
  createForModel(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('modelId', ParseIntPipe) modelId: number,
    @Body() dto: CreateSkuDto,
  ) {
    return this.itemAggregateService.addSkuToItem(itemId, modelId, dto);
  }

  @Get('models/:modelId/skus')
  @ApiOperation({ summary: 'Get all SKUs for model' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiParam({ name: 'modelId', description: 'Model ID' })
  findAllByModel(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('modelId', ParseIntPipe) modelId: number,
    @Query() filterDto: SkuFilterDto,
  ) {
    return this.itemQueryService.findSkusByModelId(modelId, filterDto);
  }
}