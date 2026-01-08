export class MaterialDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MaterialDomainException';
  }
}

export class MaterialNotFoundException extends MaterialDomainException {
  constructor(id: number) {
    super(`Material with ID ${id} not found`);
    this.name = 'MaterialNotFoundException';
  }
}

export class MaterialCodeAlreadyExistsException extends MaterialDomainException {
  constructor(code: string) {
    super(`Material with code ${code} already exists`);
    this.name = 'MaterialCodeAlreadyExistsException';
  }
}

export class MaterialInUseException extends MaterialDomainException {
  constructor(id: number, itemCount: number) {
    super(`Cannot delete material with ID ${id}. It is being used by ${itemCount} item(s)`);
    this.name = 'MaterialInUseException';
  }
}