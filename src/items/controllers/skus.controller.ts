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
import { SkuFilterDto } from '../dto/sku-filter.dto';
import { UpdateSkuDto } from '../dto/update-sku.dto';
import { ULIDValidationPipe } from '../../common/pipes/ulid-validation.pipe';

/**
 * Controller xử lý các endpoints SKU trực tiếp
 *
 * Endpoint: /skus
 *
 * Cho phép thao tác với SKU mà không cần biết itemPublicId
 */
@ApiTags('SKUs')
@ApiBearerAuth()
@Controller('skus')
export class SkusController {
  constructor(
    private readonly itemQueryService: ItemQueryService,
    private readonly itemAggregateService: ItemAggregateService,
  ) {}

  /**
   * Search all SKUs with filtering, sorting, and pagination
   */
  @Get()
  @ApiOperation({
    summary: 'Search all SKUs with filtering, sorting, and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Return paginated SKUs matching the filter criteria',
  })
  findAll(@Query() filterDto: SkuFilterDto) {
    return this.itemQueryService.findAllSkusWithFilters(filterDto);
  }

  @Get(':publicId')
  @ApiOperation({
    summary: 'Get SKU by publicId',
  })
  @ApiParam({
    name: 'publicId',
    description: 'SKU public ID (ULID)',
    example: '01HXK5Z3ABCDEFGHJKLMNPQRST',
  })
  @ApiResponse({
    status: 200,
    description: 'Return SKU details',
  })
  @ApiResponse({
    status: 404,
    description: 'SKU not found',
  })
  findOne(@Param('publicId', ULIDValidationPipe) publicId: string) {
    return this.itemQueryService.findSkuByPublicId(publicId);
  }

  @Patch(':publicId')
  @ApiOperation({
    summary: 'Update SKU by publicId',
  })
  @ApiParam({
    name: 'publicId',
    description: 'SKU public ID (ULID)',
    example: '01HXK5Z3ABCDEFGHJKLMNPQRST',
  })
  @ApiResponse({
    status: 200,
    description: 'SKU updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'SKU not found',
  })
  update(
    @Param('publicId', ULIDValidationPipe) publicId: string,
    @Body() updateSkuDto: UpdateSkuDto,
  ) {
    return this.itemAggregateService.updateSkuDirect(publicId, updateSkuDto);
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete SKU by publicId',
  })
  @ApiParam({
    name: 'publicId',
    description: 'SKU public ID (ULID)',
    example: '01HXK5Z3ABCDEFGHJKLMNPQRST',
  })
  @ApiResponse({
    status: 204,
    description: 'SKU deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'SKU not found',
  })
  remove(@Param('publicId', ULIDValidationPipe) publicId: string) {
    return this.itemAggregateService.deleteSkuDirect(publicId);
  }

  @Patch(':publicId/activate')
  @ApiOperation({
    summary: 'Activate SKU by publicId',
  })
  @ApiParam({
    name: 'publicId',
    description: 'SKU public ID (ULID)',
    example: '01HXK5Z3ABCDEFGHJKLMNPQRST',
  })
  @ApiResponse({
    status: 200,
    description: 'SKU activated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'SKU not found',
  })
  activate(@Param('publicId', ULIDValidationPipe) publicId: string) {
    return this.itemAggregateService.activateSkuDirect(publicId);
  }

  @Patch(':publicId/deactivate')
  @ApiOperation({
    summary: 'Deactivate SKU by publicId',
  })
  @ApiParam({
    name: 'publicId',
    description: 'SKU public ID (ULID)',
    example: '01HXK5Z3ABCDEFGHJKLMNPQRST',
  })
  @ApiResponse({
    status: 200,
    description: 'SKU deactivated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'SKU not found',
  })
  deactivate(@Param('publicId', ULIDValidationPipe) publicId: string) {
    return this.itemAggregateService.deactivateSkuDirect(publicId);
  }

  @Get('/fabrics/:colorId/:materialId')
  validFabrics(@Param('colorId') colorId: number, @Param('materialId') materialId: number){
    return this.itemQueryService.findFabricSKUs(colorId, materialId);
  }
}