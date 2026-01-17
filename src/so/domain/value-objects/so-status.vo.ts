import { InvalidStatusTransitionException } from '../exceptions/so-domain.exception';

export class SOStatus {
  private static readonly VALID_STATUSES = [
    'DRAFT',
    'OPEN',
    'ON_HOLD',
    'PARTIAL',
    'CLOSED',
    'CANCELLED',
  ] as const;

  private static readonly VALID_TRANSITIONS = {
    DRAFT: ['OPEN', 'CANCELLED'],
    OPEN: ['ON_HOLD', 'PARTIAL', 'CLOSED', 'CANCELLED'],
    ON_HOLD: ['OPEN', 'CANCELLED'],
    PARTIAL: ['CLOSED', 'CANCELLED'],
    CLOSED: [],
    CANCELLED: [],
  } as const;

  private constructor(private readonly value: string) {
    this.validateStatus(value);
  }

  private validateStatus(status: string): void {
    if (!SOStatus.VALID_STATUSES.includes(status as any)) {
      throw new Error(
        `Invalid status: ${status}. Valid statuses: ${SOStatus.VALID_STATUSES.join(', ')}`
      );
    }
  }

  public static create(status: string): SOStatus {
    return new SOStatus(status.toUpperCase());
  }

  public static draft(): SOStatus {
    return new SOStatus('DRAFT');
  }

  public static open(): SOStatus {
    return new SOStatus('OPEN');
  }

  public canTransitionTo(newStatus: string): boolean {
    const transitions = SOStatus.VALID_TRANSITIONS[
      this.value as keyof typeof SOStatus.VALID_TRANSITIONS
    ];
    // @ts-expect-error - type issue with includes
    return transitions?.includes(newStatus as any) ?? false;
  }

  public transition(newStatus: string): SOStatus {
    const normalizedNewStatus = newStatus.toUpperCase();

    if (!this.canTransitionTo(normalizedNewStatus)) {
      throw new InvalidStatusTransitionException(
        this.value,
        normalizedNewStatus
      );
    }

    return new SOStatus(normalizedNewStatus);
  }

  // Business state methods
  public isDraft(): boolean {
    return this.value === 'DRAFT';
  }

  public isOpen(): boolean {
    return this.value === 'OPEN';
  }

  public isOnHold(): boolean {
    return this.value === 'ON_HOLD';
  }

  public isPartial(): boolean {
    return this.value === 'PARTIAL';
  }

  public isClosed(): boolean {
    return this.value === 'CLOSED';
  }

  public isCancelled(): boolean {
    return this.value === 'CANCELLED';
  }

  public isActive(): boolean {
    return ['DRAFT', 'OPEN', 'ON_HOLD', 'PARTIAL'].includes(this.value);
  }

  public isFinal(): boolean {
    return ['CLOSED', 'CANCELLED'].includes(this.value);
  }

  // Transition methods
  public toOpen(): SOStatus {
    return this.transition('OPEN');
  }

  public toOnHold(): SOStatus {
    return this.transition('ON_HOLD');
  }

  public toPartial(): SOStatus {
    return this.transition('PARTIAL');
  }

  public toClosed(): SOStatus {
    return this.transition('CLOSED');
  }

  public toCancelled(): SOStatus {
    return this.transition('CANCELLED');
  }

  // Getters
  public getValue(): string {
    return this.value;
  }

  // Persistence methods
  public toPersistence(): string {
    return this.value;
  }

  public static fromPersistence(value: string): SOStatus {
    return new SOStatus(value);
  }

  // Equality
  public equals(other: SOStatus): boolean {
    return this.value === other.value;
  }

  // toString
  public toString(): string {
    return this.value;
  }
}
