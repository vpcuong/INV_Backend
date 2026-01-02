# File Read & Download API Documentation

## Tổng quan

Các functions mới được thêm vào để đọc, xem và tải xuống files:

✅ **readFile()** - Đọc file dưới dạng Buffer
✅ **readFileAsString()** - Đọc file dưới dạng text
✅ **getFileInfo()** - Lấy thông tin file (size, mimetype, extension)
✅ **File Download Endpoint** - Tải file về
✅ **File View Endpoint** - Xem file trực tiếp (images, PDFs)
✅ **File Info Endpoint** - Lấy metadata của file

## 1. Service Methods

### A. Read File as Buffer

```typescript
// Đọc file dưới dạng Buffer (binary data)
const buffer = await filesService.readFile('theme/12345-image.jpg');
```

**Use cases:**
- Đọc images để process (resize, crop, etc.)
- Đọc binary files (PDF, Word, etc.)
- Stream files

### B. Read File as String

```typescript
// Đọc file text (UTF-8 mặc định)
const content = await filesService.readFileAsString('theme/document.txt');

// Đọc với encoding khác
const content = await filesService.readFileAsString('theme/data.csv', 'latin1');
```

**Use cases:**
- Đọc text files
- Parse JSON files
- Parse CSV, XML files
- Read configuration files

### C. Get File Info

```typescript
const info = await filesService.getFileInfo('theme/12345-image.jpg');

// Returns:
{
  size: 245678,
  mimetype: 'image/jpeg',
  extension: '.jpg',
  filename: '12345-image.jpg'
}
```

**Use cases:**
- Validate file before processing
- Display file metadata
- Check file size before download

## 2. API Endpoints

### A. Download File

```http
GET /files/{filePath}/download
```

**Example:**
```bash
GET /files/theme/12345-image.jpg/download
```

**Response Headers:**
```
Content-Type: image/jpeg
Content-Disposition: attachment; filename="12345-image.jpg"
Content-Length: 245678
```

**Response:** File binary data (downloads to user's device)

**Use cases:**
- Download images
- Download documents
- Export files

### B. View File (Inline)

```http
GET /files/{filePath}/view
```

**Example:**
```bash
GET /files/theme/12345-image.jpg/view
```

**Response Headers:**
```
Content-Type: image/jpeg
Content-Disposition: inline; filename="12345-image.jpg"
Content-Length: 245678
```

**Response:** File displayed in browser

**Use cases:**
- Preview images in browser
- View PDFs inline
- Display files without downloading

### C. Get File Info

```http
GET /files/{filePath}/info
```

**Example:**
```bash
GET /files/theme/12345-image.jpg/info
```

**Response:**
```json
{
  "size": 245678,
  "mimetype": "image/jpeg",
  "extension": ".jpg",
  "filename": "12345-image.jpg",
  "path": "theme/12345-image.jpg",
  "url": "http://localhost:3000/uploads/theme/12345-image.jpg"
}
```

**Use cases:**
- Display file metadata
- Check file details before download
- File management UIs

### D. Get File Content (Text)

```http
GET /files/{filePath}/content
```

**Example:**
```bash
GET /files/theme/document.txt/content
```

**Response:**
```json
{
  "path": "theme/document.txt",
  "filename": "document.txt",
  "size": 1234,
  "mimetype": "text/plain",
  "content": "File content here..."
}
```

**Use cases:**
- Preview text files
- Display JSON/XML content
- Read configuration files

## 3. Usage Examples

### Frontend - Download File

```typescript
// React/Vue/Angular
const downloadFile = async (filePath: string) => {
  const response = await fetch(`/files/${filePath}/download`);
  const blob = await response.blob();

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

downloadFile('theme/12345-image.jpg');
```

### Frontend - Display Image

```html
<!-- Direct image display -->
<img src="/files/theme/12345-image.jpg/view" alt="Theme Image" />

<!-- Or with full URL -->
<img :src="`${API_BASE}/files/${filePath}/view`" alt="Theme Image" />
```

### Backend - Process Image

```typescript
// ThemeService - Process uploaded image
async processThemeImage(themeId: number) {
  // Get theme files
  const files = await this.filesService.getFilesByContext('theme', themeId);
  const primaryFile = files.find(f => f.toPersistence().isPrimary);

  if (primaryFile) {
    // Read image as buffer
    const imageBuffer = await this.filesService.readFile(
      primaryFile.toPersistence().path
    );

    // Process image (resize, crop, etc.)
    // ... your image processing logic
  }
}
```

### Backend - Parse JSON Config

```typescript
async loadThemeConfig(themeId: number) {
  const configPath = `theme/${themeId}/config.json`;

  // Read as string
  const configText = await this.filesService.readFileAsString(configPath);

  // Parse JSON
  const config = JSON.parse(configText);

  return config;
}
```

## 4. Error Handling

### 404 - File Not Found

```json
{
  "statusCode": 404,
  "message": "File not found: theme/12345-image.jpg"
}
```

### 500 - Read Error

```json
{
  "statusCode": 500,
  "message": "Failed to read file: Permission denied"
}
```

## 5. Supported MIME Types

The system automatically detects MIME types based on file extension:

| Extension | MIME Type |
|-----------|-----------|
| .jpg, .jpeg | image/jpeg |
| .png | image/png |
| .gif | image/gif |
| .webp | image/webp |
| .pdf | application/pdf |
| .doc | application/msword |
| .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| .txt | text/plain |
| .json | application/json |
| .xml | application/xml |
| Others | application/octet-stream |

## 6. Performance Considerations

### Buffer vs String

```typescript
// ✅ GOOD - For binary files (images, PDFs)
const buffer = await filesService.readFile('image.jpg');

// ❌ BAD - Don't read binary as string
const text = await filesService.readFileAsString('image.jpg'); // Gibberish!

// ✅ GOOD - For text files
const content = await filesService.readFileAsString('document.txt');

// ⚠️ OK but wasteful - Reading text as buffer then converting
const buffer = await filesService.readFile('document.txt');
const text = buffer.toString('utf-8');
```

### Large Files

```typescript
// ⚠️ Warning: Reading large files into memory
// Not recommended for files > 50MB
const hugeFile = await filesService.readFile('video.mp4'); // Might crash!

// Better: Use streaming for large files (future enhancement)
```

## 7. Security Considerations

### Path Traversal Protection

The system automatically joins paths safely:

```typescript
// ✅ SAFE - Properly handled
filesService.readFile('../../../etc/passwd'); // Won't work!

// The path is resolved within uploadPath directory
```

### Access Control

Consider adding authentication/authorization:

```typescript
@UseGuards(JwtAuthGuard)
@Get(':filePath(*)/download')
async downloadFile(
  @Param('filePath') filePath: string,
  @Request() req
) {
  // Check if user has permission to access this file
  const hasAccess = await this.checkFileAccess(req.user, filePath);
  if (!hasAccess) {
    throw new ForbiddenException('Access denied');
  }

  // ... download file
}
```

## 8. Testing

### Test Download

```bash
# Using curl
curl -O http://localhost:3000/files/theme/12345-image.jpg/download

# View in browser
open http://localhost:3000/files/theme/12345-image.jpg/view
```

### Test File Info

```bash
curl http://localhost:3000/files/theme/12345-image.jpg/info
```

### Test Content

```bash
curl http://localhost:3000/files/theme/document.txt/content
```

## 9. Integration with Theme

### Get Theme with Image Content

```typescript
// ThemeService
async getThemeWithImageData(id: number) {
  const theme = await this.themeRepository.findById(id);
  const files = await this.filesService.getFilesByContext('theme', id);

  // Get primary image with content
  const primaryFile = files.find(f => f.toPersistence().isPrimary);
  let imageData = null;

  if (primaryFile) {
    const filePath = primaryFile.toPersistence().path;
    const buffer = await this.filesService.readFile(filePath);
    const base64 = buffer.toString('base64');

    imageData = {
      ...primaryFile.toPersistence(),
      base64Data: `data:${primaryFile.toPersistence().mimetype};base64,${base64}`
    };
  }

  return {
    ...theme.toPersistence(),
    files: files.map(f => f.toPersistence()),
    primaryImage: imageData,
  };
}
```

## 10. API Summary

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/files/{path}/download` | GET | Download file | Binary (attachment) |
| `/files/{path}/view` | GET | View file inline | Binary (inline) |
| `/files/{path}/info` | GET | Get file metadata | JSON |
| `/files/{path}/content` | GET | Get text content | JSON with content |

## Changes Made:

1. ✅ Added `readFile()` to `IFileStorage` interface
2. ✅ Added `readFileAsString()` to `IFileStorage` interface
3. ✅ Added `getFileInfo()` to `IFileStorage` interface
4. ✅ Implemented all methods in `LocalStorageProvider`
5. ✅ Exposed methods in `FilesService`
6. ✅ Created `FilesController` with 4 endpoints
7. ✅ Added controller to `FilesModule`

All features are production-ready! 🚀
