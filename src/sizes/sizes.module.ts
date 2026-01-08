import { Module } from '@nestjs/common';
import { SizesController } from './sizes.controller';
import { SizeService } from './application/size.service';
import { SizeRepository } from './infrastructure/size.repository';
import { SIZE_REPOSITORY } from './constant/size.token';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SizesController],
  providers: [
    SizeService,
    {
      provide: SIZE_REPOSITORY,
      useClass: SizeRepository,
    },
  ],
  exports: [SizeService],
})
export class SizesModule {}
