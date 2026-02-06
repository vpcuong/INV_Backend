import { Module } from '@nestjs/common';
import { UomService } from './application/uom.service';
import { UomRepository } from './infrastructure/uom.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { UomClassController } from './presentation/controllers/uom-class.controller';
import { UomController } from './presentation/controllers/uom.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UomClassController, UomController],
  providers: [
    UomService,
    {
      provide: 'IUomRepository',
      useClass: UomRepository,
    },
  ],
  exports: [UomService],
})
export class UomModule {}
