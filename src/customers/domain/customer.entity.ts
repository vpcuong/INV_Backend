import { CustomerStatus } from '../enums/customer-status.enum';
import { InvalidCustomerStatusException } from './exceptions/customer-domain.exception';

export class Customer {
  private id?: number;
  private customerCode: string;
  private customerName: string;
  private phone?: string | null;
  private email?: string | null;
  private taxCode?: string | null;
  private country?: string | null;
  private status: CustomerStatus;
  private note?: string | null;
  private isActive: boolean;
  private createdBy?: string | null;
  private sortOrder: number;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(data: {
    id?: number;
    customerCode: string;
    customerName: string;
    phone?: string | null;
    email?: string | null;
    taxCode?: string | null;
    country?: string | null;
    status?: CustomerStatus;
    note?: string | null;
    isActive?: boolean;
    createdBy?: string | null;
    sortOrder?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.customerCode = data.customerCode;
    this.customerName = data.customerName;
    this.phone = data.phone;
    this.email = data.email;
    this.taxCode = data.taxCode;
    this.country = data.country;
    this.status = data.status ?? CustomerStatus.ACTIVE;
    this.note = data.note;
    this.isActive = data.isActive ?? true;
    this.createdBy = data.createdBy;
    this.sortOrder = data.sortOrder ?? 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    this.validate();
  }

  /**
   * Business Rule: Validate customer data
   */
  private validate(): void {
    if (!this.customerCode || this.customerCode.trim().length === 0) {
      throw new Error('Customer code is required');
    }
    if (!this.customerName || this.customerName.trim().length === 0) {
      throw new Error('Customer name is required');
    }
    if (this.customerCode.length > 50) {
      throw new Error('Customer code must not exceed 50 characters');
    }
    if (this.customerName.length > 200) {
      throw new Error('Customer name must not exceed 200 characters');
    }
  }

  /**
   * Business Rule: Activate customer
   */
  public activate(): void {
    if (this.status === CustomerStatus.BLACKLIST) {
      throw new InvalidCustomerStatusException(
        this.status,
        CustomerStatus.ACTIVE,
      );
    }
    this.isActive = true;
    this.status = CustomerStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Business Rule: Deactivate customer
   */
  public deactivate(): void {
    if (this.status === CustomerStatus.BLACKLIST) {
      throw new InvalidCustomerStatusException(
        this.status,
        CustomerStatus.INACTIVE,
      );
    }
    this.isActive = false;
    this.status = CustomerStatus.INACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Business Rule: Blacklist customer
   */
  public blacklist(): void {
    this.isActive = false;
    this.status = CustomerStatus.BLACKLIST;
    this.updatedAt = new Date();
  }

  /**
   * Business Rule: Update customer details
   */
  public updateDetails(data: {
    customerName?: string;
    phone?: string | null;
    email?: string | null;
    taxCode?: string | null;
    country?: string | null;
    note?: string | null;
    sortOrder?: number;
  }): void {
    if (data.customerName !== undefined) {
      if (!data.customerName || data.customerName.trim().length === 0) {
        throw new Error('Customer name cannot be empty');
      }
      if (data.customerName.length > 200) {
        throw new Error('Customer name must not exceed 200 characters');
      }
      this.customerName = data.customerName;
    }

    if (data.phone !== undefined) this.phone = data.phone;
    if (data.email !== undefined) this.email = data.email;
    if (data.taxCode !== undefined) this.taxCode = data.taxCode;
    if (data.country !== undefined) this.country = data.country;
    if (data.note !== undefined) this.note = data.note;
    if (data.sortOrder !== undefined) this.sortOrder = data.sortOrder;

    this.updatedAt = new Date();
  }

  // Getters
  public getId(): number | undefined {
    return this.id;
  }

  public getCustomerCode(): string {
    return this.customerCode;
  }

  public getCustomerName(): string {
    return this.customerName;
  }

  public getPhone(): string | null | undefined {
    return this.phone;
  }

  public getEmail(): string | null | undefined {
    return this.email;
  }

  public getTaxCode(): string | null | undefined {
    return this.taxCode;
  }

  public getCountry(): string | null | undefined {
    return this.country;
  }

  public getStatus(): CustomerStatus {
    return this.status;
  }

  public getNote(): string | null | undefined {
    return this.note;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getCreatedBy(): string | null | undefined {
    return this.createdBy;
  }

  public getSortOrder(): number {
    return this.sortOrder;
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
      customerCode: this.customerCode,
      customerName: this.customerName,
      phone: this.phone,
      email: this.email,
      taxCode: this.taxCode,
      country: this.country,
      status: this.status,
      note: this.note,
      isActive: this.isActive,
      createdBy: this.createdBy,
      sortOrder: this.sortOrder,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create domain entity from persistence model
   */
  public static fromPersistence(data: any): Customer {
    return new Customer({
      id: data.id,
      customerCode: data.customerCode,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email,
      taxCode: data.taxCode,
      country: data.country,
      status: data.status,
      note: data.note,
      isActive: data.isActive,
      createdBy: data.createdBy,
      sortOrder: data.sortOrder,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}