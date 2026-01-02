# File Management Usage Examples

## Example 1: Theme với File Management

### Controller

```typescript
import { FilesService } from '../common/files/files.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('themes')
export class ThemeController {
  constructor(
    private readonly themeService: ThemeService,
    private readonly filesService: FilesService
  ) {}

  // Upload theme với image
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createThemeDto: CreateThemeDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    return this.themeService.create(createThemeDto, image);
  }

  // Upload multiple gallery images cho theme
  @Post(':id/gallery')
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadGallery(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() images: Express.Multer.File[]
  ) {
    const files = await Promise.all(
      images.map(img =>
        this.filesService.uploadFile(img, {
          contextType: 'theme',
          contextId: id,
          contextKey: 'gallery',
          category: 'image',
        })
      )
    );
    return files;
  }

  // Set primary image
  @Patch(':id/primary-image/:fileId')
  async setPrimaryImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('fileId', ParseIntPipe) fileId: number
  ) {
    await this.filesService.setPrimaryFile(fileId, 'theme', id);
    return { message: 'Primary image set successfully' };
  }

  // Get theme files
  @Get(':id/files')
  async getThemeFiles(@Param('id', ParseIntPipe) id: number) {
    return this.filesService.getFilesByContext('theme', id);
  }

  // Delete theme - cascading delete files
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    // Delete all files
    await this.filesService.deleteFilesByContext('theme', id);

    // Delete theme
    await this.themeService.delete(id);

    return { message: 'Theme and files deleted successfully' };
  }
}
```

### Service

```typescript
export class ThemeService {
  constructor(
    @Inject('IThemeRepository') private readonly themeRepository: IThemeRepository,
    private readonly filesService: FilesService
  ) {}

  async create(dto: CreateThemeDto, image?: Express.Multer.File): Promise<Theme> {
    // Create theme first
    const theme = new Theme({
      code: dto.code,
      desc: dto.desc,
      supplierId: dto.supplierId,
      colorCode: dto.colorCode,
      price: dto.price,
      uom: dto.uom,
    });

    const savedTheme = await this.themeRepository.save(theme);

    // Upload image if provided
    if (image) {
      await this.filesService.uploadFile(image, {
        contextType: 'theme',
        contextId: savedTheme.toPersistence().id,
        contextKey: 'thumbnail',
        category: 'image',
        isPrimary: true,
      });
    }

    return savedTheme;
  }

  async getThemeWithFiles(id: number) {
    const theme = await this.themeRepository.findById(id);
    const files = await this.filesService.getFilesByContext('theme', id);
    const primaryImage = await this.filesService.getPrimaryFile('theme', id);

    return {
      ...theme.toPersistence(),
      files: files.map(f => f.toPersistence()),
      primaryImage: primaryImage?.toPersistence(),
    };
  }
}
```

## Example 2: Query Files

```typescript
// Get all gallery images for a theme
const galleryImages = await filesService.getFilesByContext('theme', 1, 'gallery');

// Get primary image
const primaryImage = await filesService.getPrimaryFile('theme', 1);

// Get all files (thumbnail + gallery)
const allFiles = await filesService.getFilesByContext('theme', 1);
```

## Example 3: File Organization

```typescript
// Theme with multiple file contexts
await filesService.uploadFile(thumbnailFile, {
  contextType: 'theme',
  contextId: 1,
  contextKey: 'thumbnail',    // Main thumbnail
  isPrimary: true,
});

await filesService.uploadFile(bannerFile, {
  contextType: 'theme',
  contextId: 1,
  contextKey: 'banner',       // Banner image
});

await filesService.uploadFile(galleryFile1, {
  contextType: 'theme',
  contextId: 1,
  contextKey: 'gallery',      // Gallery image
});
```

## Example 4: Cleanup Job (Cron)

```typescript
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class FileCleanupService {
  constructor(private readonly filesService: FilesService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOrphanedFiles() {
    const deletedCount = await this.filesService.cleanupOrphanedFiles();
    console.log(`Cleaned up ${deletedCount} orphaned files`);
  }
}
```

## Database Queries

```sql
-- Get all files for a theme
SELECT * FROM files
WHERE context_type = 'theme'
  AND context_id = 1
  AND deleted_at IS NULL
ORDER BY display_order;

-- Get primary image
SELECT * FROM files
WHERE context_type = 'theme'
  AND context_id = 1
  AND is_primary = true
  AND deleted_at IS NULL;

-- Storage usage per context
SELECT
  context_type,
  COUNT(*) as file_count,
  SUM(size) / 1024 / 1024 as total_mb
FROM files
WHERE deleted_at IS NULL
GROUP BY context_type;

-- Find themes with no images
SELECT t.*
FROM themes t
LEFT JOIN files f ON f.context_type = 'theme' AND f.context_id = t.id AND f.deleted_at IS NULL
WHERE f.id IS NULL;
```

## Benefits

✅ **Traceability**: Biết file nào thuộc entity nào
✅ **Cascading Delete**: Xóa entity → auto xóa files
✅ **Multiple Files**: Dễ dàng quản lý nhiều files per entity
✅ **Organization**: Phân loại theo contextKey (thumbnail, gallery, etc.)
✅ **Soft Delete**: Có thể restore
✅ **Analytics**: Storage usage, file counts, etc.
