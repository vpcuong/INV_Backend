import { RowMode } from '../../common/enums/row-mode.enum';
import { WarehouseStatus } from './enums/warehouse-status.enum';
import { InvalidWarehouseException } from './exceptions/warehouse-domain.exception';

export interface WarehouseConstructorData {
  id?: number;
  publicId?: string;
  code: string;
  name: string;
  address?: string | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateWarehouseData {
  name?: string;
  address?: string | null;
  status?: string;
}

export class Warehouse {
  private id?: number;
  private publicId?: string;
  private code: string;
  private name: string;
  private address: string | null;
  private status: string;
  private createdAt: Date;
  private updatedAt: Date;
  private rowMode: RowMode | null = null;

  constructor(data: WarehouseConstructorData) {
    this.validate(data);

    this.id = data.id;
    this.publicId = data.publicId;
    this.code = data.code;
    this.name = data.name;
    this.address = data.address ?? null;
    this.status = data.status ?? WarehouseStatus.ACTIVE;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  private validate(data: WarehouseConstructorData): void {
    if (!data.code || data.code.trim() === '') {
      throw new InvalidWarehouseException('Warehouse code is required');
    }
    if (!data.name || data.name.trim() === '') {
      throw new InvalidWarehouseException('Warehouse name is required');
    }
  }

  // Domain methods
  public update(data: UpdateWarehouseData): void {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim() === '') {
        throw new InvalidWarehouseException('Warehouse name is required');
      }
      this.name = data.name;
    }
    if (data.address !== undefined) {
      this.address = data.address;
    }
    if (data.status !== undefined) {
      this.status = data.status;
    }
    this.updatedAt = new Date();
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
  }

  public activate(): void {
    if (this.status === WarehouseStatus.ACTIVE) {
      throw new InvalidWarehouseException('Warehouse is already active');
    }
    this.status = WarehouseStatus.ACTIVE;
    this.updatedAt = new Date();
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
  }

  public deactivate(): void {
    if (this.status === WarehouseStatus.INACTIVE) {
      throw new InvalidWarehouseException('Warehouse is already inactive');
    }
    this.status = WarehouseStatus.INACTIVE;
    this.updatedAt = new Date();
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
  }

  public isActive(): boolean {
    return this.status === WarehouseStatus.ACTIVE;
  }

  // Getters
  public getId(): number | undefined {
    return this.id;
  }

  public getPublicId(): string | undefined {
    return this.publicId;
  }

  public getCode(): string {
    return this.code;
  }

  public getName(): string {
    return this.name;
  }

  public getAddress(): string | null {
    return this.address;
  }

  public getStatus(): string {
    return this.status;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public getRowMode(): RowMode | null {
    return this.rowMode;
  }

  public markAsNew(): void {
    this.rowMode = RowMode.NEW;
  }

  public markUpdated(): void {
    this.rowMode = this.rowMode ?? RowMode.UPDATED;
  }

  public markDeleted(): void {
    this.rowMode = RowMode.DELETED;
  }

  // Persistence methods
  public toPersistence(): any {
    return {
      id: this.id,
      publicId: this.publicId,
      code: this.code,
      name: this.name,
      address: this.address,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPersistence(data: any): Warehouse {
    return new Warehouse({
      id: data.id,
      publicId: data.publicId,
      code: data.code,
      name: data.name,
      address: data.address,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
