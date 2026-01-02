import { Module } from '@nestjs/common';
import { ThemeService } from './application/theme.service';
import { ThemeController } from './theme.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ThemeRepository } from './infrastructure/theme.repository';
import { FilesModule } from '../common/files/files.module';
import { INJECTION_TOKENS } from './constant/theme.token';

@Module({
  imports: [PrismaModule, FilesModule],
  controllers: [ThemeController],
  providers: [
    ThemeService,
    {
      provide: INJECTION_TOKENS.THEME_REPOSITORY,
      useClass: ThemeRepository
    }
  ],
  exports: [ThemeService]
})

export class ThemeModule {}