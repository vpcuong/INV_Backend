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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@ApiTags('Items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({ status: 201, description: 'Item created successfully' })
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(createItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all items' })
  @ApiResponse({ status: 200, description: 'Return all items' })
  findAll() {
    return this.itemsService.findAll();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search items by searchTerm',
    description: 'Searches through name, model, and notes fields (case-insensitive)',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search term to find in name, model, or notes',
    example: 'shirt',
  })
  @ApiResponse({
    status: 200,
    description: 'Return matching items',
  })
  search(@Query('search') search: string) {
    return this.itemsService.search(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiResponse({ status: 200, description: 'Return the item' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemDto: UpdateItemDto
  ) {
    return this.itemsService.update(id, updateItemDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.remove(id);
  }

  @Patch(':id/activate')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.activate(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.deactivate(id);
  }
}
