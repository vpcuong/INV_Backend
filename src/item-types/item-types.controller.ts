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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ItemTypeService } from './application/item-type.service';
import { CreateItemTypeDto } from './dto/create-item-type.dto';
import { UpdateItemTypeDto } from './dto/update-item-type.dto';

@ApiTags('Item-types')
@Controller('item-types')
export class ItemTypesController {
  constructor(private readonly itemTypesService: ItemTypeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new item type' })
  @ApiResponse({ status: 201, description: 'Item type created successfully' })
  @ApiResponse({ status: 409, description: 'Item type code already exists' })
  create(@Body() createItemTypeDto: CreateItemTypeDto) {
    return this.itemTypesService.create(createItemTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all item types' })
  @ApiResponse({ status: 200, description: 'Returns all item types' })
  findAll() {
    return this.itemTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item type by ID' })
  @ApiResponse({ status: 200, description: 'Returns the item type' })
  @ApiResponse({ status: 404, description: 'Item type not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update item type' })
  @ApiResponse({ status: 200, description: 'Item type updated successfully' })
  @ApiResponse({ status: 404, description: 'Item type not found' })
  @ApiResponse({ status: 409, description: 'Item type code already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemTypeDto: UpdateItemTypeDto
  ) {
    return this.itemTypesService.update(id, updateItemTypeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete item type' })
  @ApiResponse({ status: 204, description: 'Item type deleted' })
  @ApiResponse({ status: 404, description: 'Item type not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemTypesService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate item type' })
  @ApiResponse({ status: 200, description: 'Item type activated' })
  @ApiResponse({ status: 404, description: 'Item type not found' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.itemTypesService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate item type' })
  @ApiResponse({ status: 200, description: 'Item type deactivated' })
  @ApiResponse({ status: 404, description: 'Item type not found' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.itemTypesService.deactivate(id);
  }
}
