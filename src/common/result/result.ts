export class Result<T, E = Error> {
  private constructor(
    private readonly value: T | null,
    private readonly error: E | null
  ) {}

  public static success<T>(value: T): Result<T, never> {
    return new Result(value, null) as Result<T, never>;
  }

  public static failure<E>(error: E): Result<never, E> {
    return new Result(null, error) as Result<never, E>;
  }

  public isSuccess(): boolean {
    return this.error === null;
  }

  public isFailure(): boolean {
    return this.error !== null;
  }

  public getValue(): T {
    if (this.isFailure()) {
      throw this.error!;
    }
    return this.value!;
  }

  public getError(): E | null {
    return this.error;
  }

  public map<U>(fn: (value: T) => U): Result<U, E> {
    return this.isFailure()
      ? Result.failure(this.error!)
      : Result.success(fn(this.value!));
  }

  public flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.isFailure() ? Result.failure(this.error!) : fn(this.value!);
  }

  public onSuccess(fn: (value: T) => void): Result<T, E> {
    if (this.isSuccess()) {
      fn(this.value!);
    }
    return this;
  }

  public onFailure(fn: (error: E) => void): Result<T, E> {
    if (this.isFailure()) {
      fn(this.error!);
    }
    return this;
  }

  public getOrElse(defaultValue: T): T {
    return this.isSuccess() ? this.value! : defaultValue;
  }

  public orElse<U>(fn: (error: E) => Result<U, E>): Result<T | U, E> {
    return this.isSuccess() ? this : fn(this.error!);
  }

  public match<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    return this.isSuccess() ? onSuccess(this.value!) : onFailure(this.error!);
  }
}
