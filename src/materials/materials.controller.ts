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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MaterialService } from './application/material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Materials')
@ApiBearerAuth()
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new material' })
  @ApiResponse({ status: 201, description: 'Material created successfully' })
  @ApiResponse({ status: 409, description: 'Material code already exists' })
  create(
    @Body() createMaterialDto: CreateMaterialDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.materialsService.create(createMaterialDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all materials' })
  @ApiResponse({ status: 200, description: 'Returns all materials' })
  findAll() {
    return this.materialsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get material by ID' })
  @ApiResponse({ status: 200, description: 'Returns the material' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materialsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update material' })
  @ApiResponse({ status: 200, description: 'Material updated successfully' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialsService.update(id, updateMaterialDto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate material' })
  @ApiResponse({ status: 200, description: 'Material activated' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.materialsService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate material' })
  @ApiResponse({ status: 200, description: 'Material deactivated' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.materialsService.deactivate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete material' })
  @ApiResponse({ status: 204, description: 'Material deleted' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  @ApiResponse({ status: 409, description: 'Material is in use' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.materialsService.remove(id);
  }
}
