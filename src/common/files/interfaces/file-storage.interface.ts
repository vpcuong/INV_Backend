export interface UploadResult {
  url: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
}

export interface IFileStorage {
  /**
   * Upload a single file
   */
  uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadResult>;

  /**
   * Upload multiple files
   */
  uploadFiles(files: Express.Multer.File[], folder?: string): Promise<UploadResult[]>;

  /**
   * Delete a file
   */
  deleteFile(filePath: string): Promise<void>;

  /**
   * Get file URL
   */
  getFileUrl(filePath: string): string;

  /**
   * Check if file exists
   */
  fileExists(filePath: string): Promise<boolean>;

  /**
   * Read file content as Buffer
   */
  readFile(filePath: string): Promise<Buffer>;

  /**
   * Read file content as string
   */
  readFileAsString(filePath: string, encoding?: BufferEncoding): Promise<string>;

  /**
   * Get file info (size, mimetype, etc.)
   */
  getFileInfo(filePath: string): Promise<{
    size: number;
    mimetype: string;
    extension: string;
    filename: string;
  }>;
}
