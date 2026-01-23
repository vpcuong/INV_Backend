export interface DomainEvent {
  readonly eventName: string;
  readonly occurredAt: Date;
  readonly aggregateId: number;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly occurredAt: Date;

  constructor(public readonly aggregateId: number) {
    this.occurredAt = new Date();
  }

  abstract get eventName(): string;
}
