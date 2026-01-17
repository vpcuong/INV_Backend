import { Result } from '../../common/result/result';
import { SOHeader } from '../domain/so-header.entity';

// SO-specific error types
export class SOCreationError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'SOCreationError';
  }
}

export class SOUpdateError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'SOUpdateError';
  }
}

export class SOValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'SOValidationError';
  }
}

export class SOBusinessRuleError extends Error {
  constructor(
    message: string,
    public readonly rule?: string
  ) {
    super(message);
    this.name = 'SOBusinessRuleError';
  }
}

// SO-specific Result types
export type SOResult<T> = Result<
  T,
  SOCreationError | SOUpdateError | SOValidationError | SOBusinessRuleError
>;

// Common SO results
export type SOCreateResult = SOResult<SOHeader>;
export type SOUpdateResult = SOResult<SOHeader>;
export type SODeleteResult = SOResult<void>;

// Helper functions for creating SO results
export class SOResultFactory {
  static success<T>(value: T): SOResult<T> {
    return Result.success(value);
  }

  static creationError(message: string, cause?: Error): SOCreateResult {
    return Result.failure(new SOCreationError(message, cause));
  }

  static updateError(message: string, cause?: Error): SOUpdateResult {
    return Result.failure(new SOUpdateError(message, cause));
  }

  static validationError(message: string, field?: string): SOResult<never> {
    return Result.failure(new SOValidationError(message, field));
  }

  static businessRuleError(message: string, rule?: string): SOResult<never> {
    return Result.failure(new SOBusinessRuleError(message, rule));
  }
}
