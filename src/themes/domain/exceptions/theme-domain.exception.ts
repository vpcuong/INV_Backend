import { DomainException } from '../../../common/exception-filters/domain-exception.filter';

export class ThemeDomainException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'ThemeDomainException';
  }
}

export class UomRequiredWhenPriceProvidedException extends ThemeDomainException {
  constructor() {
    super('UOM is required when price is provided');
  }
}

// Example: Thêm exception mới - Tự động được DomainExceptionFilter catch
export class InvalidThemeCodeException extends ThemeDomainException {
  constructor(code: string) {
    super(
      `Invalid theme code: ${code}. Code must be alphanumeric and 4-10 characters.`
    );
  }
}

export class DuplicateThemeException extends ThemeDomainException {
  constructor(code: string) {
    super(`Theme with code ${code} already exists`);
  }
}
