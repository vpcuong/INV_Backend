import { Module } from '@nestjs/common';
import { PoService } from './po.service';
import { PoController } from './po.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PORepository } from './infrastructure/po.repository';
import { PONumberGeneratorService } from './domain/services/po-number-generator.service';
import { PO_REPOSITORY, PO_NUMBER_GENERATOR } from './constant/po.token';

@Module({
  imports: [PrismaModule],
  providers: [
    PoService,
    {
      provide: PO_REPOSITORY,
      useClass: PORepository,
    },
    {
      provide: PO_NUMBER_GENERATOR,
      useFactory: (repository: PORepository) => {
        return new PONumberGeneratorService(repository);
      },
      inject: [PO_REPOSITORY],
    },
  ],
  controllers: [PoController],
  exports: [PoService],
})
export class PoModule {}
