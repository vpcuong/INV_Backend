import { FileEntity } from './file.entity';

export interface FileFilter {
  contextType?: string;
  contextId?: number;
  contextKey?: string;
  category?: string;
  isPrimary?: boolean;
  includeDeleted?: boolean;
}

export interface IFileRepository {
  /**
   * Save file metadata to database
   */
  save(file: FileEntity): Promise<FileEntity>;

  /**
   * Find file by ID
   */
  findById(id: number): Promise<FileEntity | null>;

  /**
   * Find files by context (e.g., all files for a theme)
   */
  findByContext(contextType: string, contextId: number, contextKey?: string): Promise<FileEntity[]>;

  /**
   * Find file by path
   */
  findByPath(path: string): Promise<FileEntity | null>;

  /**
   * Find primary file for a context
   */
  findPrimaryFile(contextType: string, contextId: number): Promise<FileEntity | null>;

  /**
   * Find files with filters
   */
  findMany(filter: FileFilter): Promise<FileEntity[]>;

  /**
   * Update file metadata
   */
  update(id: number, data: Partial<FileEntity>): Promise<FileEntity>;

  /**
   * Soft delete file
   */
  softDelete(id: number): Promise<void>;

  /**
   * Hard delete file (permanent)
   */
  hardDelete(id: number): Promise<void>;

  /**
   * Delete all files for a context
   */
  deleteByContext(contextType: string, contextId: number): Promise<void>;

  /**
   * Set primary file (unset others)
   */
  setPrimaryFile(id: number, contextType: string, contextId: number): Promise<void>;

  /**
   * Reorder files
   */
  reorderFiles(fileIds: number[]): Promise<void>;

  /**
   * Find orphaned files (files without valid context)
   */
  findOrphanedFiles(): Promise<FileEntity[]>;
}
