import { Module } from '@nestjs/common';
import { SalesOrdersController } from './so.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SOService } from './application/so.service';
import { SOQueryService } from './application/so-query.service';
import {
  SO_HEADER_REPOSITORY,
  SO_NUMBER_GENERATOR,
  EXCHANGE_RATE_SERVICE,
  ITEM_REPOSITORY,
} from './constant/so.token';
import { SOHeaderRepository } from './infrastructure/so.repository';
import { QueryBuilderService } from '../common/filtering/query-builder.service';
import { AuditLoggerService } from './common/audit-logger.service';
import { SONumberGeneratorService } from './domain/services/so-number-generator.service';
import { ExchangeRateService } from './domain/services/exchange-rate.service';
import { ItemRepository } from '../items/infrastructure/item.repository';
import { ItemsModule } from '../items/items.module';

@Module({
  imports: [PrismaModule, ItemsModule],
  providers: [
    SOService,
    SOQueryService,
    AuditLoggerService,
    {
      provide: SO_HEADER_REPOSITORY,
      useClass: SOHeaderRepository,
    },
    {
      provide: SO_NUMBER_GENERATOR,
      useFactory: (repository: SOHeaderRepository) => {
        return new SONumberGeneratorService(repository);
      },
      inject: [SO_HEADER_REPOSITORY],
    },
    {
      provide: EXCHANGE_RATE_SERVICE,
      useClass: ExchangeRateService,
    },
    {
      provide: ITEM_REPOSITORY,
      useClass: ItemRepository,
    },
    QueryBuilderService,
  ],
  controllers: [SalesOrdersController],
  exports: [SOService, SOQueryService],
})
export class SoModule {}
