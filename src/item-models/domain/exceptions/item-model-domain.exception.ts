export class ItemModelDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ItemModelDomainException';
  }
}

export class InvalidItemModelException extends ItemModelDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidItemModelException';
  }
}

export class DuplicateItemModelCodeException extends ItemModelDomainException {
  constructor(code: string) {
    super(`Item model with code ${code} already exists`);
    this.name = 'DuplicateItemModelCodeException';
  }
}

export class InvalidItemModelStatusException extends ItemModelDomainException {
  constructor(currentStatus: string, targetStatus: string) {
    super(`Cannot change status from ${currentStatus} to ${targetStatus}`);
    this.name = 'InvalidItemModelStatusException';
  }
}
