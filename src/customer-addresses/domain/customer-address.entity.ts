import { AddressType } from '../enums/address-type.enum';
import { InvalidAddressException } from './exceptions/customer-address-domain.exception';

export class CustomerAddress {
  private id?: number;
  private customerId: number;
  private addressType: AddressType;
  private addressLine: string;
  private ward?: string | null;
  private district?: string | null;
  private city: string;
  private province?: string | null;
  private country: string;
  private postalCode?: string | null;
  private isDefault: boolean;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(data: {
    id?: number;
    customerId: number;
    addressType: AddressType;
    addressLine: string;
    ward?: string | null;
    district?: string | null;
    city: string;
    province?: string | null;
    country: string;
    postalCode?: string | null;
    isDefault?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.customerId = data.customerId;
    this.addressType = data.addressType;
    this.addressLine = data.addressLine;
    this.ward = data.ward;
    this.district = data.district;
    this.city = data.city;
    this.province = data.province;
    this.country = data.country;
    this.postalCode = data.postalCode;
    this.isDefault = data.isDefault ?? false;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    this.validate();
  }

  /**
   * Business Rule: Validate address data
   */
  private validate(): void {
    if (!this.addressLine || this.addressLine.trim().length === 0) {
      throw new InvalidAddressException('Address line is required');
    }
    if (this.addressLine.length > 500) {
      throw new InvalidAddressException(
        'Address line must not exceed 500 characters',
      );
    }
    if (!this.city || this.city.trim().length === 0) {
      throw new InvalidAddressException('City is required');
    }
    if (this.city.length > 100) {
      throw new InvalidAddressException('City must not exceed 100 characters');
    }
    if (!this.country || this.country.trim().length === 0) {
      throw new InvalidAddressException('Country is required');
    }
    if (this.country.length > 100) {
      throw new InvalidAddressException(
        'Country must not exceed 100 characters',
      );
    }
  }

  /**
   * Business Rule: Set as default address
   */
  public setAsDefault(): void {
    this.isDefault = true;
    this.updatedAt = new Date();
  }

  /**
   * Business Rule: Unset as default address
   */
  public unsetAsDefault(): void {
    this.isDefault = false;
    this.updatedAt = new Date();
  }

  /**
   * Business Rule: Update address details
   */
  public updateDetails(data: {
    addressLine?: string;
    ward?: string | null;
    district?: string | null;
    city?: string;
    province?: string | null;
    country?: string;
    postalCode?: string | null;
    addressType?: AddressType;
  }): void {
    if (data.addressLine !== undefined) {
      if (!data.addressLine || data.addressLine.trim().length === 0) {
        throw new InvalidAddressException('Address line cannot be empty');
      }
      if (data.addressLine.length > 500) {
        throw new InvalidAddressException(
          'Address line must not exceed 500 characters',
        );
      }
      this.addressLine = data.addressLine;
    }

    if (data.city !== undefined) {
      if (!data.city || data.city.trim().length === 0) {
        throw new InvalidAddressException('City cannot be empty');
      }
      if (data.city.length > 100) {
        throw new InvalidAddressException(
          'City must not exceed 100 characters',
        );
      }
      this.city = data.city;
    }

    if (data.country !== undefined) {
      if (!data.country || data.country.trim().length === 0) {
        throw new InvalidAddressException('Country cannot be empty');
      }
      if (data.country.length > 100) {
        throw new InvalidAddressException(
          'Country must not exceed 100 characters',
        );
      }
      this.country = data.country;
    }

    if (data.ward !== undefined) this.ward = data.ward;
    if (data.district !== undefined) this.district = data.district;
    if (data.province !== undefined) this.province = data.province;
    if (data.postalCode !== undefined) this.postalCode = data.postalCode;
    if (data.addressType !== undefined) this.addressType = data.addressType;

    this.updatedAt = new Date();
  }

  /**
   * Business Rule: Get full address as string
   */
  public getFullAddress(): string {
    const parts: string[] = [this.addressLine];

    if (this.ward) parts.push(this.ward);
    if (this.district) parts.push(this.district);
    if (this.city) parts.push(this.city);
    if (this.province) parts.push(this.province);
    if (this.country) parts.push(this.country);
    if (this.postalCode) parts.push(this.postalCode);

    return parts.join(', ');
  }

  // Getters
  public getId(): number | undefined {
    return this.id;
  }

  public getCustomerId(): number {
    return this.customerId;
  }

  public getAddressType(): AddressType {
    return this.addressType;
  }

  public getAddressLine(): string {
    return this.addressLine;
  }

  public getWard(): string | null | undefined {
    return this.ward;
  }

  public getDistrict(): string | null | undefined {
    return this.district;
  }

  public getCity(): string {
    return this.city;
  }

  public getProvince(): string | null | undefined {
    return this.province;
  }

  public getCountry(): string {
    return this.country;
  }

  public getPostalCode(): string | null | undefined {
    return this.postalCode;
  }

  public getIsDefault(): boolean {
    return this.isDefault;
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
      customerId: this.customerId,
      addressType: this.addressType,
      addressLine: this.addressLine,
      ward: this.ward,
      district: this.district,
      city: this.city,
      province: this.province,
      country: this.country,
      postalCode: this.postalCode,
      isDefault: this.isDefault,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create domain entity from persistence model
   */
  public static fromPersistence(data: any): CustomerAddress {
    return new CustomerAddress({
      id: data.id,
      customerId: data.customerId,
      addressType: data.addressType,
      addressLine: data.addressLine,
      ward: data.ward,
      district: data.district,
      city: data.city,
      province: data.province,
      country: data.country,
      postalCode: data.postalCode,
      isDefault: data.isDefault,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}