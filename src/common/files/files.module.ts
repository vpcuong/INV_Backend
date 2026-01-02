import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { FileRepository } from './infrastructure/file.repository';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [FilesController],
  providers: [
    FilesService,
    {
      provide: 'IFileStorage',
      useClass: LocalStorageProvider, // Có thể swap sang S3StorageProvider, AzureStorageProvider, etc.
    },
    {
      provide: 'IFileRepository',
      useClass: FileRepository,
    },
  ],
  exports: [FilesService],
})
export class FilesModule {}
