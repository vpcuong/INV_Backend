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
import { UomClassesService } from './uom-classes.service';
import { CreateUomClassDto } from './dto/create-uom-class.dto';
import { UpdateUomClassDto } from './dto/update-uom-class.dto';

@ApiTags('uom-classes')
@Controller('uom-classes')
export class UomClassesController {
  constructor(private readonly uomClassesService: UomClassesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new UOM class' })
  @ApiResponse({ status: 201, description: 'UOM class created successfully' })
  @ApiResponse({ status: 409, description: 'UOM class code already exists' })
  create(@Body() createUomClassDto: CreateUomClassDto) {
    return this.uomClassesService.create(createUomClassDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all UOM classes' })
  @ApiResponse({ status: 200, description: 'Returns all UOM classes' })
  findAll() {
    return this.uomClassesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get UOM class by ID' })
  @ApiResponse({ status: 200, description: 'Returns the UOM class' })
  @ApiResponse({ status: 404, description: 'UOM class not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.uomClassesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update UOM class' })
  @ApiResponse({ status: 200, description: 'UOM class updated successfully' })
  @ApiResponse({ status: 404, description: 'UOM class not found' })
  @ApiResponse({ status: 409, description: 'UOM class code already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUomClassDto: UpdateUomClassDto,
  ) {
    return this.uomClassesService.update(id, updateUomClassDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete UOM class' })
  @ApiResponse({ status: 204, description: 'UOM class deleted' })
  @ApiResponse({ status: 404, description: 'UOM class not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete UOM class with associated UOMs' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.uomClassesService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate UOM class' })
  @ApiResponse({ status: 200, description: 'UOM class activated' })
  @ApiResponse({ status: 404, description: 'UOM class not found' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.uomClassesService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate UOM class' })
  @ApiResponse({ status: 200, description: 'UOM class deactivated' })
  @ApiResponse({ status: 404, description: 'UOM class not found' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.uomClassesService.deactivate(id);
  }
}
