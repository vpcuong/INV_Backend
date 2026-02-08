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
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ItemAggregateService } from '../application/item-aggregate.service';
import { ItemQueryService } from '../application/item-query.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ItemFilterDto } from '../dto/item-filter.dto';

/**
 * Controller xử lý các endpoints liên quan đến Item
 *
 * Bao gồm:
 * - CRUD operations cho Item
 * - Status management (activate, deactivate, draft)
 *
 * Sử dụng publicId (ULID) thay vì internal ID để bảo mật
 */
@ApiTags('Items')
@ApiBearerAuth()
@Controller('items')
export class ItemsController {
  constructor(
    private readonly itemAggregateService: ItemAggregateService,
    private readonly itemQueryService: ItemQueryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({ status: 201, description: 'Item created successfully' })
  create(
    @Body() dto: CreateItemDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.itemAggregateService.createItem(dto, user.userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all items with filtering, sorting, and pagination',
  })
  @ApiResponse({ status: 200, description: 'Return all items' })
  findAll(@Query() filterDto: ItemFilterDto) {
    return this.itemQueryService.findAllWithFilters(filterDto);
  }

  @Get(':publicId')
  @ApiOperation({ summary: 'Get item by public ID' })
  @ApiResponse({ status: 200, description: 'Return the item' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @ApiParam({ name: 'publicId', description: 'Item Public ID (ULID)' })
  findOne(@Param('publicId') publicId: string) {
    return this.itemQueryService.findByPublicId(publicId);
  }

  @Get(':publicId/complete')
  @ApiOperation({ summary: 'Get item with all children (models, skus, uoms)' })
  @ApiResponse({ status: 200, description: 'Return the complete item' })
  @ApiParam({ name: 'publicId', description: 'Item Public ID (ULID)' })
  findComplete(@Param('publicId') publicId: string) {
    return this.itemQueryService.findCompleteByPublicId(publicId);
  }

  @Patch(':publicId')
  @ApiOperation({ summary: 'Update item' })
  @ApiParam({ name: 'publicId', description: 'Item Public ID (ULID)' })
  update(@Param('publicId') publicId: string, @Body() dto: UpdateItemDto) {
    return this.itemAggregateService.updateItemByPublicId(publicId, dto);
  }

  @Delete(':publicId')
  @ApiOperation({ summary: 'Delete item' })
  @ApiParam({ name: 'publicId', description: 'Item Public ID (ULID)' })
  remove(@Param('publicId') publicId: string) {
    return this.itemAggregateService.deleteItemByPublicId(publicId);
  }

  @Patch(':publicId/activate')
  @ApiOperation({ summary: 'Activate item' })
  @ApiParam({ name: 'publicId', description: 'Item Public ID (ULID)' })
  activate(@Param('publicId') publicId: string) {
    return this.itemAggregateService.activateItemByPublicId(publicId);
  }

  @Patch(':publicId/deactivate')
  @ApiOperation({ summary: 'Deactivate item' })
  @ApiParam({ name: 'publicId', description: 'Item Public ID (ULID)' })
  deactivate(@Param('publicId') publicId: string) {
    return this.itemAggregateService.deactivateItemByPublicId(publicId);
  }

  @Patch(':publicId/draft')
  @ApiOperation({ summary: 'Set item status to draft' })
  @ApiParam({ name: 'publicId', description: 'Item Public ID (ULID)' })
  setDraft(@Param('publicId') publicId: string) {
    return this.itemAggregateService.setItemDraftByPublicId(publicId);
  }
}
