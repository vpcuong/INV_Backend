import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ItemCategoryService } from './application/item-category.service';
import { ItemCategoryQueryService } from './application/item-category-query.service';
import { CreateProductCategoryDto } from './dto/create-item-category.dto';
import { UpdateProductCategoryDto } from './dto/update-item-category.dto';
import { ItemCategoryFilterDto } from './dto/item-category-filter.dto';

@ApiTags('Item Categories')
@ApiBearerAuth()
@Controller('item-categories')
export class ItemCategoriesController {
  constructor(
    private readonly itemCategoryService: ItemCategoryService,
    private readonly itemCategoryQueryService: ItemCategoryQueryService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new item category' })
  @ApiResponse({
    status: 201,
    description: 'Item category created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Item category code already exists',
  })
  create(@Body() createDto: CreateProductCategoryDto) {
    return this.itemCategoryService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all item categories with filtering and pagination',
  })
  @ApiResponse({ status: 200, description: 'List of item categories' })
  findAll(@Query() filterDto: ItemCategoryFilterDto) {
    return this.itemCategoryQueryService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item category by ID' })
  @ApiParam({ name: 'id', description: 'Item category ID' })
  @ApiResponse({ status: 200, description: 'Item category found' })
  @ApiResponse({ status: 404, description: 'Item category not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemCategoryQueryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update item category' })
  @ApiParam({ name: 'id', description: 'Item category ID' })
  @ApiResponse({
    status: 200,
    description: 'Item category updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Item category not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProductCategoryDto
  ) {
    return this.itemCategoryService.update(id, updateDto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate item category' })
  @ApiParam({ name: 'id', description: 'Item category ID' })
  @ApiResponse({ status: 200, description: 'Item category activated' })
  @ApiResponse({ status: 404, description: 'Item category not found' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.itemCategoryService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate item category' })
  @ApiParam({ name: 'id', description: 'Item category ID' })
  @ApiResponse({ status: 200, description: 'Item category deactivated' })
  @ApiResponse({ status: 404, description: 'Item category not found' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.itemCategoryService.deactivate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete item category' })
  @ApiParam({ name: 'id', description: 'Item category ID' })
  @ApiResponse({ status: 204, description: 'Item category deleted' })
  @ApiResponse({ status: 404, description: 'Item category not found' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.itemCategoryService.delete(id);
  }
}
