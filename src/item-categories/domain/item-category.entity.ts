import { InvalidItemCategoryFlagsException } from './exceptions/item-category-domain.exception';

export class ItemCategory {
  private id?: number;
  private code: string;
  private desc?: string | null;
  private isActive: boolean;
  private isOutsourced: boolean;
  private isFinishedGood: boolean;
  private isFabric: boolean;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(data: {
    id?: number;
    code: string;
    desc?: string | null;
    isActive?: boolean;
    isOutsourced?: boolean;
    isFinishedGood?: boolean;
    isFabric?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.code = data.code;
    this.desc = data.desc;
    this.isActive = data.isActive ?? true;
    this.isOutsourced = data.isOutsourced ?? false;
    this.isFinishedGood = data.isFinishedGood ?? false;
    this.isFabric = data.isFabric ?? false;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    this.validate();
    this.validateFlags();
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
      throw new Error('Item category description must not exceed 200 characters');
    }
  }

  /**
   * Business Rule: Validate mutually exclusive flags
   */
  private validateFlags(): void {
    const flagsCount = [this.isOutsourced, this.isFinishedGood, this.isFabric].filter(
      (flag) => flag === true,
    ).length;

    if (flagsCount > 1) {
      throw new InvalidItemCategoryFlagsException();
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
    isOutsourced?: boolean;
    isFinishedGood?: boolean;
    isFabric?: boolean;
  }): void {
    if (data.desc !== undefined) {
      if (data.desc && data.desc.length > 200) {
        throw new Error('Item category description must not exceed 200 characters');
      }
      this.desc = data.desc;
    }

    if (data.isOutsourced !== undefined) {
      this.isOutsourced = data.isOutsourced;
    }

    if (data.isFinishedGood !== undefined) {
      this.isFinishedGood = data.isFinishedGood;
    }

    if (data.isFabric !== undefined) {
      this.isFabric = data.isFabric;
    }

    this.validateFlags();
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

  public getIsOutsourced(): boolean {
    return this.isOutsourced;
  }

  public getIsFinishedGood(): boolean {
    return this.isFinishedGood;
  }

  public getIsFabric(): boolean {
    return this.isFabric;
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
      isOutsourced: this.isOutsourced,
      isFinishedGood: this.isFinishedGood,
      isFabric: this.isFabric,
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
      isOutsourced: data.isOutsourced,
      isFinishedGood: data.isFinishedGood,
      isFabric: data.isFabric,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
