import { BaseDomainEvent } from './domain-event.interface';

export class ItemModelAddedEvent extends BaseDomainEvent {
  public readonly eventName = 'ItemModelAdded';

  constructor(
    aggregateId: number,
    public readonly modelId: number,
    public readonly modelCode: string,
  ) {
    super(aggregateId);
  }
}
