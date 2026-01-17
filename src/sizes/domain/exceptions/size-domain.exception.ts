export class SizeDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SizeDomainException';
  }
}

export class SizeNotFoundException extends SizeDomainException {
  constructor(id: number) {
    super(`Size with ID ${id} not found`);
    this.name = 'SizeNotFoundException';
  }
}

export class SizeCodeAlreadyExistsException extends SizeDomainException {
  constructor(code: string) {
    super(`Size with code ${code} already exists`);
    this.name = 'SizeCodeAlreadyExistsException';
  }
}
