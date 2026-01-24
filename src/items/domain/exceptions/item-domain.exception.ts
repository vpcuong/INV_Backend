import { DomainException } from '../../../common/exception-filters/domain-exception.filter';

// Base exception for Item Aggregate
export class ItemDomainException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'ItemDomainException';
  }
}

// Item exceptions
export class InvalidItemException extends ItemDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidItemException';
  }
}

export class ItemNotFoundException extends ItemDomainException {
  constructor(id: number) {
    super(`Item with ID ${id} not found`);
    this.name = 'ItemNotFoundException';
  }
}

// ItemModel exceptions
export class InvalidItemModelException extends ItemDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidItemModelException';
  }
}

export class DuplicateItemModelCodeException extends ItemDomainException {
  constructor(code: string) {
    super(`Item model with code ${code} already exists`);
    this.name = 'DuplicateItemModelCodeException';
  }
}

export class ItemModelNotFoundException extends ItemDomainException {
  constructor(id: number) {
    super(`Item model with ID ${id} not found`);
    this.name = 'ItemModelNotFoundException';
  }
}

// ItemSku exceptions
export class InvalidItemSkuException extends ItemDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidItemSkuException';
  }
}

export class InvalidPriceException extends ItemDomainException {
  constructor(field: string, value: number) {
    super(`${field} cannot be negative: ${value}`);
    this.name = 'InvalidPriceException';
  }
}

export class InvalidDimensionException extends ItemDomainException {
  constructor(field: string, value: number) {
    super(`${field} cannot be negative: ${value}`);
    this.name = 'InvalidDimensionException';
  }
}

export class DuplicateSkuCodeException extends ItemDomainException {
  constructor(code: string) {
    super(`SKU with code ${code} already exists`);
    this.name = 'DuplicateSkuCodeException';
  }
}

export class ItemSkuNotFoundException extends ItemDomainException {
  constructor(id: number) {
    super(`Item SKU with ID ${id} not found`);
    this.name = 'ItemSkuNotFoundException';
  }
}

// ItemUOM exceptions
export class InvalidItemUOMException extends ItemDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidItemUOMException';
  }
}

export class DuplicateItemUOMException extends ItemDomainException {
  constructor(uomCode: string) {
    super(`UOM ${uomCode} already exists for this item`);
    this.name = 'DuplicateItemUOMException';
  }
}

export class ItemUOMNotFoundException extends ItemDomainException {
  constructor(uomCode: string) {
    super(`UOM ${uomCode} not found for this item`);
    this.name = 'ItemUOMNotFoundException';
  }
}
