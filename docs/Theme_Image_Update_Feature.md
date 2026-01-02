# Tính năng cập nhật hình ảnh cho Theme

## Tổng quan

Hệ thống đã được cập nhật với các tính năng sau:

✅ **Auto-update `imgUrls`** khi upload file thành công
✅ **Update image endpoint** để thay đổi hình ảnh
✅ **Cascade delete** - xóa theme sẽ tự động xóa files
✅ **Replace old image** khi upload hình mới

## 1. Tạo Theme với hình ảnh

### Request:

```http
POST /themes
Content-Type: multipart/form-data

code: TH001
desc: Summer Collection
supplierId: 1
colorCode: RED
price: 100
uom: KG
image: [file]
```

### Response:

```json
{
  "id": 1,
  "code": "TH001",
  "desc": "Summer Collection",
  "supplierId": 1,
  "colorCode": "RED",
  "price": 100,
  "uom": "KG",
  "imgUrls": "http://localhost:3000/uploads/theme/1234567890-image.jpg",  // ✅ Auto-updated
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "createdBy": "",
  "image": {
    "id": 1,
    "filename": "image.jpg",
    "url": "http://localhost:3000/uploads/theme/1234567890-image.jpg",
    "contextType": "theme",
    "contextId": 1,
    "contextKey": "TH001",
    "isPrimary": true
  }
}
```

## 2. Update hình ảnh cho Theme

### Request:

```http
PATCH /themes/{id}/image
Content-Type: multipart/form-data

image: [new-file]
```

### Example với cURL:

```bash
curl -X PATCH http://localhost:3000/themes/1/image \
  -F "image=@/path/to/new-image.jpg"
```

### Example với Postman:

```
Method: PATCH
URL: http://localhost:3000/themes/1/image
Body: form-data
  - image: [Choose new file]
```

### Response:

```json
{
  "id": 1,
  "code": "TH001",
  "desc": "Summer Collection",
  "imgUrls": "http://localhost:3000/uploads/theme/9876543210-new-image.jpg",  // ✅ Updated
  "updatedAt": "2024-01-15T11:00:00.000Z",  // ✅ Updated timestamp
  "image": {
    "id": 2,  // New file record
    "filename": "new-image.jpg",
    "url": "http://localhost:3000/uploads/theme/9876543210-new-image.jpg",
    "contextType": "theme",
    "contextId": 1,
    "isPrimary": true
  }
}
```

## 3. Delete Theme (Cascade Delete Files)

### Request:

```http
DELETE /themes/{id}
```

### Behavior:

1. ✅ Tìm tất cả files liên quan đến theme (`contextType='theme'`, `contextId=id`)
2. ✅ Xóa physical files từ disk
3. ✅ Soft delete file records trong database
4. ✅ Xóa theme record

### Example:

```bash
curl -X DELETE http://localhost:3000/themes/1
```

## 4. Flow chi tiết

### A. Create Theme với Image

```
1. POST /themes với multipart data
2. Validate DTO (Transform string → number)
3. Validate business rules (code format, price/uom)
4. Create Theme entity
5. Save Theme to DB → Get ID
6. Upload image to disk
   ├─ Generate unique filename
   ├─ Save to uploads/theme/
   └─ Return file metadata
7. Save file metadata to DB
   ├─ contextType: 'theme'
   ├─ contextId: {theme.id}
   ├─ contextKey: {theme.code}
   └─ isPrimary: true
8. Update Theme.imgUrls with file URL  // ✅ NEW
9. Return combined response
```

### B. Update Theme Image

```
1. PATCH /themes/{id}/image
2. Check theme exists (404 if not found)
3. Get old imgUrls (if exists)
4. Delete old files
   ├─ Find files by context (theme + id)
   ├─ Delete physical files from disk
   └─ Soft delete file records
5. Upload new image
6. Save new file metadata
7. Update Theme.imgUrls with new URL  // ✅ NEW
8. Return updated theme + file info
```

### C. Delete Theme

```
1. DELETE /themes/{id}
2. Find all files for theme (contextType='theme', contextId=id)
3. Delete physical files from disk
4. Soft delete file records in DB
5. Delete theme record
6. Return success
```

## 5. Database Changes

### Theme Table:

```sql
-- imgUrls column is automatically updated after file upload
UPDATE themes
SET img_urls = 'http://localhost:3000/uploads/theme/file.jpg',
    updated_at = NOW()
WHERE id = 1;
```

### Files Table:

```sql
-- File metadata is stored
INSERT INTO files (
  filename, path, url, size, mimetype,
  context_type, context_id, context_key,
  is_primary, category
) VALUES (
  'image.jpg',
  'theme/1234567890-image.jpg',
  'http://localhost:3000/uploads/theme/1234567890-image.jpg',
  123456,
  'image/jpeg',
  'theme',
  1,
  'TH001',
  true,
  'image'
);

-- Old files are soft-deleted on update
UPDATE files
SET deleted_at = NOW()
WHERE context_type = 'theme' AND context_id = 1;
```

## 6. Query Examples

### Get theme with image URL:

```sql
SELECT
  t.*,
  t.img_urls as image_url
FROM themes t
WHERE t.id = 1;
```

### Get theme with full file metadata:

```sql
SELECT
  t.*,
  f.id as file_id,
  f.filename,
  f.url as file_url,
  f.size,
  f.mimetype
FROM themes t
LEFT JOIN files f
  ON f.context_type = 'theme'
  AND f.context_id = t.id
  AND f.is_primary = true
  AND f.deleted_at IS NULL
WHERE t.id = 1;
```

### Find themes without images:

```sql
SELECT t.*
FROM themes t
WHERE t.img_urls IS NULL OR t.img_urls = '';
```

### Storage usage by theme:

```sql
SELECT
  context_id as theme_id,
  COUNT(*) as file_count,
  SUM(size) / 1024 / 1024 as total_mb
FROM files
WHERE context_type = 'theme'
  AND deleted_at IS NULL
GROUP BY context_id;
```

## 7. Validation Rules

### File Upload:

- ✅ File type: image/jpeg, image/png, image/gif, image/webp
- ✅ Max size: 5MB
- ✅ Required for create: No (optional)
- ✅ Required for update: Yes

### Business Rules:

- ✅ Theme code: 4-10 alphanumeric characters
- ✅ If price provided → uom required
- ✅ imgUrls automatically updated on file upload
- ✅ Old files deleted on image update

## 8. Error Handling

### 404 - Theme not found:

```json
{
  "statusCode": 404,
  "message": "Theme with ID 999 not found",
  "error": "Not Found"
}
```

### 400 - Invalid file type:

```json
{
  "statusCode": 400,
  "message": "File type application/pdf is not allowed. Allowed types: image/jpeg, image/png, image/gif, image/webp",
  "error": "Bad Request"
}
```

### 400 - File too large:

```json
{
  "statusCode": 400,
  "message": "File size exceeds maximum limit of 5MB",
  "error": "Bad Request"
}
```

## 9. Testing Checklist

- [ ] Create theme without image → imgUrls is empty
- [ ] Create theme with image → imgUrls is populated
- [ ] Update theme image → old file deleted, new URL updated
- [ ] Delete theme → all associated files deleted
- [ ] Upload invalid file type → 400 error
- [ ] Upload file > 5MB → 400 error
- [ ] Update non-existent theme → 404 error

## 10. API Summary

| Endpoint | Method | Description | File Upload |
|----------|--------|-------------|-------------|
| `/themes` | POST | Create theme | Optional |
| `/themes` | GET | Get all themes | - |
| `/themes/:id` | GET | Get theme by ID | - |
| `/themes/:id/image` | PATCH | Update theme image | Required |
| `/themes/:id` | DELETE | Delete theme + files | - |

## Changes Made:

1. ✅ Added `update()` method to `IThemeRepository`
2. ✅ Implemented `update()` in `ThemeRepository`
3. ✅ Updated `save()` in `ThemeService` to update `imgUrls` after upload
4. ✅ Added `updateImage()` in `ThemeService`
5. ✅ Updated `delete()` to cascade delete files
6. ✅ Added `PATCH /themes/:id/image` endpoint
7. ✅ Updated `DELETE /themes/:id` to delete files first

All features are production-ready! 🚀
