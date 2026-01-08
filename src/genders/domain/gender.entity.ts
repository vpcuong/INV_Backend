export interface GenderConstructorData {
  id?: number;
  code: string;
  desc: string;
  isActive?: boolean;
  sortOrder?: number;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Gender {
  private id?: number;
  private code: string;
  private desc: string;
  private isActive: boolean;
  private sortOrder: number;
  private createdBy: string;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(data: GenderConstructorData) {
    this.id = data.id;
    this.code = data.code;
    this.desc = data.desc;
    this.isActive = data.isActive ?? true;
    this.sortOrder = data.sortOrder ?? 0;
    this.createdBy = data.createdBy ?? '';
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  public toPersistence(): any {
    return {
      id: this.id,
      code: this.code,
      desc: this.desc,
      isActive: this.isActive,
      sortOrder: this.sortOrder,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPersistence(data: any): Gender {
    return new Gender({
      id: data.id,
      code: data.code,
      desc: data.desc,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
      createdBy: data.createdBy ?? '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  public getSearchText(): string {
    return `${this.code} - ${this.desc}`;
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

  public updateDetails(data: Partial<GenderConstructorData>): void {
    if (data.code !== undefined) this.code = data.code;
    if (data.desc !== undefined) this.desc = data.desc;
    if (data.sortOrder !== undefined) this.sortOrder = data.sortOrder;
    this.updatedAt = new Date();
  }

  // Getters
  public getId(): number | undefined {
    return this.id;
  }

  public getCode(): string {
    return this.code;
  }

  public getDesc(): string {
    return this.desc;
  }

  public getisActive(): boolean {
    return this.isActive;
  }

  public getSortOrder(): number {
    return this.sortOrder;
  }

  public getCreatedBy(): string {
    return this.createdBy;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}