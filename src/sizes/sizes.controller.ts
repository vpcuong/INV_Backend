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
import { SizeService } from './application/size.service';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';

@ApiTags('sizes')
@Controller('sizes')
export class SizesController {
  constructor(private readonly sizesService: SizeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new size' })
  @ApiResponse({ status: 201, description: 'Size created successfully' })
  @ApiResponse({ status: 409, description: 'Size code already exists' })
  create(@Body() createSizeDto: CreateSizeDto) {
    return this.sizesService.create(createSizeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sizes' })
  @ApiResponse({ status: 200, description: 'Returns all sizes' })
  findAll() {
    return this.sizesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get size by ID' })
  @ApiResponse({ status: 200, description: 'Returns the size' })
  @ApiResponse({ status: 404, description: 'Size not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sizesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update size' })
  @ApiResponse({ status: 200, description: 'Size updated successfully' })
  @ApiResponse({ status: 404, description: 'Size not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSizeDto: UpdateSizeDto,
  ) {
    return this.sizesService.update(id, updateSizeDto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate size' })
  @ApiResponse({ status: 200, description: 'Size activated' })
  @ApiResponse({ status: 404, description: 'Size not found' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.sizesService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate size' })
  @ApiResponse({ status: 200, description: 'Size deactivated' })
  @ApiResponse({ status: 404, description: 'Size not found' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.sizesService.deactivate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete size' })
  @ApiResponse({ status: 204, description: 'Size deleted' })
  @ApiResponse({ status: 404, description: 'Size not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sizesService.remove(id);
  }
}
