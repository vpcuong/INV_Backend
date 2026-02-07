export class InventoryDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InventoryDomainException';
  }
}

export class InvalidInventoryTransactionException extends InventoryDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInventoryTransactionException';
  }
}

export class InvalidInventoryLineException extends InventoryDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInventoryLineException';
  }
}

export class InvalidQuantityException extends InventoryDomainException {
  constructor(fieldName: string, value: number | undefined) {
    super(`${fieldName} must be greater than 0. Received: ${value}`);
    this.name = 'InvalidQuantityException';
  }
}

export class InvalidWarehouseConfigException extends InventoryDomainException {
  constructor(transactionType: string, message: string) {
    super(`Invalid warehouse config for ${transactionType}: ${message}`);
    this.name = 'InvalidWarehouseConfigException';
  }
}

export class InvalidAdjustReasonException extends InventoryDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAdjustReasonException';
  }
}

export class AdjustReasonNotFoundException extends InventoryDomainException {
  constructor(identifier: string | number) {
    super(`Adjust reason '${identifier}' not found`);
    this.name = 'AdjustReasonNotFoundException';
  }
}

export class DuplicateAdjustReasonCodeException extends InventoryDomainException {
  constructor(code: string) {
    super(`Adjust reason with code '${code}' already exists`);
    this.name = 'DuplicateAdjustReasonCodeException';
  }
}
