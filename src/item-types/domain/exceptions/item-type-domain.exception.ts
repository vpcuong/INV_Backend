export class ItemTypeDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ItemTypeDomainException';
  }
}

export class ItemTypeNotFoundException extends ItemTypeDomainException {
  constructor(id: number) {
    super(`Item type with ID ${id} not found`);
    this.name = 'ItemTypeNotFoundException';
  }
}

export class ItemTypeCodeAlreadyExistsException extends ItemTypeDomainException {
  constructor(code: string) {
    super(`Item type with code ${code} already exists`);
    this.name = 'ItemTypeCodeAlreadyExistsException';
  }
}
