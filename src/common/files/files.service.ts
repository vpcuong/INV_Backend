import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IFileStorage, UploadResult } from './interfaces/file-storage.interface';
import { IFileRepository } from './domain/file.repository.interface';
import { FileEntity } from './domain/file.entity';
import * as path from 'path';

export interface UploadFileOptions {
  contextType: string;
  contextId: number;
  contextKey?: string;
  category?: string;
  isPrimary?: boolean;
  uploadedBy?: string;
  alt?: string;
  title?: string;
}

@Injectable()
export class FilesService {
  constructor(
    @Inject('IFileStorage') private readonly fileStorage: IFileStorage,
    @Inject('IFileRepository') private readonly fileRepository: IFileRepository
  ) {}

  /**
   * Upload file and save metadata to database
   */
  async uploadFile(
    file: Express.Multer.File,
    options: UploadFileOptions
  ): Promise<FileEntity> {
    // Upload physical file
    const uploadResult = await this.fileStorage.uploadFile(file, options.contextType);

    // Save metadata to database
    const fileEntity = new FileEntity({
      filename: uploadResult.filename,
      storedName: uploadResult.filename,
      path: uploadResult.path,
      url: uploadResult.url,
      size: uploadResult.size,
      mimetype: uploadResult.mimetype,
      extension: path.extname(uploadResult.filename),
      contextType: options.contextType,
      contextId: options.contextId,
      contextKey: options.contextKey,
      category: options.category,
      isPrimary: options.isPrimary,
      uploadedBy: options.uploadedBy,
      alt: options.alt,
      title: options.title,
    });

    return this.fileRepository.save(fileEntity);
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    options: UploadFileOptions
  ): Promise<FileEntity[]> {
    return Promise.all(files.map(file => this.uploadFile(file, options)));
  }

  /**
   * Delete file (soft delete in DB and remove physical file)
   */
  async deleteFile(id: number): Promise<void> {
    const file = await this.fileRepository.findById(id);
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    // Soft delete in database
    await this.fileRepository.softDelete(id);

    // Delete physical file
    await this.fileStorage.deleteFile(file.getPath());
  }

  /**
   * Get files by context
   */
  async getFilesByContext(
    contextType: string,
    contextId: number,
    contextKey?: string
  ): Promise<FileEntity[]> {
    return this.fileRepository.findByContext(contextType, contextId, contextKey);
  }

  /**
   * Get primary file for a context
   */
  async getPrimaryFile(contextType: string, contextId: number): Promise<FileEntity | null> {
    return this.fileRepository.findPrimaryFile(contextType, contextId);
  }

  /**
   * Set file as primary
   */
  async setPrimaryFile(id: number, contextType: string, contextId: number): Promise<void> {
    return this.fileRepository.setPrimaryFile(id, contextType, contextId);
  }

  /**
   * Delete all files for a context
   */
  async deleteFilesByContext(contextType: string, contextId: number): Promise<void> {
    const files = await this.fileRepository.findByContext(contextType, contextId);

    // Delete physical files
    await Promise.all(files.map(file => this.fileStorage.deleteFile(file.getPath())));

    // Soft delete in database
    await this.fileRepository.deleteByContext(contextType, contextId);
  }

  /**
   * Cleanup orphaned files
   */
  async cleanupOrphanedFiles(): Promise<number> {
    const orphanedFiles = await this.fileRepository.findOrphanedFiles();

    // Delete physical files
    await Promise.all(
      orphanedFiles.map(file => this.fileStorage.deleteFile(file.getPath()))
    );

    // Hard delete from database
    await Promise.all(
      orphanedFiles.map(file => this.fileRepository.hardDelete(file.getId()!))
    );

    return orphanedFiles.length;
  }

  getFileUrl(filePath: string): string {
    return this.fileStorage.getFileUrl(filePath);
  }

  async fileExists(filePath: string): Promise<boolean> {
    return this.fileStorage.fileExists(filePath);
  }

  /**
   * Read file content as Buffer
   */
  async readFile(filePath: string): Promise<Buffer> {
    return this.fileStorage.readFile(filePath);
  }

  /**
   * Read file content as string
   */
  async readFileAsString(filePath: string, encoding?: BufferEncoding): Promise<string> {
    return this.fileStorage.readFileAsString(filePath, encoding);
  }

  /**
   * Get file information (size, mimetype, etc.)
   */
  async getFileInfo(filePath: string): Promise<{
    size: number;
    mimetype: string;
    extension: string;
    filename: string;
  }> {
    return this.fileStorage.getFileInfo(filePath);
  }

  /**
   * Get file by path (from database)
   */
  async getFileByPath(filePath: string): Promise<FileEntity | null> {
    return this.fileRepository.findByPath(filePath);
  }
}
