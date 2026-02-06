import { Module } from '@nestjs/common';
import { UomService } from './application/uom.service';
import { UomQueryService } from './application/uom-query.service';
import { UomRepository } from './infrastructure/uom.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { UomClassController } from './presentation/controllers/uom-class.controller';
import { UomController } from './presentation/controllers/uom.controller';
import { UomConversionController, UomConversionListController } from './presentation/controllers/uom-conversion.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UomClassController, UomController, UomConversionController, UomConversionListController],
  providers: [
    UomService,
    UomQueryService,
    {
      provide: 'IUomRepository',
      useClass: UomRepository,
    },
  ],
  exports: [UomService, UomQueryService],
})
export class UomModule {}
