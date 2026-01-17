import { Module } from '@nestjs/common';
import { SalesOrdersController } from './sales-orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SOService } from './application/so.service';
import { SOQueryService } from './application/so-query.service';
import { SO_HEADER_REPOSITORY } from './constant/so.token';
import { SOHeaderRepository } from './infrastructure/so-header.repository';
import { QueryBuilderService } from '../common/filtering/query-builder.service';
import { AuditLoggerService } from './common/audit-logger.service';

@Module({
  imports: [PrismaModule],
  providers: [
    SOService,
    SOQueryService,
    AuditLoggerService,
    {
      provide: SO_HEADER_REPOSITORY,
      useClass: SOHeaderRepository,
    },
    QueryBuilderService,
  ],
  controllers: [SalesOrdersController],
  exports: [SOService, SOQueryService],
})
export class SoModule {}
