import { Module } from '@nestjs/common';
import { SkuUomService } from './sku-uom.service';
import { SkuUomController } from './sku-uom.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SkuUomController],
  providers: [SkuUomService],
  exports: [SkuUomService],
})
export class SkuUomModule {}
