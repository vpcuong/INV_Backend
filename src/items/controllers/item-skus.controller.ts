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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ItemAggregateService, CreateSkuDto, UpdateSkuDto } from '../application/item-aggregate.service';
import { ItemQueryService } from '../application/item-query.service';
import { SkuFilterDto } from '../dto/sku-filter.dto';

/**
 * Controller xử lý các endpoints liên quan đến Item SKUs
 *
 * Nested routes:
 * - /items/:itemPublicId/skus/* (SKU trực tiếp của Item)
 * - /items/:itemPublicId/models/:modelPublicId/skus/* (SKU thuộc Model)
 *
 * Bao gồm:
 * - CRUD operations cho SKU
 * - Status management (activate, deactivate)
 */
@ApiTags('Item SKUs')
@Controller('items/:itemPublicId')
export class ItemSkusController {
  constructor(
    private readonly itemAggregateService: ItemAggregateService,
    private readonly itemQueryService: ItemQueryService,
  ) {}

  // ==================== SKU trực tiếp của Item ====================

  @Post('skus')
  @ApiOperation({ summary: 'Add SKU directly to item (without model)' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  createForItem(
    @Param('itemPublicId') itemPublicId: string,
    @Body() dto: CreateSkuDto,
  ) {
    return this.itemAggregateService.addSkuToItemByPublicId(itemPublicId, null, dto);
  }

  @Get('skus')
  @ApiOperation({ summary: 'Get all SKUs for item' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  findAllByItem(
    @Param('itemPublicId') itemPublicId: string,
    @Query() filterDto: SkuFilterDto,
  ) {
    return this.itemQueryService.findSkusByItemPublicId(itemPublicId, filterDto);
  }

  @Get('skus/:skuPublicId')
  @ApiOperation({ summary: 'Get specific SKU' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  @ApiParam({ name: 'skuPublicId', description: 'SKU Public ID (ULID)' })
  findOne(
    @Param('itemPublicId') itemPublicId: string,
    @Param('skuPublicId') skuPublicId: string,
  ) {
    return this.itemQueryService.findSkuByPublicId(skuPublicId);
  }

  @Patch('skus/:skuPublicId')
  @ApiOperation({ summary: 'Update SKU' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  @ApiParam({ name: 'skuPublicId', description: 'SKU Public ID (ULID)' })
  update(
    @Param('itemPublicId') itemPublicId: string,
    @Param('skuPublicId') skuPublicId: string,
    @Body() dto: UpdateSkuDto,
  ) {
    return this.itemAggregateService.updateSkuByPublicId(itemPublicId, skuPublicId, dto);
  }

  @Delete('skus/:skuPublicId')
  @ApiOperation({ summary: 'Remove SKU' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  @ApiParam({ name: 'skuPublicId', description: 'SKU Public ID (ULID)' })
  remove(
    @Param('itemPublicId') itemPublicId: string,
    @Param('skuPublicId') skuPublicId: string,
  ) {
    return this.itemAggregateService.removeSkuByPublicId(itemPublicId, skuPublicId);
  }

  @Patch('skus/:skuPublicId/activate')
  @ApiOperation({ summary: 'Activate SKU' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  @ApiParam({ name: 'skuPublicId', description: 'SKU Public ID (ULID)' })
  activate(
    @Param('itemPublicId') itemPublicId: string,
    @Param('skuPublicId') skuPublicId: string,
  ) {
    return this.itemAggregateService.activateSkuByPublicId(itemPublicId, skuPublicId);
  }

  @Patch('skus/:skuPublicId/deactivate')
  @ApiOperation({ summary: 'Deactivate SKU' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  @ApiParam({ name: 'skuPublicId', description: 'SKU Public ID (ULID)' })
  deactivate(
    @Param('itemPublicId') itemPublicId: string,
    @Param('skuPublicId') skuPublicId: string,
  ) {
    return this.itemAggregateService.deactivateSkuByPublicId(itemPublicId, skuPublicId);
  }

  // ==================== SKU thuộc Model ====================

  @Post('models/:modelPublicId/skus')
  @ApiOperation({ summary: 'Add SKU to model' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  @ApiParam({ name: 'modelPublicId', description: 'Model Public ID (ULID)' })
  createForModel(
    @Param('itemPublicId') itemPublicId: string,
    @Param('modelPublicId') modelPublicId: string,
    @Body() dto: CreateSkuDto,
  ) {
    return this.itemAggregateService.addSkuToItemByPublicId(itemPublicId, modelPublicId, dto);
  }

  @Get('models/:modelPublicId/skus')
  @ApiOperation({ summary: 'Get all SKUs for model' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  @ApiParam({ name: 'modelPublicId', description: 'Model Public ID (ULID)' })
  findAllByModel(
    @Param('itemPublicId') itemPublicId: string,
    @Param('modelPublicId') modelPublicId: string,
    @Query() filterDto: SkuFilterDto,
  ) {
    return this.itemQueryService.findSkusByModelPublicId(modelPublicId, filterDto);
  }
}
