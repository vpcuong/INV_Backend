export class GenderDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GenderDomainException';
  }
}

export class GenderNotFoundException extends GenderDomainException {
  constructor(id: number) {
    super(`Gender with ID ${id} not found`);
    this.name = 'GenderNotFoundException';
  }
}

export class GenderCodeAlreadyExistsException extends GenderDomainException {
  constructor(code: string) {
    super(`Gender with code ${code} already exists`);
    this.name = 'GenderCodeAlreadyExistsException';
  }
}