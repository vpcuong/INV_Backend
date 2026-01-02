# Files Module

Shared module for file management across the application.

## Features

- ✅ Upload single/multiple files
- ✅ File validation (type, size)
- ✅ Multiple storage providers (Local, S3, Azure - extensible)
- ✅ Clean architecture with interface abstraction
- ✅ Easy to test and mock

## Usage

### 1. Import FilesModule

```typescript
// theme.module.ts
import { FilesModule } from '../common/files/files.module';

@Module({
  imports: [FilesModule],
  // ...
})
export class ThemeModule {}
```

### 2. Use in Controller

```typescript
// theme.controller.ts
import { FilesService } from '../common/files/files.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('themes')
export class ThemeController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const result = await this.filesService.uploadFile(file, 'themes');
    return result;
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    const results = await this.filesService.uploadFiles(files, 'themes');
    return results;
  }

  @Delete('file/:path')
  async deleteFile(@Param('path') path: string) {
    await this.filesService.deleteFile(path);
    return { message: 'File deleted successfully' };
  }
}
```

### 3. Use in Service

```typescript
// theme.service.ts
export class ThemeService {
  constructor(
    private readonly filesService: FilesService,
    private readonly themeRepository: IThemeRepository
  ) {}

  async createTheme(dto: CreateThemeDto, imageFile?: Express.Multer.File) {
    let imgUrl = '';

    if (imageFile) {
      const uploadResult = await this.filesService.uploadFile(imageFile, 'themes');
      imgUrl = uploadResult.url;
    }

    const theme = new Theme({
      ...dto,
      imgUrls: imgUrl,
    });

    return this.themeRepository.save(theme);
  }

  async deleteTheme(id: number) {
    const theme = await this.themeRepository.findById(id);

    // Delete associated files
    if (theme.imgUrls) {
      const path = theme.imgUrls.split('/uploads/')[1];
      await this.filesService.deleteFile(path);
    }

    await this.themeRepository.delete(id);
  }
}
```

## Storage Providers

### Local Storage (Default)

```typescript
// files.module.ts
{
  provide: 'IFileStorage',
  useClass: LocalStorageProvider,
}
```

### AWS S3 (Future)

```typescript
// s3-storage.provider.ts
export class S3StorageProvider implements IFileStorage {
  // Implementation using AWS SDK
}

// files.module.ts
{
  provide: 'IFileStorage',
  useClass: S3StorageProvider,
}
```

### Azure Blob Storage (Future)

```typescript
// azure-storage.provider.ts
export class AzureStorageProvider implements IFileStorage {
  // Implementation using Azure SDK
}
```

## Configuration

Add to `.env`:

```env
UPLOAD_PATH=./uploads
BASE_URL=http://localhost:3000
```

## File Validation

```typescript
// Current limits (can be customized)
MAX_IMAGE_SIZE = 5MB
MAX_DOCUMENT_SIZE = 10MB

ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', ...]
```

## Testing

```typescript
const mockFilesService = {
  uploadFile: jest.fn().mockResolvedValue({
    url: 'http://localhost:3000/uploads/test.jpg',
    filename: 'test.jpg',
    path: 'themes/test.jpg',
    size: 1024,
    mimetype: 'image/jpeg',
  }),
};
```

## Architecture Benefits

1. **Abstraction**: Easy to swap storage providers
2. **Testability**: Mock `IFileStorage` interface
3. **Reusability**: Use across multiple modules
4. **Maintainability**: Changes in one place
5. **Type Safety**: TypeScript interfaces
