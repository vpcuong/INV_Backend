import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IFileStorage, UploadResult } from '../interfaces/file-storage.interface';

@Injectable()
export class LocalStorageProvider implements IFileStorage {
  private readonly uploadPath: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get('UPLOAD_PATH', './uploads');
    this.baseUrl = this.configService.get('BASE_URL', 'http://localhost:3000');
  }

  async uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadResult> {
    try {
      const targetFolder = folder ? path.join(this.uploadPath, folder) : this.uploadPath;

      // Ensure folder exists
      await fs.mkdir(targetFolder, { recursive: true });

      const filename = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(targetFolder, filename);

      // Write file
      await fs.writeFile(filePath, file.buffer);

      const relativePath = folder ? `${folder}/${filename}` : filename;

      return {
        url: this.getFileUrl(relativePath),
        filename: file.originalname,
        path: relativePath,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadFiles(files: Express.Multer.File[], folder?: string): Promise<UploadResult[]> {
    return Promise.all(files.map(file => this.uploadFile(file, folder)));
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadPath, filePath);
      await fs.unlink(fullPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new NotFoundException(`File not found: ${filePath}`);
      }
      throw new InternalServerErrorException(`Failed to delete file: ${error.message}`);
    }
  }

  getFileUrl(filePath: string): string {
    return `${this.baseUrl}/uploads/${filePath}`;
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadPath, filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read file content as Buffer
   */
  async readFile(filePath: string): Promise<Buffer> {
    try {
      const fullPath = path.join(this.uploadPath, filePath);

      // Check if file exists
      const exists = await this.fileExists(filePath);
      if (!exists) {
        throw new NotFoundException(`File not found: ${filePath}`);
      }

      // Read file as Buffer
      const content = await fs.readFile(fullPath);
      return content;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * Read file content as string
   */
  async readFileAsString(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    try {
      const buffer = await this.readFile(filePath);
      return buffer.toString(encoding);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get file info (size, mimetype, extension, filename)
   */
  async getFileInfo(filePath: string): Promise<{
    size: number;
    mimetype: string;
    extension: string;
    filename: string;
  }> {
    try {
      const fullPath = path.join(this.uploadPath, filePath);

      // Check if file exists
      const exists = await this.fileExists(filePath);
      if (!exists) {
        throw new NotFoundException(`File not found: ${filePath}`);
      }

      // Get file stats
      const stats = await fs.stat(fullPath);

      // Get file extension
      const extension = path.extname(filePath);

      // Get filename
      const filename = path.basename(filePath);

      // Determine mimetype based on extension
      const mimetypeMap: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain',
        '.json': 'application/json',
        '.xml': 'application/xml',
      };

      const mimetype = mimetypeMap[extension.toLowerCase()] || 'application/octet-stream';

      return {
        size: stats.size,
        mimetype,
        extension,
        filename,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get file info: ${error.message}`);
    }
  }
}
