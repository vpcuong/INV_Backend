import { BaseDomainEvent } from './domain-event.interface';

export class ItemModelRemovedEvent extends BaseDomainEvent {
  public readonly eventName = 'ItemModelRemoved';

  constructor(
    aggregateId: number,
    public readonly modelId: number,
    public readonly modelCode: string,
  ) {
    super(aggregateId);
  }
}
