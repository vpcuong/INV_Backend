import { BaseDomainEvent } from './domain-event.interface';

export class ItemSkuRemovedEvent extends BaseDomainEvent {
  public readonly eventName = 'ItemSkuRemoved';

  constructor(
    aggregateId: number,
    public readonly skuId: number,
    public readonly skuCode: string,
  ) {
    super(aggregateId);
  }
}
