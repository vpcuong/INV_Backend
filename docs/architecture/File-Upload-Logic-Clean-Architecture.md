# Logic Lưu Ảnh Khi Tạo Theme - Clean Architecture

## Tổng Quan

Khi tạo Theme và cần lưu ảnh, logic nên được **phân tách rõ ràng** theo các layers:

```
Controller → Application Service → Domain Entity → Infrastructure
                ↓
         File Service (Infrastructure)
```

---

## Kiến Trúc Đề Xuất

### **1. Domain Layer** - Business Logic

```typescript
// src/themes/domain/theme.entity.ts
export interface ThemeConstructorData {
  id: number;
  code: string;
  desc: string;
  custId: number;
  colors: Color[];
  imgUrls: string[];  // ← Chỉ lưu URL/path, KHÔNG lưu file
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export class Theme {
  private id: number;
  private code: string;
  private desc: string;
  private custId: number;
  private colors: Color[];
  private imgUrls: string[] = [];  // ← URLs của ảnh
  private createdAt: Date;
  private updatedAt: Date;
  private createdBy: string;

  constructor(data: ThemeConstructorData) {
    // Validation
    if (!data.code || data.code.trim() === '') {
      throw new Error('Theme code is required');
    }
    if (data.imgUrls && data.imgUrls.length > 10) {
      throw new Error('Maximum 10 images allowed per theme');
    }

    this.id = data.id;
    this.code = data.code;
    this.desc = data.desc;
    this.custId = data.custId;
    this.colors = data.colors || [];
    this.imgUrls = data.imgUrls || [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.createdBy = data.createdBy;
  }

  // Business Logic: Add image URL
  public addImageUrl(url: string): void {
    if (this.imgUrls.length >= 10) {
      throw new Error('Cannot add more than 10 images');
    }
    if (!url || url.trim() === '') {
      throw new Error('Image URL cannot be empty');
    }
    this.imgUrls.push(url);
  }

  // Business Logic: Remove image URL
  public removeImageUrl(url: string): void {
    const index = this.imgUrls.indexOf(url);
    if (index === -1) {
      throw new Error('Image URL not found');
    }
    this.imgUrls.splice(index, 1);
  }

  // Getters
  public getId(): number { return this.id; }
  public getCode(): string { return this.code; }
  public getImgUrls(): string[] { return [...this.imgUrls]; }

  public toPersistence(): any {
    return {
      id: this.id,
      code: this.code,
      desc: this.desc,
      custId: this.custId,
      colors: this.colors,
      imgUrls: this.imgUrls,  // ← Lưu URLs vào DB
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
    };
  }

  public static fromPersistence(data: any): Theme {
    return new Theme({
      id: data.id,
      code: data.code,
      desc: data.desc,
      custId: data.custId,
      colors: data.colors?.map((c: any) => Color.fromPersistence(c)) || [],
      imgUrls: data.imgUrls || [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      createdBy: data.createdBy,
    });
  }
}
```

---

### **2. Infrastructure Layer** - File Storage Service

```typescript
// src/common/infrastructure/file-storage.service.ts
import { Injectable } from '@nestjs/common';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface IFileStorageService {
  saveFile(file: Express.Multer.File, folder: string): Promise<string>;
  deleteFile(filePath: string): Promise<void>;
  getFileUrl(filePath: string): string;
}

@Injectable()
export class FileStorageService implements IFileStorageService {
  private readonly uploadDir = 'uploads'; // Base upload directory

  /**
   * Save file to disk
   * @param file - Multer file object
   * @param folder - Subfolder (e.g., 'themes', 'products')
   * @returns Relative file path
   */
  async saveFile(
    file: Express.Multer.File,
    folder: string
  ): Promise<string> {
    // 1. Create folder if not exists
    const folderPath = join(this.uploadDir, folder);
    if (!existsSync(folderPath)) {
      await mkdir(folderPath, { recursive: true });
    }

    // 2. Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.originalname.split('.').pop();
    const filename = `${timestamp}-${randomString}.${extension}`;

    // 3. Full file path
    const filePath = join(folderPath, filename);

    // 4. Save file
    await writeFile(filePath, file.buffer);

    // 5. Return relative path (to store in DB)
    return join(folder, filename);
  }

  /**
   * Delete file from disk
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = join(this.uploadDir, filePath);
    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }
  }

  /**
   * Get public URL for file
   */
  getFileUrl(filePath: string): string {
    return `/uploads/${filePath}`;
  }
}
```

---

### **3. Application Layer** - Theme Service

```typescript
// src/themes/application/theme.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Theme } from '../domain/theme.entity';
import { IThemeRepository } from '../domain/theme.repository.interface';
import { IFileStorageService } from '../../common/infrastructure/file-storage.service';
import { CreateThemeDto } from '../dto/create-theme.dto';

@Injectable()
export class ThemeApplicationService {
  constructor(
    @Inject('IThemeRepository')
    private readonly themeRepository: IThemeRepository,

    @Inject('IFileStorageService')
    private readonly fileStorage: IFileStorageService,
  ) {}

  /**
   * Use Case: Create Theme with Images
   */
  async createTheme(
    dto: CreateThemeDto,
    imageFiles: Express.Multer.File[]
  ): Promise<any> {
    // 1. Upload images to storage FIRST
    const imgUrls: string[] = [];

    try {
      for (const file of imageFiles || []) {
        // Validate file type
        if (!this.isValidImageFile(file)) {
          throw new Error(`Invalid file type: ${file.originalname}`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File too large: ${file.originalname}`);
        }

        // Save file and get path
        const filePath = await this.fileStorage.saveFile(file, 'themes');
        imgUrls.push(filePath);
      }

      // 2. Create domain entity with image URLs
      const theme = new Theme({
        id: 0, // Will be set by database
        code: dto.code,
        desc: dto.desc,
        custId: dto.custId,
        colors: [], // Will be added separately if needed
        imgUrls: imgUrls,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: dto.createdBy,
      });

      // 3. Save to database
      const savedTheme = await this.themeRepository.save(theme);

      // 4. Return DTO with full image URLs
      return this.toDto(savedTheme);
    } catch (error) {
      // Rollback: Delete uploaded files if theme creation fails
      for (const imgUrl of imgUrls) {
        await this.fileStorage.deleteFile(imgUrl).catch(() => {
          // Ignore delete errors
        });
      }
      throw error;
    }
  }

  /**
   * Use Case: Update Theme Images
   */
  async updateThemeImages(
    id: number,
    newImages: Express.Multer.File[],
    removeUrls?: string[]
  ): Promise<any> {
    // 1. Get existing theme
    const theme = await this.themeRepository.findById(id);
    if (!theme) {
      throw new Error('Theme not found');
    }

    // 2. Remove old images if requested
    if (removeUrls && removeUrls.length > 0) {
      for (const url of removeUrls) {
        theme.removeImageUrl(url);
        await this.fileStorage.deleteFile(url);
      }
    }

    // 3. Upload new images
    for (const file of newImages || []) {
      if (!this.isValidImageFile(file)) {
        throw new Error(`Invalid file type: ${file.originalname}`);
      }

      const filePath = await this.fileStorage.saveFile(file, 'themes');
      theme.addImageUrl(filePath);
    }

    // 4. Update in database
    const updated = await this.themeRepository.update(theme);

    return this.toDto(updated);
  }

  /**
   * Use Case: Delete Theme (and its images)
   */
  async deleteTheme(id: number): Promise<void> {
    const theme = await this.themeRepository.findById(id);
    if (!theme) {
      throw new Error('Theme not found');
    }

    // 1. Delete all image files
    const imgUrls = theme.getImgUrls();
    for (const url of imgUrls) {
      await this.fileStorage.deleteFile(url).catch(() => {
        // Ignore errors, log them
        console.warn(`Failed to delete file: ${url}`);
      });
    }

    // 2. Delete from database
    await this.themeRepository.delete(id);
  }

  // Helper methods
  private isValidImageFile(file: Express.Multer.File): boolean {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return allowedMimeTypes.includes(file.mimetype);
  }

  private toDto(theme: Theme): any {
    return {
      id: theme.getId(),
      code: theme.getCode(),
      // ... other fields
      imgUrls: theme.getImgUrls().map(path =>
        this.fileStorage.getFileUrl(path)
      ),
    };
  }
}
```

---

### **4. Controller Layer** - HTTP Endpoints

```typescript
// src/themes/themes.controller.ts
import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ThemeApplicationService } from './application/theme.service';
import { CreateThemeDto } from './dto/create-theme.dto';

@ApiTags('Themes')
@Controller('themes')
export class ThemesController {
  constructor(
    private readonly themeService: ThemeApplicationService
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 files
  @ApiOperation({ summary: 'Create theme with images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        desc: { type: 'string' },
        custId: { type: 'number' },
        createdBy: { type: 'string' },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async create(
    @Body() dto: CreateThemeDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.themeService.createTheme(dto, images);
  }

  @Patch(':id/images')
  @UseInterceptors(FilesInterceptor('newImages', 10))
  @ApiOperation({ summary: 'Update theme images' })
  @ApiConsumes('multipart/form-data')
  async updateImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() newImages: Express.Multer.File[],
    @Body('removeUrls') removeUrls?: string[],
  ) {
    return this.themeService.updateThemeImages(id, newImages, removeUrls);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete theme and its images' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.themeService.deleteTheme(id);
    return { message: 'Theme deleted successfully' };
  }
}
```

---

### **5. DTO Layer**

```typescript
// src/themes/dto/create-theme.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateThemeDto {
  @ApiProperty({
    description: 'Theme code',
    example: 'SPRING-2024',
  })
  @IsString()
  code!: string;

  @ApiProperty({
    description: 'Theme description',
    example: 'Spring collection 2024',
  })
  @IsString()
  desc!: string;

  @ApiProperty({
    description: 'Customer ID',
    example: 1,
  })
  @IsNumber()
  custId!: number;

  @ApiProperty({
    description: 'Created by user',
    example: 'admin',
  })
  @IsString()
  createdBy!: string;

  // Note: images field is handled by @UploadedFiles() decorator
  // Not included in DTO validation
}
```

---

## Luồng Xử Lý (Data Flow)

### **CREATE Theme với Ảnh:**

```
1. Client gửi request
   POST /api/themes
   Content-Type: multipart/form-data
   Body: {
     code: "SPRING-2024",
     desc: "Spring collection",
     custId: 1,
     createdBy: "admin",
     images: [File1, File2, File3]
   }
   ↓

2. Controller nhận request
   - FilesInterceptor parse multipart data
   - Extract files → Express.Multer.File[]
   - Extract body → CreateThemeDto
   ↓

3. Application Service xử lý
   ├─ Validate file type & size
   ├─ Upload files → FileStorageService
   │  ├─ Save File1 → "themes/1234567890-abc123.jpg"
   │  ├─ Save File2 → "themes/1234567891-def456.jpg"
   │  └─ Save File3 → "themes/1234567892-ghi789.jpg"
   ├─ Create Domain Entity với imgUrls
   ├─ Save to Database via Repository
   └─ Return DTO với full URLs
   ↓

4. Database
   themes table:
   {
     id: 1,
     code: "SPRING-2024",
     imgUrls: [
       "themes/1234567890-abc123.jpg",
       "themes/1234567891-def456.jpg",
       "themes/1234567892-ghi789.jpg"
     ]
   }
   ↓

5. Response to Client
   {
     id: 1,
     code: "SPRING-2024",
     imgUrls: [
       "http://localhost:8081/uploads/themes/1234567890-abc123.jpg",
       "http://localhost:8081/uploads/themes/1234567891-def456.jpg",
       "http://localhost:8081/uploads/themes/1234567892-ghi789.jpg"
     ]
   }
```

---

## Module Configuration

```typescript
// src/themes/themes.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ThemesController } from './themes.controller';
import { ThemeApplicationService } from './application/theme.service';
import { ThemeRepository } from './infrastructure/theme.repository';
import { FileStorageService } from '../common/infrastructure/file-storage.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    // Configure Multer for memory storage (we'll save files ourselves)
    MulterModule.register({
      storage: memoryStorage(), // Store in memory, not disk
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 10, // Max 10 files
      },
    }),
  ],
  controllers: [ThemesController],
  providers: [
    ThemeApplicationService,
    {
      provide: 'IThemeRepository',
      useClass: ThemeRepository,
    },
    {
      provide: 'IFileStorageService',
      useClass: FileStorageService,
    },
  ],
})
export class ThemesModule {}
```

---

## Serve Static Files

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(8081);
}
bootstrap();
```

---

## Database Schema (Prisma)

```prisma
// prisma/schema/themes.prisma
model Theme {
  id        Int      @id @default(autoincrement())
  code      String   @unique @db.VarChar(50)
  desc      String?
  custId    Int
  imgUrls   String[] // Array of image paths
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String   @db.VarChar(100)

  customer  Customer @relation(fields: [custId], references: [id])
  colors    ThemeColor[]

  @@index([custId])
}
```

---

## Tóm Tắt Best Practices

### ✅ **DO:**

1. **Domain Entity chỉ lưu URLs** - Không lưu file binary
2. **Infrastructure layer xử lý file** - FileStorageService
3. **Application Service orchestrate** - Upload → Create Entity → Save DB
4. **Validate files** - Type, size, quantity
5. **Rollback on error** - Xóa files nếu DB save fail
6. **Delete files when delete entity** - Cleanup orphan files
7. **Use Multer memory storage** - Control file saving manually
8. **Generate unique filenames** - Avoid conflicts
9. **Serve static files** - Express static middleware

### ❌ **DON'T:**

1. ❌ Lưu file binary vào database
2. ❌ Để Controller xử lý file I/O
3. ❌ Để Domain Entity biết về filesystem
4. ❌ Hard-code file paths
5. ❌ Quên cleanup files khi delete
6. ❌ Quên validate file type/size
7. ❌ Expose absolute file paths to client

---

## Error Handling

```typescript
async createTheme(dto: CreateThemeDto, files: Express.Multer.File[]) {
  const uploadedPaths: string[] = [];

  try {
    // Upload files
    for (const file of files) {
      const path = await this.fileStorage.saveFile(file, 'themes');
      uploadedPaths.push(path);
    }

    // Create theme
    const theme = new Theme({ ...dto, imgUrls: uploadedPaths });
    return await this.repository.save(theme);

  } catch (error) {
    // Rollback: Delete uploaded files
    for (const path of uploadedPaths) {
      await this.fileStorage.deleteFile(path).catch(err =>
        console.error('Failed to delete file:', path, err)
      );
    }
    throw error;
  }
}
```

---

## Testing Example

```typescript
describe('ThemeApplicationService', () => {
  it('should create theme with images', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'images',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('fake image'),
      size: 1024,
    };

    const dto = {
      code: 'TEST-THEME',
      desc: 'Test',
      custId: 1,
      createdBy: 'admin',
    };

    const result = await service.createTheme(dto, [mockFile]);

    expect(result.imgUrls).toHaveLength(1);
    expect(result.imgUrls[0]).toContain('themes/');
  });
});
```

Hy vọng giải thích này giúp bạn hiểu rõ cách xử lý file upload theo Clean Architecture! 🚀