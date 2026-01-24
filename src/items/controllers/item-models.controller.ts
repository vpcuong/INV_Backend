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
import { ItemAggregateService, CreateModelDto, UpdateModelDto } from '../application/item-aggregate.service';
import { ItemQueryService } from '../application/item-query.service';
import { ModelFilterDto } from '../dto/model-filter.dto';

/**
 * Controller xử lý các endpoints liên quan đến Item Models
 *
 * Nested routes: /items/:itemId/models/*
 *
 * Bao gồm:
 * - CRUD operations cho Model
 * - Status management (activate, deactivate)
 */
@ApiTags('Item Models')
@Controller('items/:itemId/models')
export class ItemModelsController {
  constructor(
    private readonly itemAggregateService: ItemAggregateService,
    private readonly itemQueryService: ItemQueryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add model to item' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  create(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: CreateModelDto,
  ) {
    return this.itemAggregateService.addModelToItem(itemId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all models for item' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  findAll(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Query() filterDto: ModelFilterDto,
  ) {
    return this.itemQueryService.findModelsByItemId(itemId, filterDto);
  }

  @Get(':modelId')
  @ApiOperation({ summary: 'Get specific model' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiParam({ name: 'modelId', description: 'Model ID' })
  findOne(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('modelId', ParseIntPipe) modelId: number,
  ) {
    return this.itemQueryService.findModelById(modelId);
  }

  @Patch(':modelId')
  @ApiOperation({ summary: 'Update model' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiParam({ name: 'modelId', description: 'Model ID' })
  update(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('modelId', ParseIntPipe) modelId: number,
    @Body() dto: UpdateModelDto,
  ) {
    return this.itemAggregateService.updateModel(itemId, modelId, dto);
  }

  @Delete(':modelId')
  @ApiOperation({ summary: 'Remove model from item' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiParam({ name: 'modelId', description: 'Model ID' })
  remove(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('modelId', ParseIntPipe) modelId: number,
  ) {
    return this.itemAggregateService.removeModel(itemId, modelId);
  }

  @Patch(':modelId/activate')
  @ApiOperation({ summary: 'Activate model' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiParam({ name: 'modelId', description: 'Model ID' })
  activate(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('modelId', ParseIntPipe) modelId: number,
  ) {
    return this.itemAggregateService.activateModel(itemId, modelId);
  }

  @Patch(':modelId/deactivate')
  @ApiOperation({ summary: 'Deactivate model' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiParam({ name: 'modelId', description: 'Model ID' })
  deactivate(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('modelId', ParseIntPipe) modelId: number,
  ) {
    return this.itemAggregateService.deactivateModel(itemId, modelId);
  }
}