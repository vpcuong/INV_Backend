import {
  InvalidItemModelException,
  DuplicateItemModelCodeException,
} from '../exceptions/item-domain.exception';

export enum ItemModelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

export interface ItemModelConstructorData {
  id?: number;
  publicId?: string;
  itemId: number;
  code: string;
  desc?: string | null;
  customerId?: number | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateItemModelData {
  code?: string;
  desc?: string | null;
  customerId?: number | null;
}

/**
 * Item Model Entity
 */
export class ItemModel {
  private id?: number;
  private publicId?: string;
  private itemId: number;
  private code: string;
  private desc?: string | null;
  private customerId?: number | null;
  private status: string;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(data: ItemModelConstructorData) {
    this.validateRequiredFields(data);

    this.id = data.id;
    this.publicId = data.publicId;
    this.itemId = data.itemId;
    this.code = data.code;
    this.desc = data.desc;
    this.customerId = data.customerId;
    this.status = data.status ?? ItemModelStatus.ACTIVE;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  private validateRequiredFields(data: ItemModelConstructorData): void {
    if (!data.code || data.code.trim() === '') {
      throw new InvalidItemModelException('Model code is required');
    }
    if (data.code.length > 20) {
      throw new InvalidItemModelException(
        'Model code must not exceed 20 characters',
      );
    }
    if (!data.itemId) {
      throw new InvalidItemModelException('Item ID is required');
    }
  }

  public activate(): void {
    if (this.status === ItemModelStatus.ACTIVE) {
      return;
    }
    this.status = ItemModelStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  public deactivate(): void {
    if (this.status === ItemModelStatus.INACTIVE) {
      return;
    }
    this.status = ItemModelStatus.INACTIVE;
    this.updatedAt = new Date();
  }

  public draft(): void {
    if (this.status === ItemModelStatus.DRAFT) {
      return;
    }
    this.status = ItemModelStatus.DRAFT;
    this.updatedAt = new Date();
  }

  public update(data: UpdateItemModelData): void {
    if (data.code !== undefined) {
      if (!data.code || data.code.trim() === '') {
        throw new InvalidItemModelException('Model code is required');
      }
      if (data.code.length > 20) {
        throw new InvalidItemModelException(
          'Model code must not exceed 20 characters',
        );
      }
      this.code = data.code;
    }
    if (data.desc !== undefined) {
      this.desc = data.desc;
    }
    if (data.customerId !== undefined) {
      this.customerId = data.customerId;
    }
   
    this.updatedAt = new Date();
  }

  public isActive(): boolean {
    return this.status === ItemModelStatus.ACTIVE;
  }

  //#region  Getters
  public getId(): number | undefined {
    return this.id;
  }

  public getPublicId(): string | undefined {
    return this.publicId;
  }

  public getItemId(): number {
    return this.itemId;
  }

  public getCode(): string {
    return this.code.trim();
  }

  public getDesc(): string | null | undefined {
    return this.desc;
  }

  public getCustomerId(): number | null | undefined {
    return this.customerId;
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

  //#endregion

  public toPersistence(): any {
    return {
      id: this.id,
      publicId: this.publicId,
      itemId: this.itemId,
      code: this.code,
      desc: this.desc,
      customerId: this.customerId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPersistence(data: any): ItemModel {
    return new ItemModel({
      id: data.id,
      publicId: data.publicId,
      itemId: data.itemId,
      code: data.code,
      desc: data.desc,
      customerId: data.customerId,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
