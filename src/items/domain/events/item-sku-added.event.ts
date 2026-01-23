import { BaseDomainEvent } from './domain-event.interface';

export class ItemSkuAddedEvent extends BaseDomainEvent {
  public readonly eventName = 'ItemSkuAdded';

  constructor(
    aggregateId: number,
    public readonly modelId: number | null,
    public readonly skuId: number,
    public readonly skuCode: string,
  ) {
    super(aggregateId);
  }
}
