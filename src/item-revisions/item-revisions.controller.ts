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
import { ItemRevisionsService } from './item-revisions.service';
import { CreateItemRevisionDto } from './dto/create-item-revision.dto';
import { UpdateItemRevisionDto } from './dto/update-item-revision.dto';

@Controller('item-revisions')
export class ItemRevisionsController {
  constructor(
    private readonly itemRevisionsService: ItemRevisionsService,
  ) {}

  @Post()
  create(@Body() createItemRevisionDto: CreateItemRevisionDto) {
    return this.itemRevisionsService.create(createItemRevisionDto);
  }

  @Get()
  findAll() {
    return this.itemRevisionsService.findAll();
  }

  @Get('item/:itemId')
  findByItemId(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.itemRevisionsService.findByItemId(itemId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemRevisionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemRevisionDto: UpdateItemRevisionDto,
  ) {
    return this.itemRevisionsService.update(id, updateItemRevisionDto);
  }

  @Patch(':id/activate')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.itemRevisionsService.activate(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.itemRevisionsService.deactivate(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemRevisionsService.remove(id);
  }
}
