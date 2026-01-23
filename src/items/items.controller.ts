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
import { ItemAggregateService } from './application/item-aggregate.service';
import { ItemQueryService } from './application/item-query.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemFilterDto } from './dto/item-filter.dto';
import { ModelFilterDto } from './dto/model-filter.dto';
import { SkuFilterDto } from './dto/sku-filter.dto';
import {
  CreateModelDto,
  UpdateModelDto,
  CreateSkuDto,
  UpdateSkuDto,
  CreateUomDto,
} from './application/item-aggregate.service';

@ApiTags('Items')
@Controller('items')
export class ItemsController {
  constructor(
    private readonly itemAggregateService: ItemAggregateService,
    private readonly itemQueryService: ItemQueryService,
  ) {}

  // ==================== ITEM ENDPOINTS ====================

  @Post()
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({ status: 201, description: 'Item created successfully' })
  createItem(@Body() dto: CreateItemDto) {
    return this.itemAggregateService.createItem(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all items with filtering, sorting, and pagination' })
  @ApiResponse({ status: 200, description: 'Return all items' })
  findAllItems(@Query() filterDto: ItemFilterDto) {
    return this.itemQueryService.findAllWithFilters(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiResponse({ status: 200, description: 'Return the item' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  findItemById(@Param('id', ParseIntPipe) id: number) {
    return this.itemAggregateService.getItemById(id);
  }

  @Get(':id/complete')
  @ApiOperation({ summary: 'Get item with all children (models, skus, uoms)' })
  @ApiResponse({ status: 200, description: 'Return the complete item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  findItemComplete(@Param('id', ParseIntPipe) id: number) {
    return this.itemAggregateService.getItemComplete(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemDto,
  ) {
    return this.itemAggregateService.updateItem(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  deleteItem(@Param('id', ParseIntPipe) id: number) {
    return this.itemAggregateService.deleteItem(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  activateItem(@Param('id', ParseIntPipe) id: number) {
    return this.itemAggregateService.activateItem(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  deactivateItem(@Param('id', ParseIntPipe) id: number) {
    return this.itemAggregateService.deactivateItem(id);
  }

  @Patch(':id/draft')
  @ApiOperation({ summary: 'Set item status to draft' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  setItemDraft(@Param('id', ParseIntPipe) id: number) {
    return this.itemAggregateService.setItemDraft(id);
  }

  // ==================== MODEL ENDPOINTS (Nested) ====================

  @Post(':id/models')
  @ApiOperation({ summary: 'Add model to item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  addModel(
    @Param('id', ParseIntPipe) itemId: number,
    @Body() dto: CreateModelDto,
  ) {
    return this.itemAggregateService.addModelToItem(itemId, dto);
  }

  @Get(':id/models')
  @ApiOperation({ summary: 'Get all models for item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  getModelsByItem(
    @Param('id', ParseIntPipe) itemId: number,
    @Query() filterDto: ModelFilterDto,
  ) {
    return this.itemQueryService.findModelsByItemId(itemId, filterDto);
  }

  @Get(':id/models/:modelId')
  @ApiOperation({ summary: 'Get specific model' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiParam({ name: 'modelId', description: 'Model ID' })
  getModel(
    @Param('id', ParseIntPipe) itemId: number,
    @Param('modelId', ParseIntPipe) modelId: number,
  ) {
    return this.itemQueryService.findModelById(modelId);
  }

  @Patch(':id/models/:modelId')
  @ApiOperation({ summary: 'Update model' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiParam({ name: 'modelId', description: 'Model ID' })
  updateModel(
    @Param('id', ParseIntPipe) itemId: number,
    @Param('modelId', ParseIntPipe) modelId: number,
    @Body() dto: UpdateModelDto,
  ) {
    return this.itemAggregateService.updateModel(itemId, modelId, dto);
  }

  @Delete(':id/models/:modelId')
  @ApiOperation({ summary: 'Remove model from item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiParam({ name: 'modelId', description: 'Model ID' })
  removeModel(
    @Param('id', ParseIntPipe) itemId: number,
    @Param('modelId', ParseIntPipe) modelId: number,
  ) {
    return this.itemAggregateService.removeModel(itemId, modelId);
  }

  @Patch(':id/models/:modelId/activate')
  @ApiOperation({ summary: 'Activate model' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiParam({ name: 'modelId', description: 'Model ID' })
  activateModel(
    @Param('id', ParseIntPipe) itemId: number,
    @Param('modelId', ParseIntPipe) modelId: number,
  ) {
    return this.itemAggregateService.activateModel(itemId, modelId);
  }

  @Patch(':id/models/:modelId/deactivate')
  @ApiOperation({ summary: 'Deactivate model' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiParam({ name: 'modelId', description: 'Model ID' })
  deactivateModel(
    @Param('id', ParseIntPipe) itemId: number,
    @Param('modelId', ParseIntPipe) modelId: number,
  ) {
    return this.itemAggregateService.deactivateModel(itemId, modelId);
  }

  // ==================== SKU ENDPOINTS (Nested) ====================

  @Post(':id/models/:modelId/skus')
  @ApiOperation({ summary: 'Add SKU to model' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiParam({ name: 'modelId', description: 'Model ID' })
  addSkuToModel(
    @Param('id', ParseIntPipe) itemId: number,
    @Param('modelId', ParseIntPipe) modelId: number,
    @Body() dto: CreateSkuDto,
  ) {
    return this.itemAggregateService.addSkuToItem(itemId, modelId, dto);
  }

  @Post(':id/skus')
  @ApiOperation({ summary: 'Add SKU directly to item (without model)' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  addSkuToItem(
    @Param('id', ParseIntPipe) itemId: number,
    @Body() dto: CreateSkuDto,
  ) {
    return this.itemAggregateService.addSkuToItem(itemId, null, dto);
  }

  @Get(':id/skus')
  @ApiOperation({ summary: 'Get all SKUs for item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  getSkusByItem(
    @Param('id', ParseIntPipe) itemId: number,
    @Query() filterDto: SkuFilterDto,
  ) {
    return this.itemQueryService.findSkusByItemId(itemId, filterDto);
  }

  @Get(':id/models/:modelId/skus')
  @ApiOperation({ summary: 'Get all SKUs for model' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiParam({ name: 'modelId', description: 'Model ID' })
  getSkusByModel(
    @Param('id', ParseIntPipe) itemId: number,
    @Param('modelId', ParseIntPipe) modelId: number,
    @Query() filterDto: SkuFilterDto,
  ) {
    return this.itemQueryService.findSkusByModelId(modelId, filterDto);
  }

  @Get(':id/skus/:skuId')
  @ApiOperation({ summary: 'Get specific SKU' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiParam({ name: 'skuId', description: 'SKU ID' })
  getSku(
    @Param('id', ParseIntPipe) itemId: number,
    @Param('skuId', ParseIntPipe) skuId: number,
  ) {
    return this.itemQueryService.findSkuById(skuId);
  }

  @Patch(':id/skus/:skuId')
  @ApiOperation({ summary: 'Update SKU' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiParam({ name: 'skuId', description: 'SKU ID' })
  updateSku(
    @Param('id', ParseIntPipe) itemId: number,
    @Param('skuId', ParseIntPipe) skuId: number,
    @Body() dto: UpdateSkuDto,
  ) {
    return this.itemAggregateService.updateSku(itemId, skuId, dto);
  }

  @Delete(':id/skus/:skuId')
  @ApiOperation({ summary: 'Remove SKU' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiParam({ name: 'skuId', description: 'SKU ID' })
  removeSku(
    @Param('id', ParseIntPipe) itemId: number,
    @Param('skuId', ParseIntPipe) skuId: number,
  ) {
    return this.itemAggregateService.removeSku(itemId, skuId);
  }

  @Patch(':id/skus/:skuId/activate')
  @ApiOperation({ summary: 'Activate SKU' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiParam({ name: 'skuId', description: 'SKU ID' })
  activateSku(
    @Param('id', ParseIntPipe) itemId: number,
    @Param('skuId', ParseIntPipe) skuId: number,
  ) {
    return this.itemAggregateService.activateSku(itemId, skuId);
  }

  @Patch(':id/skus/:skuId/deactivate')
  @ApiOperation({ summary: 'Deactivate SKU' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiParam({ name: 'skuId', description: 'SKU ID' })
  deactivateSku(
    @Param('id', ParseIntPipe) itemId: number,
    @Param('skuId', ParseIntPipe) skuId: number,
  ) {
    return this.itemAggregateService.deactivateSku(itemId, skuId);
  }

  // ==================== UOM ENDPOINTS (Nested) ====================

  @Post(':id/uoms')
  @ApiOperation({ summary: 'Add UOM to item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  addUom(
    @Param('id', ParseIntPipe) itemId: number,
    @Body() dto: CreateUomDto,
  ) {
    return this.itemAggregateService.addUomToItem(itemId, dto);
  }

  @Get(':id/uoms')
  @ApiOperation({ summary: 'Get all UOMs for item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  getUomsByItem(@Param('id', ParseIntPipe) itemId: number) {
    return this.itemQueryService.findUomsByItemId(itemId);
  }

  @Get(':id/uoms/:uomCode')
  @ApiOperation({ summary: 'Get specific UOM' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiParam({ name: 'uomCode', description: 'UOM Code' })
  getUom(
    @Param('id', ParseIntPipe) itemId: number,
    @Param('uomCode') uomCode: string,
  ) {
    return this.itemQueryService.findUomByItemAndCode(itemId, uomCode);
  }

  @Delete(':id/uoms/:uomCode')
  @ApiOperation({ summary: 'Remove UOM from item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiParam({ name: 'uomCode', description: 'UOM Code' })
  removeUom(
    @Param('id', ParseIntPipe) itemId: number,
    @Param('uomCode') uomCode: string,
  ) {
    return this.itemAggregateService.removeUom(itemId, uomCode);
  }
}
