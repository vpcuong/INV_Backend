import { ItemCategoryType } from '../enums/item-category-type.enum';

export class ItemCategory {
  private id?: number;
  private code: string;
  private desc?: string | null;
  private isActive: boolean;
  private type?: ItemCategoryType | null;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(data: {
    id?: number;
    code: string;
    desc?: string | null;
    isActive?: boolean;
    type?: ItemCategoryType | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.code = data.code;
    this.desc = data.desc;
    this.isActive = data.isActive ?? true;
    this.type = data.type;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    this.validate();
  }

  /**
   * Business Rule: Validate item category data
   */
  private validate(): void {
    if (!this.code || this.code.trim().length === 0) {
      throw new Error('Item category code is required');
    }
    if (this.code.length > 10) {
      throw new Error('Item category code must not exceed 10 characters');
    }
    if (this.desc && this.desc.length > 200) {
      throw new Error(
        'Item category description must not exceed 200 characters'
      );
    }
  }

  /**
   * Business Rule: Activate item category
   */
  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Business Rule: Deactivate item category
   */
  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Business Rule: Update item category details
   */
  public updateDetails(data: {
    desc?: string | null;
    type?: ItemCategoryType | null;
  }): void {
    if (data.desc !== undefined) {
      if (data.desc && data.desc.length > 200) {
        throw new Error(
          'Item category description must not exceed 200 characters'
        );
      }
      this.desc = data.desc;
    }

    if (data.type !== undefined) {
      this.type = data.type;
    }

    this.updatedAt = new Date();
  }

  // Getters
  public getId(): number | undefined {
    return this.id;
  }

  public getCode(): string {
    return this.code;
  }

  public getDesc(): string | null | undefined {
    return this.desc;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getType(): ItemCategoryType | null | undefined {
    return this.type;
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  /**
   * Convert to persistence model (for Prisma)
   */
  public toPersistence(): any {
    return {
      id: this.id,
      code: this.code,
      desc: this.desc,
      isActive: this.isActive,
      type: this.type,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create domain entity from persistence model
   */
  public static fromPersistence(data: any): ItemCategory {
    return new ItemCategory({
      id: data.id,
      code: data.code,
      desc: data.desc,
      isActive: data.isActive,
      type: data.type,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
