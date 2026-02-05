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
import { GenderService } from './application/gender.service';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';

@ApiTags('Genders')
@Controller('genders')
export class GendersController {
  constructor(private readonly gendersService: GenderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new gender' })
  @ApiResponse({ status: 201, description: 'Gender created successfully' })
  @ApiResponse({ status: 409, description: 'Gender code already exists' })
  create(@Body() createGenderDto: CreateGenderDto) {
    return this.gendersService.create(createGenderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all genders' })
  @ApiResponse({ status: 200, description: 'Returns all genders' })
  findAll() {
    return this.gendersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get gender by ID' })
  @ApiResponse({ status: 200, description: 'Returns the gender' })
  @ApiResponse({ status: 404, description: 'Gender not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gendersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update gender' })
  @ApiResponse({ status: 200, description: 'Gender updated successfully' })
  @ApiResponse({ status: 404, description: 'Gender not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGenderDto: UpdateGenderDto
  ) {
    return this.gendersService.update(id, updateGenderDto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate gender' })
  @ApiResponse({ status: 200, description: 'Gender activated' })
  @ApiResponse({ status: 404, description: 'Gender not found' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.gendersService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate gender' })
  @ApiResponse({ status: 200, description: 'Gender deactivated' })
  @ApiResponse({ status: 404, description: 'Gender not found' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.gendersService.deactivate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete gender' })
  @ApiResponse({ status: 204, description: 'Gender deleted' })
  @ApiResponse({ status: 404, description: 'Gender not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gendersService.remove(id);
  }
}
