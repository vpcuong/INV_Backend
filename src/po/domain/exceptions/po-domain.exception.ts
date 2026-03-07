import { DomainException } from '../../../common/exception-filters/domain-exception.filter';

export class PODomainException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'PODomainException';
  }
}

export class InvalidPOException extends PODomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPOException';
  }
}

export class InvalidPOLineException extends PODomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPOLineException';
  }
}

export class InvalidPOStatusTransitionException extends PODomainException {
  constructor(from: string, to: string) {
    super(`Invalid PO status transition from ${from} to ${to}`);
    this.name = 'InvalidPOStatusTransitionException';
  }
}

export class InvalidPOLineStatusTransitionException extends PODomainException {
  constructor(from: string, to: string) {
    super(`Invalid PO line status transition from ${from} to ${to}`);
    this.name = 'InvalidPOLineStatusTransitionException';
  }
}

export class InvalidPOAmountException extends PODomainException {
  constructor(field: string, value: number) {
    super(`${field} cannot be negative: ${value}`);
    this.name = 'InvalidPOAmountException';
  }
}
