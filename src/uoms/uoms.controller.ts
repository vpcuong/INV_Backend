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
import { UomsService } from './uoms.service';
import { CreateUomDto } from './dto/create-uom.dto';
import { UpdateUomDto } from './dto/update-uom.dto';

@ApiTags('uoms')
@Controller('uoms')
export class UomsController {
  constructor(private readonly uomsService: UomsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new UOM' })
  @ApiResponse({ status: 201, description: 'UOM created successfully' })
  @ApiResponse({ status: 409, description: 'UOM code already exists' })
  @ApiResponse({ status: 404, description: 'UOM class not found' })
  create(@Body() createUomDto: CreateUomDto) {
    return this.uomsService.create(createUomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all UOMs' })
  @ApiResponse({ status: 200, description: 'Returns all UOMs' })
  findAll() {
    return this.uomsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get UOM by ID' })
  @ApiResponse({ status: 200, description: 'Returns the UOM' })
  @ApiResponse({ status: 404, description: 'UOM not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.uomsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update UOM' })
  @ApiResponse({ status: 200, description: 'UOM updated successfully' })
  @ApiResponse({ status: 404, description: 'UOM or UOM class not found' })
  @ApiResponse({ status: 409, description: 'UOM code already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUomDto: UpdateUomDto,
  ) {
    return this.uomsService.update(id, updateUomDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete UOM' })
  @ApiResponse({ status: 204, description: 'UOM deleted' })
  @ApiResponse({ status: 404, description: 'UOM not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete UOM with conversions or items' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.uomsService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate UOM' })
  @ApiResponse({ status: 200, description: 'UOM activated' })
  @ApiResponse({ status: 404, description: 'UOM not found' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.uomsService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate UOM' })
  @ApiResponse({ status: 200, description: 'UOM deactivated' })
  @ApiResponse({ status: 404, description: 'UOM not found' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.uomsService.deactivate(id);
  }
}
