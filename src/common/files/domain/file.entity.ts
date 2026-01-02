export interface FileConstructorData {
  id?: number;
  filename: string;
  storedName: string;
  path: string;
  url: string;
  size: number;
  mimetype: string;
  extension: string;
  contextType: string;
  contextId: number;
  contextKey?: string;
  category?: string;
  displayOrder?: number;
  isPrimary?: boolean;
  alt?: string;
  title?: string;
  description?: string;
  storageType?: string;
  bucket?: string;
  uploadedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class FileEntity {
  constructor(data: FileConstructorData) {
    this.id = data.id;
    this.filename = data.filename;
    this.storedName = data.storedName;
    this.path = data.path;
    this.url = data.url;
    this.size = data.size;
    this.mimetype = data.mimetype;
    this.extension = data.extension;
    this.contextType = data.contextType;
    this.contextId = data.contextId;
    this.contextKey = data.contextKey;
    this.category = data.category;
    this.displayOrder = data.displayOrder ?? 0;
    this.isPrimary = data.isPrimary ?? false;
    this.alt = data.alt;
    this.title = data.title;
    this.description = data.description;
    this.storageType = data.storageType ?? 'local';
    this.bucket = data.bucket;
    this.uploadedBy = data.uploadedBy;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
    this.deletedAt = data.deletedAt;
  }

  private id?: number;
  private filename: string;
  private storedName: string;
  private path: string;
  private url: string;
  private size: number;
  private mimetype: string;
  private extension: string;
  private contextType: string;
  private contextId: number;
  private contextKey?: string;
  private category?: string;
  private displayOrder: number;
  private isPrimary: boolean;
  private alt?: string;
  private title?: string;
  private description?: string;
  private storageType: string;
  private bucket?: string;
  private uploadedBy?: string;
  private createdAt: Date;
  private updatedAt: Date;
  private deletedAt?: Date;

  // Getters
  public getId(): number | undefined {
    return this.id;
  }

  public getUrl(): string {
    return this.url;
  }

  public getPath(): string {
    return this.path;
  }

  public isDeleted(): boolean {
    return !!this.deletedAt;
  }

  // Business methods
  public markAsPrimary(): void {
    this.isPrimary = true;
  }

  public softDelete(): void {
    this.deletedAt = new Date();
  }

  public restore(): void {
    this.deletedAt = undefined;
  }

  public toPersistence(): any {
    return {
      id: this.id,
      filename: this.filename,
      storedName: this.storedName,
      path: this.path,
      url: this.url,
      size: this.size,
      mimetype: this.mimetype,
      extension: this.extension,
      contextType: this.contextType,
      contextId: this.contextId,
      contextKey: this.contextKey,
      category: this.category,
      displayOrder: this.displayOrder,
      isPrimary: this.isPrimary,
      alt: this.alt,
      title: this.title,
      description: this.description,
      storageType: this.storageType,
      bucket: this.bucket,
      uploadedBy: this.uploadedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  public static fromPersistence(data: any): FileEntity {
    return new FileEntity(data);
  }
}
