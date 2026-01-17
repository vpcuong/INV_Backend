import { DomainException } from '../../../common/exception-filters/domain-exception.filter';

export class ItemCategoryDomainException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class InvalidItemCategoryCodeException extends ItemCategoryDomainException {
  constructor(code: string) {
    super(
      `Invalid item category code: ${code}. Code must not exceed 10 characters.`
    );
  }
}

export class ItemCategoryNotFoundException extends ItemCategoryDomainException {
  constructor(id: number) {
    super(`Item category with ID ${id} not found`);
  }
}

export class InvalidItemCategoryFlagsException extends ItemCategoryDomainException {
  constructor() {
    super(
      `Only one of 'isOutsourced', 'isFinishedGood', or 'isFabric' can be true.`
    );
  }
}
