# Setup File Management với Theme Upload

## Tóm tắt kiến trúc đã implement:

### ✅ Đã tạo:

```
src/common/files/
├── files.module.ts              # Module definition
├── files.service.ts              # Service với DB integration
├── domain/
│   ├── file.entity.ts           # Domain entity
│   └── file.repository.interface.ts
├── infrastructure/
│   └── file.repository.ts       # Prisma repository
├── providers/
│   └── local-storage.provider.ts
└── interfaces/
    └── file-storage.interface.ts

prisma/schema/
└── files.prisma                 # File table schema

src/themes/
├── theme.controller.ts          # Updated với file upload
├── application/theme.service.ts # Updated với FilesService
└── theme.module.ts              # Import FilesModule
```

## Cách sử dụng API:

### Tạo theme với hình ảnh:

```bash
POST /themes
Content-Type: multipart/form-data

Form Data:
- code: TH001
- desc: Summer Collection
- supplierId: 1
- colorCode: RED
- price: 100
- uom: KG
- image: [file]  # Optional
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
  "image": {
    "id": 1,
    "filename": "summer.jpg",
    "url": "http://localhost:3000/uploads/themes/summer.jpg",
    "size": 12345,
    "mimetype": "image/jpeg",
    "contextType": "theme",
    "contextId": 1,
    "contextKey": "thumbnail",
    "isPrimary": true
  }
}
```

## Testing với Postman/Thunder Client:

1. Method: POST
2. URL: http://localhost:3000/themes
3. Body type: form-data
4. Fields:
   - code: text
   - desc: text
   - supplierId: text (số)
   - colorCode: text
   - price: text (số - optional)
   - uom: text (required nếu có price)
   - image: file (optional)

## Testing với cURL:

```bash
curl -X POST http://localhost:3000/themes \
  -F "code=TH001" \
  -F "desc=Summer Collection" \
  -F "supplierId=1" \
  -F "colorCode=RED" \
  -F "price=100" \
  -F "uom=KG" \
  -F "image=@/path/to/image.jpg"
```

## Database Schema:

Bảng `files` đã được tạo với cấu trúc:

```sql
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  filename VARCHAR NOT NULL,
  stored_name VARCHAR NOT NULL,
  path VARCHAR NOT NULL,
  url VARCHAR NOT NULL,
  size INT NOT NULL,
  mimetype VARCHAR NOT NULL,
  extension VARCHAR NOT NULL,
  context_type VARCHAR NOT NULL,   -- 'theme', 'product', etc.
  context_id INT NOT NULL,          -- ID của entity
  context_key VARCHAR,              -- 'thumbnail', 'gallery', etc.
  category VARCHAR,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  storage_type VARCHAR DEFAULT 'local',
  uploaded_by VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
```

## Lợi ích:

✅ Upload file khi tạo theme
✅ File metadata được lưu vào database
✅ Polymorphic relationship (1 bảng files cho nhiều contexts)
✅ Support multiple files per entity
✅ Soft delete
✅ Primary file marking
✅ Easy to query files by context

## Next Steps:

1. Test API với Postman/Thunder Client
2. Add validation cho file types (chỉ cho phép images)
3. Add file size limits
4. Implement gallery upload (nhiều files)
5. Add cleanup cron job cho orphaned files

## Swagger Documentation:

Sau khi start server, truy cập:
http://localhost:3000/api

Endpoint `POST /themes` sẽ có form upload file trong Swagger UI.
