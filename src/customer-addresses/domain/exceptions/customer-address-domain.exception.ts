export class CustomerAddressDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomerAddressDomainException';
  }
}

export class CustomerAddressNotFoundException extends CustomerAddressDomainException {
  constructor(identifier: string | number) {
    super(`Customer address with identifier ${identifier} not found`);
    this.name = 'CustomerAddressNotFoundException';
  }
}

export class InvalidAddressException extends CustomerAddressDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAddressException';
  }
}

export class DuplicateDefaultAddressException extends CustomerAddressDomainException {
  constructor(customerId: number, addressType: string) {
    super(
      `Customer ${customerId} already has a default ${addressType} address`,
    );
    this.name = 'DuplicateDefaultAddressException';
  }
}