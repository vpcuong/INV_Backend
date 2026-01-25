import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ItemAggregateService, CreateModelDto, UpdateModelDto } from '../application/item-aggregate.service';
import { ItemQueryService } from '../application/item-query.service';
import { ModelFilterDto } from '../dto/model-filter.dto';

/**
 * Controller xử lý các endpoints liên quan đến Item Models
 *
 * Nested routes: /items/:itemPublicId/models/*
 *
 * Bao gồm:
 * - CRUD operations cho Model
 * - Status management (activate, deactivate)
 */
@ApiTags('Item Models')
@Controller('items/:itemPublicId/models')
export class ItemModelsController {
  constructor(
    private readonly itemAggregateService: ItemAggregateService,
    private readonly itemQueryService: ItemQueryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add model to item' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  create(
    @Param('itemPublicId') itemPublicId: string,
    @Body() dto: CreateModelDto,
  ) {
    return this.itemAggregateService.addModelToItemByPublicId(itemPublicId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all models for item' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  findAll(
    @Param('itemPublicId') itemPublicId: string,
    @Query() filterDto: ModelFilterDto,
  ) {
    return this.itemQueryService.findModelsByItemPublicId(itemPublicId, filterDto);
  }

  @Get(':modelPublicId')
  @ApiOperation({ summary: 'Get specific model' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  @ApiParam({ name: 'modelPublicId', description: 'Model Public ID (ULID)' })
  findOne(
    @Param('itemPublicId') itemPublicId: string,
    @Param('modelPublicId') modelPublicId: string,
  ) {
    return this.itemQueryService.findModelByPublicId(modelPublicId);
  }

  @Patch(':modelPublicId')
  @ApiOperation({ summary: 'Update model' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  @ApiParam({ name: 'modelPublicId', description: 'Model Public ID (ULID)' })
  update(
    @Param('itemPublicId') itemPublicId: string,
    @Param('modelPublicId') modelPublicId: string,
    @Body() dto: UpdateModelDto,
  ) {
    return this.itemAggregateService.updateModelByPublicId(itemPublicId, modelPublicId, dto);
  }

  @Delete(':modelPublicId')
  @ApiOperation({ summary: 'Remove model from item' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  @ApiParam({ name: 'modelPublicId', description: 'Model Public ID (ULID)' })
  remove(
    @Param('itemPublicId') itemPublicId: string,
    @Param('modelPublicId') modelPublicId: string,
  ) {
    return this.itemAggregateService.removeModelByPublicId(itemPublicId, modelPublicId);
  }

  @Patch(':modelPublicId/activate')
  @ApiOperation({ summary: 'Activate model' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  @ApiParam({ name: 'modelPublicId', description: 'Model Public ID (ULID)' })
  activate(
    @Param('itemPublicId') itemPublicId: string,
    @Param('modelPublicId') modelPublicId: string,
  ) {
    return this.itemAggregateService.activateModelByPublicId(itemPublicId, modelPublicId);
  }

  @Patch(':modelPublicId/deactivate')
  @ApiOperation({ summary: 'Deactivate model' })
  @ApiParam({ name: 'itemPublicId', description: 'Item Public ID (ULID)' })
  @ApiParam({ name: 'modelPublicId', description: 'Model Public ID (ULID)' })
  deactivate(
    @Param('itemPublicId') itemPublicId: string,
    @Param('modelPublicId') modelPublicId: string,
  ) {
    return this.itemAggregateService.deactivateModelByPublicId(itemPublicId, modelPublicId);
  }
}
