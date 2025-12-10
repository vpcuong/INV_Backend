import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ItemSkusService } from './item-skus.service';
import { CreateItemSkuDto } from './dto/create-item-sku.dto';
import { UpdateItemSkuDto } from './dto/update-item-sku.dto';

@Controller('item-skus')
export class ItemSkusController {
  constructor(private readonly itemSkusService: ItemSkusService) {}

  @Post()
  create(@Body() createItemSkuDto: CreateItemSkuDto) {
    return this.itemSkusService.create(createItemSkuDto);
  }

  @Get()
  findAll() {
    return this.itemSkusService.findAll();
  }

  @Get('item/:itemId')
  findByItemId(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.itemSkusService.findByItemId(itemId);
  }

  @Get('revision/:revisionId')
  findByRevisionId(@Param('revisionId', ParseIntPipe) revisionId: number) {
    return this.itemSkusService.findByRevisionId(revisionId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemSkusService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemSkuDto: UpdateItemSkuDto,
  ) {
    return this.itemSkusService.update(id, updateItemSkuDto);
  }

  @Patch(':id/activate')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.itemSkusService.activate(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.itemSkusService.deactivate(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemSkusService.remove(id);
  }
}
