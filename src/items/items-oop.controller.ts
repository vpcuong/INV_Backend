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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ItemApplicationService } from './application/item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

/**
 * OOP-based Items Controller
 * Demonstrates domain-driven design approach
 */
@ApiTags('Items (OOP)')
@Controller('items-oop')
export class ItemsOOPController {
  constructor(
    private readonly itemApplicationService: ItemApplicationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new item (OOP approach)' })
  @ApiResponse({ status: 201, description: 'Item created successfully' })
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemApplicationService.createItem(createItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all items (OOP approach)' })
  @ApiResponse({ status: 200, description: 'Return all items' })
  findAll() {
    return this.itemApplicationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID (OOP approach)' })
  @ApiResponse({ status: 200, description: 'Return the item' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemApplicationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update item (OOP approach)' })
  @ApiResponse({ status: 200, description: 'Item updated successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemApplicationService.update(id, updateItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete item (OOP approach)' })
  @ApiResponse({ status: 200, description: 'Item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete item with UOMs or SKUs',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemApplicationService.remove(id);
  }

  @Patch(':id/price')
  @ApiOperation({ summary: 'Update item price with business rules (OOP)' })
  @ApiResponse({ status: 200, description: 'Price updated successfully' })
  updatePrice(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { costPrice?: number; sellingPrice?: number },
  ) {
    return this.itemApplicationService.updatePrice(
      id,
      body.costPrice,
      body.sellingPrice,
    );
  }

  @Get(':id/convert-quantity')
  @ApiOperation({ summary: 'Convert quantity between UOMs (OOP)' })
  @ApiResponse({ status: 200, description: 'Return converted quantity' })
  async convertQuantity(
    @Param('id', ParseIntPipe) id: number,
    @Query('fromUomCode') fromUomCode: string,
    @Query('toUomCode') toUomCode: string,
    @Query('quantity') quantity: string,
  ) {
    const result = await this.itemApplicationService.convertQuantity(
      id,
      fromUomCode,
      toUomCode,
      parseFloat(quantity),
    );

    return {
      itemId: id,
      fromUomCode,
      toUomCode,
      originalQuantity: parseFloat(quantity),
      convertedQuantity: result,
    };
  }
}