import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ItemAggregateService } from '../application/item-aggregate.service';
import { ItemQueryService } from '../application/item-query.service';
import { CreateUomDto } from '../dto/create-uom.dto';

/**
 * Controller xử lý các endpoints liên quan đến Item UOMs
 *
 * Nested routes: /items/:itemPublicId/uoms/*
 *
 * Bao gồm:
 * - Thêm/xóa UOM cho Item
 * - Query UOMs của Item
 */
@ApiTags('Item UOMs')
@Controller('items/:itemPublicId/uoms')
export class ItemUomsController {
  constructor(
    private readonly itemAggregateService: ItemAggregateService,
    private readonly itemQueryService: ItemQueryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add UOM to item' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  create(
    @Param('itemPublicId') itemPublicId: string,
    @Body() dto: CreateUomDto,
  ) {
    return this.itemAggregateService.addUomToItemByPublicId(itemPublicId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all UOMs for item' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  findAll(@Param('itemPublicId') itemPublicId: string) {
    return this.itemQueryService.findUomsByItemPublicId(itemPublicId);
  }

  @Get(':uomCode')
  @ApiOperation({ summary: 'Get specific UOM' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  @ApiParam({ name: 'uomCode', description: 'UOM Code' })
  findOne(
    @Param('itemPublicId') itemPublicId: string,
    @Param('uomCode') uomCode: string,
  ) {
    return this.itemQueryService.findUomByItemPublicIdAndCode(itemPublicId, uomCode);
  }

  @Delete(':uomCode')
  @ApiOperation({ summary: 'Remove UOM from item' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  @ApiParam({ name: 'uomCode', description: 'UOM Code' })
  remove(
    @Param('itemPublicId') itemPublicId: string,
    @Param('uomCode') uomCode: string,
  ) {
    return this.itemAggregateService.removeUomByPublicId(itemPublicId, uomCode);
  }
}
