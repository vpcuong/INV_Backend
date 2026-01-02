export interface SupplierConstructorData {
  id?: number;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
  contactPerson?: string;
  paymentTerms?: string;
  status?: string;
  category?: string;
  rating?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  sortOrder?: number;
}

export class Supplier {
  private id?: number;
  private code: string;
  private name: string;
  private phone: string;
  private email: string;
  private website: string;
  private address: string;
  private city: string;
  private province: string;
  private country: string;
  private postalCode: string;
  private taxId: string;
  private contactPerson: string;
  private paymentTerms: string;
  private status: string;
  private category: string;
  private rating?: number;
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;
  private createdBy: string;
  private sortOrder: number;

  constructor(data: SupplierConstructorData) {
    this.id = data.id;
    this.code = data.code;
    this.name = data.name;
    this.phone = data.phone ?? '';
    this.email = data.email ?? '';
    this.website = data.website ?? '';
    this.address = data.address ?? '';
    this.city = data.city ?? '';
    this.province = data.province ?? '';
    this.country = data.country ?? '';
    this.postalCode = data.postalCode ?? '';
    this.taxId = data.taxId ?? '';
    this.contactPerson = data.contactPerson ?? '';
    this.paymentTerms = data.paymentTerms ?? '';
    this.status = data.status ?? '';
    this.category = data.category ?? '';
    this.rating = data.rating ?? 0;
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
    this.createdBy = data.createdBy ?? '';
    this.sortOrder = data.sortOrder ?? 0;
  }

  public toPersistence(): any {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      phone: this.phone,
      email: this.email,
      website: this.website,
      address: this.address,
      city: this.city,
      province: this.province,
      country: this.country,
      postalCode: this.postalCode,
      taxId: this.taxId,
      contactPerson: this.contactPerson,
      paymentTerms: this.paymentTerms,
      status: this.status,
      category: this.category,
      rating: this.rating,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      sortOrder: this.sortOrder,
    };
  }

  public static fromPersistence(data: any): Supplier {
    return new Supplier({
      id: data.id,
      code: data.code,
      name: data.name,
      phone: data.phone ?? '',
      email: data.email ?? '',
      website: data.website ?? '',
      address: data.address ?? '',
      city: data.city ?? '',
      province: data.province ?? '',
      country: data.country ?? '',
      postalCode: data.postalCode ?? '',
      taxId: data.taxId ?? '',
      contactPerson: data.contactPerson ?? '',
      paymentTerms: data.paymentTerms ?? '',
      status: data.status ?? '',
      category: data.category ?? '',
      rating: data.rating ?? 0,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      createdBy: data.createdBy ?? '',
      sortOrder: data.sortOrder ?? 0,
    });
  }

  public getSearchText(): string {
    return `${this.code} - ${this.name}`;
  }

  // Getters
  public getId(): number | undefined {
    return this.id;
  }

  public getCode(): string {
    return this.code;
  }

  public getName(): string {
    return this.name;
  }

  public getPhone(): string {
    return this.phone;
  }

  public getEmail(): string {
    return this.email;
  }

  public getWebsite(): string {
    return this.website;
  }

  public getAddress(): string {
    return this.address;
  }

  public getCity(): string {
    return this.city;
  }

  public getProvince(): string {
    return this.province;
  }

  public getCountry(): string {
    return this.country;
  }

  public getPostalCode(): string {
    return this.postalCode;
  }

  public getTaxId(): string {
    return this.taxId;
  }

  public getContactPerson(): string {
    return this.contactPerson;
  }

  public getPaymentTerms(): string {
    return this.paymentTerms;
  }

  public getStatus(): string {
    return this.status;
  }

  public getCategory(): string {
    return this.category;
  }

  public getRating(): number | undefined {
    return this.rating;
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

  public getCreatedBy(): string {
    return this.createdBy;
  }

  public getSortOrder(): number {
    return this.sortOrder;
  }
}
