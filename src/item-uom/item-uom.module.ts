import { Module } from '@nestjs/common';
import { ItemUomService } from './item-uom.service';
import { ItemUomController } from './item-uom.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ItemUomController],
  providers: [ItemUomService],
  exports: [ItemUomService],
})
export class ItemUomModule {}