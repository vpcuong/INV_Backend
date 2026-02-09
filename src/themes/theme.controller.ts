import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ThemeService } from './application/theme.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

@ApiBearerAuth()
@Controller('themes')
@ApiTags('Themes')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Post()
  @ApiOperation({ summary: 'Create theme with optional image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'TH001' },
        desc: { type: 'string', example: 'Summer Collection' },
        supplierId: { type: 'number', example: 1 },
        colorCode: { type: 'string', example: 'RED' },
        price: { type: 'number', example: 100 },
        uom: { type: 'string', example: 'KG' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Theme image (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The theme has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createThemeDto: CreateThemeDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    return this.themeService.save(createThemeDto, image);
  }

  @Get('')
  @ApiOperation({ summary: 'Get all themes' })
  @ApiResponse({
    status: 200,
    description: 'The themes have been successfully found.',
  })
  async getAll() {
    return this.themeService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get theme by id' })
  @ApiResponse({
    status: 200,
    description: 'The theme has been successfully found.',
  })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.themeService.findById(id);
  }

  @Patch(':id/image')
  @ApiOperation({ summary: 'Update theme image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'New theme image',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The theme image has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Theme not found' })
  @UseInterceptors(FileInterceptor('image'))
  async updateImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() image: Express.Multer.File
  ) {
    return this.themeService.updateImage(id, image);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete theme by id (cascade delete files)' })
  @ApiResponse({
    status: 200,
    description:
      'The theme and associated files have been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.themeService.delete(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update theme' })
  @ApiResponse({
    status: 200,
    description: 'The theme has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Theme not found' })
  async updateTheme(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateThemeDto: UpdateThemeDto
  ) {
    return this.themeService.updateTheme(id, updateThemeDto);
  }
}
