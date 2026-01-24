import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ItemAggregateService, CreateUomDto } from '../application/item-aggregate.service';
import { ItemQueryService } from '../application/item-query.service';

/**
 * Controller xử lý các endpoints liên quan đến Item UOMs
 *
 * Nested routes: /items/:itemId/uoms/*
 *
 * Bao gồm:
 * - Thêm/xóa UOM cho Item
 * - Query UOMs của Item
 */
@ApiTags('Item UOMs')
@Controller('items/:itemId/uoms')
export class ItemUomsController {
  constructor(
    private readonly itemAggregateService: ItemAggregateService,
    private readonly itemQueryService: ItemQueryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add UOM to item' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  create(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: CreateUomDto,
  ) {
    return this.itemAggregateService.addUomToItem(itemId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all UOMs for item' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  findAll(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.itemQueryService.findUomsByItemId(itemId);
  }

  @Get(':uomCode')
  @ApiOperation({ summary: 'Get specific UOM' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiParam({ name: 'uomCode', description: 'UOM Code' })
  findOne(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('uomCode') uomCode: string,
  ) {
    return this.itemQueryService.findUomByItemAndCode(itemId, uomCode);
  }

  @Delete(':uomCode')
  @ApiOperation({ summary: 'Remove UOM from item' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiParam({ name: 'uomCode', description: 'UOM Code' })
  remove(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('uomCode') uomCode: string,
  ) {
    return this.itemAggregateService.removeUom(itemId, uomCode);
  }
}