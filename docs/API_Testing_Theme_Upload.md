# API Testing - Theme Upload với File

## Vấn đề đã fix:

✅ **Transform string → number** trong multipart/form-data
- `supplierId`: string → number
- `price`: string → number

## 1. Test với Postman/Thunder Client

### Request Setup:

```
Method: POST
URL: http://localhost:3000/themes
Headers: (auto-set by form-data)
```

### Body (form-data):

| Key | Type | Value | Required |
|-----|------|-------|----------|
| code | Text | TH001 | ✅ Yes |
| desc | Text | Summer Collection | ✅ Yes |
| supplierId | Text | 1 | ✅ Yes |
| colorCode | Text | RED | ✅ Yes |
| price | Text | 100 | ❌ No |
| uom | Text | KG | ⚠️ Yes if price provided |
| image | File | [Select file] | ❌ No |

**Chú ý:** Tất cả fields đều là **Text**, không phải Number!

### Ví dụ Request:

#### Case 1: Theme với image

```
code: TH001
desc: Summer Collection 2024
supplierId: 1
colorCode: RED
price: 150
uom: KG
image: summer-theme.jpg
```

#### Case 2: Theme không có price

```
code: TH002
desc: Winter Collection
supplierId: 2
colorCode: BLUE
image: winter-theme.jpg
```

#### Case 3: Theme không có image

```
code: TH003
desc: Spring Collection
supplierId: 1
colorCode: GREEN
price: 200
uom: PCS
```

### Expected Response:

```json
{
  "id": 1,
  "code": "TH001",
  "desc": "Summer Collection 2024",
  "supplierId": 1,
  "colorCode": "RED",
  "price": 150,
  "uom": "KG",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "createdBy": "",
  "imgUrls": "",
  "image": {
    "id": 1,
    "filename": "summer-theme.jpg",
    "storedName": "summer-theme.jpg",
    "path": "theme/1234567890-summer-theme.jpg",
    "url": "http://localhost:3000/uploads/theme/1234567890-summer-theme.jpg",
    "size": 245678,
    "mimetype": "image/jpeg",
    "extension": ".jpg",
    "contextType": "theme",
    "contextId": 1,
    "contextKey": "thumbnail",
    "category": "image",
    "displayOrder": 0,
    "isPrimary": true,
    "storageType": "local",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## 2. Test với cURL

### With image:

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

### Without image:

```bash
curl -X POST http://localhost:3000/themes \
  -F "code=TH002" \
  -F "desc=Winter Collection" \
  -F "supplierId=2" \
  -F "colorCode=BLUE"
```

## 3. Test với Swagger UI

1. Start server: `npm run start:dev`
2. Open: http://localhost:3000/api
3. Tìm endpoint: `POST /themes`
4. Click **"Try it out"**
5. Fill form:
   - code: TH001
   - desc: Summer Collection
   - supplierId: 1
   - colorCode: RED
   - price: 100
   - uom: KG
   - image: [Choose File]
6. Click **"Execute"**

## 4. Validation Tests

### ✅ Valid Cases:

```bash
# Theme with price and uom
POST { code: "TH001", ..., price: 100, uom: "KG" }

# Theme without price and uom
POST { code: "TH002", ..., (no price, no uom) }

# Theme with image
POST { code: "TH003", ..., image: file }
```

### ❌ Invalid Cases:

```bash
# Price without UOM → Error
POST { code: "TH001", ..., price: 100 }
Response: 400 "UOM is required when price is provided"

# Invalid code (too short)
POST { code: "TH", ... }
Response: 400 "Invalid theme code: TH. Code must be alphanumeric and 4-10 characters."

# Invalid code (special characters)
POST { code: "TH-001", ... }
Response: 400 "Invalid theme code: TH-001. Code must be alphanumeric and 4-10 characters."

# Empty UOM
POST { code: "TH001", ..., price: 100, uom: "   " }
Response: 400 "UOM is required when price is provided"
```

## 5. File Upload Validation

### Allowed Types:
- ✅ image/jpeg
- ✅ image/png
- ✅ image/gif
- ✅ image/webp

### File Size Limit:
- ⚠️ Max 5MB per image

### Test Invalid File:

```bash
# PDF file → Error
curl -X POST http://localhost:3000/themes \
  -F "code=TH001" \
  -F "image=@document.pdf"

Response: 400 "File type application/pdf is not allowed"
```

## 6. Check Uploaded Files

### Database:
```sql
-- Check theme
SELECT * FROM themes WHERE code = 'TH001';

-- Check uploaded files
SELECT * FROM files WHERE context_type = 'theme' AND context_id = 1;
```

### File System:
```bash
# Windows
dir uploads\theme

# Linux/Mac
ls -la uploads/theme
```

## 7. Common Issues

### Issue 1: "supplierId must be a number"
**Cause:** Gửi supplierId dưới dạng number trong JSON body
**Fix:** Dùng form-data và gửi tất cả fields dưới dạng **Text**

### Issue 2: File không được upload
**Cause:** Thiếu folder `uploads/`
**Fix:** Tạo folder thủ công hoặc để app tự tạo

### Issue 3: "UOM is required"
**Cause:** Có price nhưng không có uom
**Fix:** Thêm uom hoặc bỏ price

## 8. Environment Variables

Thêm vào `.env`:

```env
UPLOAD_PATH=./uploads
BASE_URL=http://localhost:3000
```

## Summary

✅ Tất cả fields trong form-data đều là **Text** (kể cả numbers)
✅ `@Transform` decorator tự động convert string → number
✅ File upload là optional
✅ Business rules được enforce ở domain layer
✅ Files metadata được lưu vào database
