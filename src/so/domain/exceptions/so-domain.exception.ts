import { DomainException } from '@/common/exception-filters/domain-exception.filter';

export class SODomainException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'SODomainException';
  }
}

export class InvalidSOException extends SODomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSOException';
  }
}

export class InvalidSOLineException extends SODomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSOLineException';
  }
}

export class InvalidQuantityException extends SODomainException {
  constructor(field: string, value: number) {
    super(`${field} must be greater than 0: ${value}`);
    this.name = 'InvalidQuantityException';
  }
}

export class InvalidAmountException extends SODomainException {
  constructor(field: string, value: number) {
    super(`${field} cannot be negative: ${value}`);
    this.name = 'InvalidAmountException';
  }
}

export class InvalidStatusTransitionException extends SODomainException {
  constructor(from: string, to: string) {
    super(`Invalid status transition from ${from} to ${to}`);
    this.name = 'InvalidStatusTransitionException';
  }
}
