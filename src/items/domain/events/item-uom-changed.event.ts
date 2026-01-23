import { BaseDomainEvent } from './domain-event.interface';

export class ItemUomAddedEvent extends BaseDomainEvent {
  public readonly eventName = 'ItemUomAdded';

  constructor(
    aggregateId: number,
    public readonly uomCode: string,
  ) {
    super(aggregateId);
  }
}

export class ItemUomRemovedEvent extends BaseDomainEvent {
  public readonly eventName = 'ItemUomRemoved';

  constructor(
    aggregateId: number,
    public readonly uomCode: string,
  ) {
    super(aggregateId);
  }
}
