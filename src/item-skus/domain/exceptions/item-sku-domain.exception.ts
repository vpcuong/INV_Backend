import { DomainException } from '@/common/exception-filters/domain-exception.filter';

export class ItemSkuDomainException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'ItemSkuDomainException';
  }
}

export class InvalidItemSkuException extends ItemSkuDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidItemSkuException';
  }
}

export class InvalidPriceException extends ItemSkuDomainException {
  constructor(field: string, value: number) {
    super(`${field} cannot be negative: ${value}`);
    this.name = 'InvalidPriceException';
  }
}

export class InvalidDimensionException extends ItemSkuDomainException {
  constructor(field: string, value: number) {
    super(`${field} cannot be negative: ${value}`);
    this.name = 'InvalidDimensionException';
  }
}
