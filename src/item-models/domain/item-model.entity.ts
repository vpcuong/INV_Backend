import { ItemModelStatus } from './item-model-status.enum';
import {
  InvalidItemModelException,
  InvalidItemModelStatusException,
} from './exceptions/item-model-domain.exception';

export interface ItemModelConstructorData {
  id?: number;
  itemId: number;
  code: string;
  desc?: string | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ItemModel {
  private id?: number;
  private itemId: number;
  private code: string;
  private desc?: string | null;
  private status: string;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(data: ItemModelConstructorData) {
    this.validateRequiredFields(data);

    this.id = data.id;
    this.itemId = data.itemId;
    this.code = data.code;
    this.desc = data.desc;
    this.status = data.status ?? ItemModelStatus.ACTIVE;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Business rule: Validate required fields
   */
  private validateRequiredFields(data: ItemModelConstructorData): void {
    if (!data.code || data.code.trim() === '') {
      throw new InvalidItemModelException('Model code is required');
    }
    if (data.code.length > 10) {
      throw new InvalidItemModelException('Model code must not exceed 10 characters');
    }
    if (!data.itemId) {
      throw new InvalidItemModelException('Item ID is required');
    }
  }

  /**
   * Business rule: Activate model
   */
  public activate(): void {
    if (this.status === ItemModelStatus.ACTIVE) {
      return; // Already active
    }
    this.status = ItemModelStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Business rule: Deactivate model
   */
  public deactivate(): void {
    if (this.status === ItemModelStatus.INACTIVE) {
      return; // Already inactive
    }
    this.status = ItemModelStatus.INACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Business rule: Mark model as draft
   */
  public draft(): void {
    if (this.status === ItemModelStatus.DRAFT) {
      return; // Already draft
    }
    this.status = ItemModelStatus.DRAFT;
    this.updatedAt = new Date();
  }

  /**
   * Update model details
   */
  public updateDetails(desc?: string | null): void {
    if (desc !== undefined) {
      this.desc = desc;
    }
    this.updatedAt = new Date();
  }

  /**
   * Check if model is active
   */
  public isActive(): boolean {
    return this.status === ItemModelStatus.ACTIVE;
  }

  // Getters
  public getId(): number | undefined {
    return this.id;
  }
  public getItemId(): number {
    return this.itemId;
  }
  public getCode(): string {
    return this.code;
  }
  public getDesc(): string | null | undefined {
    return this.desc;
  }
  public getStatus(): string {
    return this.status;
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
      itemId: this.itemId,
      code: this.code,
      desc: this.desc,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create domain entity from persistence model
   */
  public static fromPersistence(data: any): ItemModel {
    return new ItemModel({
      id: data.id,
      itemId: data.itemId,
      code: data.code,
      desc: data.desc,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
