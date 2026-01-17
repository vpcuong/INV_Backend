export interface ItemTypeConstructorData {
  id?: number;
  code: string;
  desc?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ItemType {
  private id?: number;
  private code?: string;
  private desc?: string;
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(data: ItemTypeConstructorData) {
    this.id = data.id;
    this.code = data.code;
    this.desc = data.desc;
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  public toPersistence(): any {
    return {
      id: this.id,
      code: this.code,
      desc: this.desc,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPersistence(data: any): ItemType {
    return new ItemType({
      id: data.id,
      code: data.code,
      desc: data.desc,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  public getSearchText(): string {
    return this.code ? `${this.code} - ${this.desc}` : (this.desc ?? '');
  }

  // Business logic methods
  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  public updateDetails(data: Partial<ItemTypeConstructorData>): void {
    if (data.code !== undefined) this.code = data.code;
    if (data.desc !== undefined) this.desc = data.desc;
    this.updatedAt = new Date();
  }

  // Getters
  public getId(): number | undefined {
    return this.id;
  }

  public getCode(): string | undefined {
    return this.code;
  }

  public getDescription(): string | undefined {
    return this.desc;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
