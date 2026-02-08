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
import { ModelFilterDto } from '../dto/model-filter.dto';
import { CreateModelDto } from '../dto/create-model.dto';

/**
 * Controller xử lý các endpoints tạo và list Models theo Item
 *
 * Nested routes:
 * - POST /items/:itemPublicId/models - Tạo Model cho Item
 * - GET /items/:itemPublicId/models - List Models của Item
 *
 * Lưu ý: Các thao tác CRUD trực tiếp với Model (get, update, delete, activate, deactivate)
 * sử dụng endpoint /models/:publicId trong ModelsController
 */
@ApiTags('Item Models')
@ApiBearerAuth()
@Controller('items/:itemPublicId/models')
export class ItemModelsController {
  constructor(
    private readonly itemAggregateService: ItemAggregateService,
    private readonly itemQueryService: ItemQueryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add model to item' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  create(
    @Param('itemPublicId') itemPublicId: string,
    @Body() dto: CreateModelDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.itemAggregateService.addModelToItemByPublicId(itemPublicId, dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all models for item' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  findAll(
    @Param('itemPublicId') itemPublicId: string,
    @Query() filterDto: ModelFilterDto,
  ) {
    return this.itemQueryService.findModelsByItemPublicId(itemPublicId, filterDto);
  }
}