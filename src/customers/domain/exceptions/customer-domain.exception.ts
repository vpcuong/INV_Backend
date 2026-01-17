export class CustomerDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomerDomainException';
  }
}

export class CustomerNotFoundException extends CustomerDomainException {
  constructor(identifier: string | number) {
    super(`Customer with identifier ${identifier} not found`);
    this.name = 'CustomerNotFoundException';
  }
}

export class DuplicateCustomerCodeException extends CustomerDomainException {
  constructor(code: string) {
    super(`Customer with code ${code} already exists`);
    this.name = 'DuplicateCustomerCodeException';
  }
}

export class InvalidCustomerStatusException extends CustomerDomainException {
  constructor(currentStatus: string, targetStatus: string) {
    super(
      `Cannot change customer status from ${currentStatus} to ${targetStatus}`
    );
    this.name = 'InvalidCustomerStatusException';
  }
}
