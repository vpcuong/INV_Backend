import { DomainException } from '../../../common/exception-filters/domain-exception.filter';

export class WarehouseDomainException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'WarehouseDomainException';
  }
}

export class InvalidWarehouseException extends WarehouseDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidWarehouseException';
  }
}

export class WarehouseNotFoundException extends WarehouseDomainException {
  constructor(identifier: string) {
    super(`Warehouse not found: ${identifier}`);
    this.name = 'WarehouseNotFoundException';
  }
}

export class DuplicateWarehouseCodeException extends WarehouseDomainException {
  constructor(code: string) {
    super(`Warehouse code already exists: ${code}`);
    this.name = 'DuplicateWarehouseCodeException';
  }
}

export class InsufficientInventoryException extends WarehouseDomainException {
  constructor(
    warehouseId: number,
    itemSkuId: number,
    requested: number,
    available: number,
  ) {
    super(
      `Insufficient inventory in warehouse ${warehouseId} for SKU ${itemSkuId}: requested ${requested}, available ${available}`,
    );
    this.name = 'InsufficientInventoryException';
  }
}

export class InvalidQuantityException extends WarehouseDomainException {
  constructor(field: string, value: number) {
    super(`${field} cannot be negative: ${value}`);
    this.name = 'InvalidQuantityException';
  }
}
