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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ItemApplicationService } from './application/item.service';
import { ItemQueryService } from './application/item-query.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemFilterDto } from './dto/item-filter.dto';

@ApiTags('Items')
@Controller('items')
export class ItemsController {
  constructor(
    private readonly itemService: ItemApplicationService,
    private readonly itemQueryService: ItemQueryService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({ status: 201, description: 'Item created successfully' })
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemService.createItem(createItemDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all items with filtering, sorting, and pagination',
  })
  @ApiResponse({ status: 200, description: 'Return all items' })
  findAll(@Query() filterDto: ItemFilterDto) {
    return this.itemQueryService.findAllWithFilters(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiResponse({ status: 200, description: 'Return the item' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.remove(id);
  }

  @Patch(':id/activate')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.activate(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.deactivate(id);
  }

  @Patch(':id/draft')
  @ApiOperation({ summary: 'Change item status to draft' })
  @ApiResponse({
    status: 200,
    description: 'Item status changed to draft successfully',
  })
  @ApiResponse({ status: 404, description: 'Item not found' })
  draft(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.draft(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemDto: UpdateItemDto
  ) {
    return this.itemService.update(id, updateItemDto);
  }
}
