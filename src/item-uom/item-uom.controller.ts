import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ItemUomService } from './item-uom.service';
import { CreateItemUomDto } from './dto/create-item-uom.dto';
import { UpdateItemUomDto } from './dto/update-item-uom.dto';

@ApiTags('Item UOM')
@Controller('item-uom')
export class ItemUomController {
  constructor(private readonly itemUomService: ItemUomService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ItemUOM' })
  @ApiResponse({ status: 201, description: 'ItemUOM created successfully' })
  @ApiResponse({ status: 404, description: 'Item or UOM not found' })
  @ApiResponse({ status: 409, description: 'ItemUOM already exists' })
  create(@Body() createItemUomDto: CreateItemUomDto) {
    return this.itemUomService.create(createItemUomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ItemUOMs with filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'itemId', required: false, type: Number })
  @ApiQuery({ name: 'uomCode', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isPurchasingUom', required: false, type: Boolean })
  @ApiQuery({ name: 'isSalesUom', required: false, type: Boolean })
  @ApiQuery({ name: 'isManufacturingUom', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Return all ItemUOMs' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('itemId') itemId?: string,
    @Query('uomCode') uomCode?: string,
    @Query('isActive') isActive?: string,
    @Query('isPurchasingUom') isPurchasingUom?: string,
    @Query('isSalesUom') isSalesUom?: string,
    @Query('isManufacturingUom') isManufacturingUom?: string
  ) {
    return this.itemUomService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      itemId: itemId ? parseInt(itemId) : undefined,
      uomCode: uomCode,
      isActive: isActive ? isActive === 'true' : undefined,
      isPurchasingUom: isPurchasingUom ? isPurchasingUom === 'true' : undefined,
      isSalesUom: isSalesUom ? isSalesUom === 'true' : undefined,
      isManufacturingUom: isManufacturingUom
        ? isManufacturingUom === 'true'
        : undefined,
    });
  }

  @Get('item/:itemId')
  @ApiOperation({ summary: 'Get all UOMs for an Item' })
  @ApiResponse({ status: 200, description: 'Return all UOMs for the item' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  findByItemId(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.itemUomService.findByItemId(itemId);
  }

  @Get('item/:itemId/uom/:uomCode')
  @ApiOperation({ summary: 'Get ItemUOM by Item ID and UOM code' })
  @ApiResponse({ status: 200, description: 'Return the ItemUOM' })
  @ApiResponse({ status: 404, description: 'ItemUOM not found' })
  findByItemAndUom(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('uomCode') uomCode: string
  ) {
    return this.itemUomService.findByItemAndUom(itemId, uomCode);
  }

  @Get('convert/:itemId/:fromUomCode/:toUomCode/:quantity')
  @ApiOperation({ summary: 'Convert quantity between UOMs' })
  @ApiResponse({ status: 200, description: 'Return converted quantity' })
  @ApiResponse({ status: 404, description: 'ItemUOM not found' })
  async convertQuantity(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('fromUomCode') fromUomCode: string,
    @Param('toUomCode') toUomCode: string,
    @Param('quantity') quantity: string
  ) {
    const result = await this.itemUomService.convertQuantity(
      itemId,
      fromUomCode,
      toUomCode,
      parseFloat(quantity)
    );

    return {
      itemId,
      fromUomCode,
      toUomCode,
      originalQuantity: parseFloat(quantity),
      convertedQuantity: result,
    };
  }

  @Get(':itemId/:uomCode')
  @ApiOperation({ summary: 'Get ItemUOM by composite key (itemId, uomCode)' })
  @ApiResponse({ status: 200, description: 'Return the ItemUOM' })
  @ApiResponse({ status: 404, description: 'ItemUOM not found' })
  findOne(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('uomCode') uomCode: string
  ) {
    return this.itemUomService.findOne(itemId, uomCode);
  }

  @Patch(':itemId/:uomCode')
  @ApiOperation({ summary: 'Update ItemUOM' })
  @ApiResponse({ status: 200, description: 'ItemUOM updated successfully' })
  @ApiResponse({ status: 404, description: 'ItemUOM not found' })
  update(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('uomCode') uomCode: string,
    @Body() updateItemUomDto: UpdateItemUomDto
  ) {
    return this.itemUomService.update(itemId, uomCode, updateItemUomDto);
  }

  @Delete(':itemId/:uomCode')
  @ApiOperation({ summary: 'Delete ItemUOM' })
  @ApiResponse({ status: 200, description: 'ItemUOM deleted successfully' })
  @ApiResponse({ status: 404, description: 'ItemUOM not found' })
  remove(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('uomCode') uomCode: string
  ) {
    return this.itemUomService.remove(itemId, uomCode);
  }
}
