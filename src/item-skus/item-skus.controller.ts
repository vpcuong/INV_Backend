import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ItemSkuService } from './application/item-sku.service';
import { CreateItemSkuDto } from './dto/create-item-sku.dto';
import { UpdateItemSkuDto } from './dto/update-item-sku.dto';

@ApiTags('ItemSKUs')
@Controller('item-skus')
export class ItemSkusController {
  constructor(private readonly service: ItemSkuService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new item SKU',
    description: 'Creates a new SKU variant for an item with specific color, gender, and size combinations. SKU code will be auto-generated if not provided.',
  })
  @ApiResponse({
    status: 201,
    description: 'Item SKU created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  create(@Body() createDto: CreateItemSkuDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all item SKUs',
    description: 'Retrieves a list of all item SKUs with their associated color, gender, size, and theme details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all item SKUs',
  })
  findAll() {
    return this.service.findAll();
  }

  @Get('item/:itemId')
  @ApiOperation({
    summary: 'Get SKUs by item ID',
    description: 'Retrieves all SKU variants for a specific item.',
  })
  @ApiParam({
    name: 'itemId',
    description: 'The ID of the item',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all SKUs for the specified item',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found',
  })
  findByItemId(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.service.findByItemId(itemId);
  }

  @Get('model/:modelId')
  @ApiOperation({
    summary: 'Get SKUs by model ID',
    description: 'Retrieves all SKU variants for a specific item model.',
  })
  @ApiParam({
    name: 'modelId',
    description: 'The ID of the item model',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all SKUs for the specified model',
  })
  @ApiResponse({
    status: 404,
    description: 'Model not found',
  })
  findByModelId(@Param('modelId', ParseIntPipe) modelId: number) {
    return this.service.findByModelId(modelId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get item SKU by ID',
    description: 'Retrieves a specific item SKU with all related details including color, gender, size, and theme information.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the SKU',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the item SKU',
  })
  @ApiResponse({
    status: 404,
    description: 'Item SKU not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an item SKU',
    description: 'Updates an existing item SKU. Can modify prices, dimensions, status, and other SKU properties.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the SKU to update',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Item SKU updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Item SKU not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateItemSkuDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Activate an item SKU',
    description: 'Sets the status of an item SKU to active, making it available for use.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the SKU to activate',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Item SKU activated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Item SKU not found',
  })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.service.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate an item SKU',
    description: 'Sets the status of an item SKU to inactive, making it unavailable for use.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the SKU to deactivate',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Item SKU deactivated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Item SKU not found',
  })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.service.deactivate(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an item SKU',
    description: 'Permanently deletes an item SKU from the system.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the SKU to delete',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Item SKU deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Item SKU not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete SKU - it may be referenced by other records',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
