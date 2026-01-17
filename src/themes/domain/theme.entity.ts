import {
  UomRequiredWhenPriceProvidedException,
  InvalidThemeCodeException,
} from './exceptions/theme-domain.exception';

export interface ThemeConstructorData {
  id?: number;
  code: string;
  desc?: string;
  supplierId: number;
  colorCode: string;
  price?: number;
  uom?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  imgUrls?: string;
}

export class Theme {
  constructor(data: ThemeConstructorData) {
    // Business Rule: Validate theme code format
    // this.validateThemeCode(data.code);

    // Business Rule: Nếu có price thì phải có uom
    this.validatePriceAndUom(data.price, data.uom);

    this.id = data.id;
    this.code = data.code;
    this.desc = data.desc ?? '';
    this.supplierId = data.supplierId;
    this.colorCode = data.colorCode;
    this.price = data.price ?? undefined;
    this.uom = data.uom ?? undefined;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
    this.createdBy = data.createdBy ?? '';
    this.imgUrls = data.imgUrls ?? '';
  }

  private id?: number;
  private code: string;
  private desc: string;
  private supplierId: number;
  private colorCode: string;
  private createdAt: Date;
  private updatedAt: Date;
  private createdBy: string;
  private price?: number;
  private uom?: string;
  private imgUrls: string;

  /**
   * Business Rule: Theme code must be alphanumeric and 4-10 characters
   */
  private validateThemeCode(code: string): void {
    const codeRegex = /^[A-Za-z0-9]{4,10}$/;
    if (!codeRegex.test(code)) {
      throw new InvalidThemeCodeException(code);
    }
  }

  /**
   * Business Rule: Nếu có price thì phải có uom
   */
  private validatePriceAndUom(price?: number, uom?: string): void {
    if (price !== undefined && price !== null && (!uom || uom.trim() === '')) {
      throw new UomRequiredWhenPriceProvidedException();
    }
  }

  public toPersistence(): any {
    return {
      id: this.id,
      code: this.code,
      desc: this.desc,
      supplierId: this.supplierId,
      colorCode: this.colorCode,
      price: this.price,
      uom: this.uom,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      imgUrls: this.imgUrls,
    };
  }

  public static fromPersistence(data: any): Theme {
    return new Theme({
      id: data.id,
      code: data.code,
      desc: data.desc,
      supplierId: data.supplierId,
      colorCode: data.colorCode,
      price: data.price,
      uom: data.uom,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      createdBy: data.createdBy,
      imgUrls: data.imgUrls,
    });
  }
}
