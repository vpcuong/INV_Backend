import { Module } from '@nestjs/common';
import { ItemSkusService } from './item-skus.service';
import { ItemSkusController } from './item-skus.controller';

@Module({
  providers: [ItemSkusService],
  controllers: [ItemSkusController],
})
export class ItemSkusModule {}
