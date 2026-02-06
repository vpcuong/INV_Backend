import { DomainException } from '../../../common/exception-filters/domain-exception.filter';

export class UomDomainException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'UomDomainException';
  }
}

export class UomClassNotFoundException extends UomDomainException {
  constructor(code: string) {
    super(`UOM Class not found: ${code}`);
    this.name = 'UomClassNotFoundException';
  }
}

export class DuplicateUomClassCodeException extends UomDomainException {
  constructor(code: string) {
    super(`UOM Class code already exists: ${code}`);
    this.name = 'DuplicateUomClassCodeException';
  }
}

export class UomNotFoundException extends UomDomainException {
  constructor(code: string) {
    super(`UOM not found: ${code}`);
    this.name = 'UomNotFoundException';
  }
}

export class DuplicateUomCodeException extends UomDomainException {
  constructor(uomCode: string, classCode: string) {
    super(`UOM ${uomCode} already exists in class ${classCode}`);
    this.name = 'DuplicateUomCodeException';
  }
}

export class UomConversionNotFoundException extends UomDomainException {
  constructor(uomCode: string, classCode: string) {
    super(`Conversion for UOM ${uomCode} not found in class ${classCode}`);
    this.name = 'UomConversionNotFoundException';
  }
}

export class InvalidUomFactorException extends UomDomainException {
  constructor(factor: number) {
    super(`UOM conversion factor must be positive: ${factor}`);
    this.name = 'InvalidUomFactorException';
  }
}

export class InvalidUomException extends UomDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUomException';
  }
}