import { Controller, Get, Param, Res, HttpStatus, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { FilesService } from './files.service';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { FileAccessGuard } from './guards/file-access.guard';

@Controller('files')
@ApiTags('files')
//@ApiBearerAuth()
//@UseGuards(JwtAuthGuard, FileAccessGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('*/download')
  @ApiOperation({ summary: 'Download file by path' })
  @ApiParam({ name: 'filePath', description: 'File path (e.g., theme/12345-image.jpg)' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async downloadFile(
    @Param('0') filePath: string,
    @Res() res: Response
  ) {
    // Clean the filePath: remove leading slash and trailing /download
    filePath = filePath.replace(/^\//, '').replace(/\/download$/, '');

    try {
      // Check if file exists
      const exists = await this.filesService.fileExists(filePath);
      if (!exists) {
        throw new NotFoundException(`File not found: ${filePath}`);
      }

      // Get file info
      const fileInfo = await this.filesService.getFileInfo(filePath);

      // Read file content
      const fileBuffer = await this.filesService.readFile(filePath);

      // Set headers
      res.set({
        'Content-Type': fileInfo.mimetype,
        'Content-Disposition': `attachment; filename="${fileInfo.filename}"`,
        'Content-Length': fileInfo.size,
      });

      // Send file
      res.send(fileBuffer);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to download file',
        });
      }
    }
  }

  @Get('*/info')
  @ApiOperation({ summary: 'Get file information' })
  @ApiParam({ name: 'filePath', description: 'File path (e.g., theme/12345-image.jpg)' })
  @ApiResponse({ status: 200, description: 'File info retrieved successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFileInfo(@Param('0') filePath: string) {
    console.log('Raw filePath param:', filePath);

    // Clean the filePath: remove leading slash and trailing /info
    filePath = filePath.replace(/^\//, '').replace(/\/info$/, '');

    const exists = await this.filesService.fileExists(filePath);
    if (!exists) {
      throw new NotFoundException(`File not found: ${filePath}`);
    }

    const fileInfo = await this.filesService.getFileInfo(filePath);
    const fileUrl = this.filesService.getFileUrl(filePath);

    return {
      ...fileInfo,
      path: filePath,
      url: fileUrl,
    };
  }

  @Get('*/content')
  @ApiOperation({ summary: 'Get file content as text (for text files)' })
  @ApiParam({ name: 'filePath', description: 'File path (e.g., theme/document.txt)' })
  @ApiResponse({ status: 200, description: 'File content retrieved successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFileContent(@Param('0') filePath: string) {
    // Clean the filePath: remove leading slash and trailing /content
    filePath = filePath.replace(/^\//, '').replace(/\/content$/, '');

    const exists = await this.filesService.fileExists(filePath);
    if (!exists) {
      throw new NotFoundException(`File not found: ${filePath}`);
    }

    const content = await this.filesService.readFileAsString(filePath);
    const fileInfo = await this.filesService.getFileInfo(filePath);

    return {
      path: filePath,
      filename: fileInfo.filename,
      size: fileInfo.size,
      mimetype: fileInfo.mimetype,
      content,
    };
  }

  @Get('*/view')
  @ApiOperation({ summary: 'View/stream file (for images, PDFs, etc.)' })
  @ApiParam({ name: 'filePath', description: 'File path (e.g., theme/12345-image.jpg)' })
  @ApiResponse({ status: 200, description: 'File streamed successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async viewFile(
    @Param('0') filePath: string,
    @Res() res: Response
  ) {
    // Clean the filePath: remove leading slash and trailing /view
    filePath = filePath.replace(/^\//, '').replace(/\/view$/, '');

    console.log('Cleaned filePath:', filePath);

    try {
      // Check if file exists
      const exists = await this.filesService.fileExists(filePath);
      if (!exists) {
        throw new NotFoundException(`File not found: ${filePath}`);
      }

      // Get file info
      const fileInfo = await this.filesService.getFileInfo(filePath);

      // Read file content
      const fileBuffer = await this.filesService.readFile(filePath);

      // Set headers for inline viewing
      res.set({
        'Content-Type': fileInfo.mimetype,
        'Content-Disposition': `inline; filename="${fileInfo.filename}"`,
        'Content-Length': fileInfo.size,
      });

      // Send file
      res.send(fileBuffer);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to view file',
        });
      }
    }
  }
}
