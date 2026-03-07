import { InvalidPOStatusTransitionException } from '../exceptions/po-domain.exception';

export class POStatus {
  private static readonly VALID_STATUSES = [
    'DRAFT',
    'APPROVED',
    'PARTIALLY_RECEIVED',
    'RECEIVED',
    'CLOSED',
    'CANCELLED',
  ] as const;

  private static readonly VALID_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ['APPROVED', 'CANCELLED'],
    APPROVED: ['PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
    PARTIALLY_RECEIVED: ['RECEIVED', 'CANCELLED'],
    RECEIVED: ['CLOSED'],
    CLOSED: [],
    CANCELLED: [],
  };

  private constructor(private readonly value: string) {}

  public static create(status: string): POStatus {
    const upper = status.toUpperCase();
    if (!POStatus.VALID_STATUSES.includes(upper as any)) {
      throw new Error(
        `Invalid PO status: ${status}. Valid: ${POStatus.VALID_STATUSES.join(', ')}`
      );
    }
    return new POStatus(upper);
  }

  public static draft(): POStatus {
    return new POStatus('DRAFT');
  }

  public canTransitionTo(next: string): boolean {
    return POStatus.VALID_TRANSITIONS[this.value]?.includes(next) ?? false;
  }

  public transition(next: string): POStatus {
    const upper = next.toUpperCase();
    if (!this.canTransitionTo(upper)) {
      throw new InvalidPOStatusTransitionException(this.value, upper);
    }
    return new POStatus(upper);
  }

  public isDraft(): boolean { return this.value === 'DRAFT'; }
  public isApproved(): boolean { return this.value === 'APPROVED'; }
  public isPartiallyReceived(): boolean { return this.value === 'PARTIALLY_RECEIVED'; }
  public isReceived(): boolean { return this.value === 'RECEIVED'; }
  public isClosed(): boolean { return this.value === 'CLOSED'; }
  public isCancelled(): boolean { return this.value === 'CANCELLED'; }
  public isFinal(): boolean { return ['CLOSED', 'CANCELLED'].includes(this.value); }
  public isActive(): boolean { return !this.isFinal(); }

  public approve(): POStatus { return this.transition('APPROVED'); }
  public cancel(): POStatus { return this.transition('CANCELLED'); }
  public close(): POStatus { return this.transition('CLOSED'); }

  public getValue(): string { return this.value; }
  public toPersistence(): string { return this.value; }
  public static fromPersistence(value: string): POStatus { return new POStatus(value); }
  public equals(other: POStatus): boolean { return this.value === other.value; }
  public toString(): string { return this.value; }
}

export class POLineStatus {
  private static readonly VALID_STATUSES = [
    'OPEN',
    'PARTIALLY_RECEIVED',
    'RECEIVED',
    'CANCELLED',
  ] as const;

  private static readonly VALID_TRANSITIONS: Record<string, string[]> = {
    OPEN: ['PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
    PARTIALLY_RECEIVED: ['RECEIVED', 'CANCELLED'],
    RECEIVED: [],
    CANCELLED: [],
  };

  private constructor(private readonly value: string) {}

  public static create(status: string): POLineStatus {
    const upper = status.toUpperCase();
    if (!POLineStatus.VALID_STATUSES.includes(upper as any)) {
      throw new Error(
        `Invalid PO line status: ${status}. Valid: ${POLineStatus.VALID_STATUSES.join(', ')}`
      );
    }
    return new POLineStatus(upper);
  }

  public static open(): POLineStatus { return new POLineStatus('OPEN'); }

  public canTransitionTo(next: string): boolean {
    return POLineStatus.VALID_TRANSITIONS[this.value]?.includes(next) ?? false;
  }

  public transition(next: string): POLineStatus {
    const upper = next.toUpperCase();
    if (!this.canTransitionTo(upper)) {
      throw new Error(`Invalid PO line status transition from ${this.value} to ${upper}`);
    }
    return new POLineStatus(upper);
  }

  public isOpen(): boolean { return this.value === 'OPEN'; }
  public isPartiallyReceived(): boolean { return this.value === 'PARTIALLY_RECEIVED'; }
  public isReceived(): boolean { return this.value === 'RECEIVED'; }
  public isCancelled(): boolean { return this.value === 'CANCELLED'; }
  public isFinal(): boolean { return ['RECEIVED', 'CANCELLED'].includes(this.value); }

  public getValue(): string { return this.value; }
  public toPersistence(): string { return this.value; }
  public static fromPersistence(value: string): POLineStatus { return new POLineStatus(value); }
  public equals(other: POLineStatus): boolean { return this.value === other.value; }
  public toString(): string { return this.value; }
}
