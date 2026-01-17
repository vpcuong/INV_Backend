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
import { ItemModelService } from './application/item-model.service';
import { CreateItemModelDto } from './dto/create-item-model.dto';
import { UpdateItemModelDto } from './dto/update-item-model.dto';

@ApiTags('Item Models')
@Controller('item-models')
export class ItemModelsController {
  constructor(private readonly service: ItemModelService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new item model',
    description: 'Creates a new model variant for an item.',
  })
  @ApiResponse({
    status: 201,
    description: 'Item model created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Model code already exists',
  })
  create(@Body() createDto: CreateItemModelDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all item models',
    description:
      'Retrieves a list of all item models with their associated item details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all item models',
  })
  findAll() {
    return this.service.findAll();
  }

  @Get('item/:itemId')
  @ApiOperation({
    summary: 'Get models by item ID',
    description: 'Retrieves all model variants for a specific item.',
  })
  @ApiParam({
    name: 'itemId',
    description: 'The ID of the item',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all models for the specified item',
  })
  findByItemId(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.service.findByItemId(itemId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get item model by ID',
    description: 'Retrieves a specific item model with all related details.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the model',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the item model',
  })
  @ApiResponse({
    status: 404,
    description: 'Item model not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an item model',
    description: 'Updates an existing item model.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the model to update',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Item model updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Item model not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateItemModelDto
  ) {
    return this.service.update(id, updateDto);
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Activate an item model',
    description: 'Sets the status of an item model to active.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the model to activate',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Item model activated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Item model not found',
  })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.service.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate an item model',
    description: 'Sets the status of an item model to inactive.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the model to deactivate',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Item model deactivated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Item model not found',
  })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.service.deactivate(id);
  }

  @Patch(':id/draft')
  @ApiOperation({
    summary: 'Change item model status to draft',
    description: 'Sets the status of an item model to draft.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the model to change to draft',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Item model status changed to draft successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Item model not found',
  })
  draft(@Param('id', ParseIntPipe) id: number) {
    return this.service.draft(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an item model',
    description: 'Permanently deletes an item model from the system.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the model to delete',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Item model deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Item model not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete model - it may be referenced by other records',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
