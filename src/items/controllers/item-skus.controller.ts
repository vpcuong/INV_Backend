import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ItemAggregateService } from '../application/item-aggregate.service';
import { ItemQueryService } from '../application/item-query.service';
import { SkuFilterDto } from '../dto/sku-filter.dto';
import { CreateSkuDto } from '../dto/create-sku.dto';

/**
 * Controller xử lý các endpoints tạo và list SKUs theo Item/Model
 *
 * Nested routes:
 * - POST /items/:itemPublicId/skus - Tạo SKU cho Item
 * - GET /items/:itemPublicId/skus - List SKUs của Item
 * - POST /items/:itemPublicId/models/:modelPublicId/skus - Tạo SKU cho Model
 * - GET /items/:itemPublicId/models/:modelPublicId/skus - List SKUs của Model
 *
 * Lưu ý: Các thao tác CRUD trực tiếp với SKU (get, update, delete, activate, deactivate)
 * sử dụng endpoint /skus/:publicId trong SkusController
 */
@ApiTags('Item SKUs')
@ApiBearerAuth()
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
    @CurrentUser() user: { userId: string },
  ) {
    return this.itemAggregateService.addSkuToItemByPublicId(itemPublicId, null, dto, user.userId);
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

  // ==================== SKU thuộc Model ====================

  @Post('models/:modelPublicId/skus')
  @ApiOperation({ summary: 'Add SKU to model' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  @ApiParam({ name: 'modelPublicId', description: 'Model Public ID (ULID)' })
  createForModel(
    @Param('itemPublicId') itemPublicId: string,
    @Param('modelPublicId') modelPublicId: string,
    @Body() dto: CreateSkuDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.itemAggregateService.addSkuToItemByPublicId(itemPublicId, modelPublicId, dto, user.userId);
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