import { Module } from '@nestjs/common';
import { ItemRevisionsService } from './item-revisions.service';
import { ItemRevisionsController } from './item-revisions.controller';

@Module({
  providers: [ItemRevisionsService],
  controllers: [ItemRevisionsController]
})
export class ItemRevisionsModule {}
