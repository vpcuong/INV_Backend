import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ItemQueryService } from '../application/item-query.service';
import { ItemAggregateService } from '../application/item-aggregate.service';
import { ModelFilterDto } from '../dto/model-filter.dto';
import { UpdateModelDto } from '../dto/update-model.dto';

/**
 * Controller xử lý các endpoints Model trực tiếp
 *
 * Endpoint: /models
 *
 * Cho phép thao tác với Model mà không cần biết itemPublicId
 */
@ApiTags('Models')
@ApiBearerAuth()
@Controller('models')
export class ModelsController {
  constructor(
    private readonly itemQueryService: ItemQueryService,
    private readonly itemAggregateService: ItemAggregateService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Search all Models with filtering, sorting, and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Return paginated Models matching the filter criteria',
  })
  findAll(@Query() filterDto: ModelFilterDto) {
    return this.itemQueryService.findAllModelsWithFilters(filterDto);
  }

  @Get(':publicId')
  @ApiOperation({
    summary: 'Get Model by publicId',
  })
  @ApiParam({
    name: 'publicId',
    description: 'Model public ID (ULID)',
    example: '01HXK5Z3ABCDEFGHJKLMNPQRST',
  })
  @ApiResponse({
    status: 200,
    description: 'Return Model details',
  })
  @ApiResponse({
    status: 404,
    description: 'Model not found',
  })
  findOne(@Param('publicId') publicId: string) {
    return this.itemQueryService.findModelByPublicId(publicId);
  }

  @Patch(':publicId')
  @ApiOperation({
    summary: 'Update Model by publicId',
  })
  @ApiParam({
    name: 'publicId',
    description: 'Model public ID (ULID)',
    example: '01HXK5Z3ABCDEFGHJKLMNPQRST',
  })
  @ApiResponse({
    status: 404,
    description: 'Model not found',
  })
  update(
    @Param('publicId') publicId: string,
    @Body() updateModelDto: UpdateModelDto,
  ) {
    return this.itemAggregateService.updateModelDirect(publicId, updateModelDto);
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete Model by publicId',
  })
  @ApiParam({
    name: 'publicId',
    description: 'Model public ID (ULID)',
    example: '01HXK5Z3ABCDEFGHJKLMNPQRST',
  })
  @ApiResponse({
    status: 204,
    description: 'Model deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Model not found',
  })
  remove(@Param('publicId') publicId: string) {
    return this.itemAggregateService.deleteModelDirect(publicId);
  }

  @Patch(':publicId/activate')
  @ApiOperation({
    summary: 'Activate Model by publicId',
  })
  @ApiParam({
    name: 'publicId',
    description: 'Model public ID (ULID)',
    example: '01HXK5Z3ABCDEFGHJKLMNPQRST',
  })
  @ApiResponse({
    status: 200,
    description: 'Model activated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Model not found',
  })
  activate(@Param('publicId') publicId: string) {
    return this.itemAggregateService.activateModelDirect(publicId);
  }

  @Patch(':publicId/deactivate')
  @ApiOperation({
    summary: 'Deactivate Model by publicId',
  })
  @ApiParam({
    name: 'publicId',
    description: 'Model public ID (ULID)',
    example: '01HXK5Z3ABCDEFGHJKLMNPQRST',
  })
  @ApiResponse({
    status: 200,
    description: 'Model deactivated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Model not found',
  })
  deactivate(@Param('publicId') publicId: string) {
    return this.itemAggregateService.deactivateModelDirect(publicId);
  }
}