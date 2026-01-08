import { Module } from '@nestjs/common';
import { GendersController } from './genders.controller';
import { GenderService } from './application/gender.service';
import { GenderRepository } from './infrastructure/gender.repository';
import { GENDER_REPOSITORY } from './constant/gender.token';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GendersController],
  providers: [
    GenderService,
    {
      provide: GENDER_REPOSITORY,
      useClass: GenderRepository,
    },
  ],
  exports: [GenderService],
})
export class GendersModule {}
