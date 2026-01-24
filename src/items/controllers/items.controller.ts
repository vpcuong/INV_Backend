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
 */
@ApiTags('Items')
@Controller('items')
export class ItemsController {
  constructor(
    private readonly itemAggregateService: ItemAggregateService,
    private readonly itemQueryService: ItemQueryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({ status: 201, description: 'Item created successfully' })
  create(@Body() dto: CreateItemDto) {
    return this.itemAggregateService.createItem(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all items with filtering, sorting, and pagination' })
  @ApiResponse({ status: 200, description: 'Return all items' })
  findAll(@Query() filterDto: ItemFilterDto) {
    return this.itemQueryService.findAllWithFilters(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiResponse({ status: 200, description: 'Return the item' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemAggregateService.getItemById(id);
  }

  @Get(':id/complete')
  @ApiOperation({ summary: 'Get item with all children (models, skus, uoms)' })
  @ApiResponse({ status: 200, description: 'Return the complete item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  findComplete(@Param('id', ParseIntPipe) id: number) {
    return this.itemAggregateService.getItemComplete(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemDto,
  ) {
    return this.itemAggregateService.updateItem(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemAggregateService.deleteItem(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.itemAggregateService.activateItem(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.itemAggregateService.deactivateItem(id);
  }

  @Patch(':id/draft')
  @ApiOperation({ summary: 'Set item status to draft' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  setDraft(@Param('id', ParseIntPipe) id: number) {
    return this.itemAggregateService.setItemDraft(id);
  }
}