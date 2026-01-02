# File Authentication & Authorization

## Overview

Hệ thống file management đã được tích hợp với authentication và authorization để bảo vệ files khỏi truy cập trái phép.

## Architecture

```
Client Request
    ↓
JWT Authentication (JwtAuthGuard)
    ↓
File Access Authorization (FileAccessGuard)
    ↓
FilesController
    ↓
FilesService
    ↓
Return File
```

## Guards

### 1. JwtAuthGuard

Kiểm tra JWT token trong request header:

```typescript
Authorization: Bearer <jwt_token>
```

- ✅ Token hợp lệ → cho phép truy cập
- ❌ Token không hợp lệ/missing → 401 Unauthorized

### 2. FileAccessGuard

Kiểm tra quyền truy cập file dựa trên:
- **contextType** (theme, product, user, public)
- **contextId** (ID của entity)
- **User role** (admin, user)
- **Ownership** (user có quyền với file này không?)

## Access Rules

### Admin Role

```typescript
user.role === 'admin'
```

- ✅ Truy cập **TẤT CẢ** files
- Không cần kiểm tra ownership

### Public Files

```typescript
contextType === 'public'
```

- ✅ Mọi authenticated user đều truy cập được
- Ví dụ: logo, banner, marketing materials

### Theme Files

```typescript
contextType === 'theme'
```

- ✅ Admin: truy cập tất cả
- ✅ Authenticated users: truy cập tất cả (tạm thời)
- 🔄 TODO: Kiểm tra theme.createdBy === user.id

### User Files

```typescript
contextType === 'user'
```

- ✅ Admin: truy cập tất cả
- ✅ Owner: chỉ truy cập files của chính mình
- ❌ User khác: không truy cập được

```typescript
fileData.contextId === user.id
```

### Product Files

```typescript
contextType === 'product'
```

- ✅ Admin: truy cập tất cả
- ✅ Authenticated users: truy cập tất cả (tạm thời)
- 🔄 TODO: Kiểm tra product ownership/permissions

## API Usage

### 1. Download File (Authenticated)

```bash
GET /files/theme/12345-image.jpg/download
Authorization: Bearer <jwt_token>
```

**Response:**
- 200: File downloaded
- 401: Unauthorized (no/invalid token)
- 403: Forbidden (no permission)
- 404: File not found

### 2. View File (Authenticated)

```bash
GET /files/theme/12345-image.jpg/view
Authorization: Bearer <jwt_token>
```

**Response:**
- 200: File displayed inline
- 401: Unauthorized
- 403: Forbidden
- 404: File not found

### 3. Get File Info (Authenticated)

```bash
GET /files/theme/12345-image.jpg/info
Authorization: Bearer <jwt_token>
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

## Frontend Integration

### With Axios

```typescript
import axios from 'axios';

// Setup axios với JWT token
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
  }
});

// Download file
const downloadFile = async (filePath: string) => {
  try {
    const response = await api.get(`/files/${filePath}/download`, {
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (error.response.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.response.status === 403) {
      alert('You do not have permission to access this file');
    }
  }
};
```

### Display Image with Auth

```typescript
// React component
import { useState, useEffect } from 'react';

function AuthenticatedImage({ filePath }: { filePath: string }) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const token = localStorage.getItem('jwt_token');

  useEffect(() => {
    const fetchImage = async () => {
      const response = await fetch(`http://localhost:3000/files/${filePath}/view`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      }
    };

    fetchImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [filePath, token]);

  return <img src={imageUrl} alt="Authenticated Image" />;
}
```

## Customizing Access Rules

### Add Custom Permission Check

Edit [file-access.guard.ts](../src/common/files/guards/file-access.guard.ts):

```typescript
private async checkThemeAccess(user: any, themeId: number): Promise<boolean> {
  // Get theme from database
  const theme = await this.themeRepository.findById(themeId);

  if (!theme) {
    return false;
  }

  // Check ownership
  if (theme.createdBy === user.id) {
    return true;
  }

  // Check department
  if (theme.departmentId === user.departmentId) {
    return true;
  }

  // Check company
  if (theme.companyId === user.companyId) {
    return true;
  }

  return false;
}
```

### Add New Context Type

```typescript
switch (contextType) {
  case 'theme':
    return await this.checkThemeAccess(user, fileData.contextId);

  case 'user':
    return fileData.contextId === user.id;

  case 'product':
    return await this.checkProductAccess(user, fileData.contextId);

  // ✅ Add new context type
  case 'invoice':
    return await this.checkInvoiceAccess(user, fileData.contextId);

  default:
    return false;
}
```

## Public Files (No Auth Required)

Nếu cần serve public files không cần authentication, tạo endpoint riêng:

```typescript
// files.controller.ts
@Controller('public-files')
@ApiTags('public-files')
export class PublicFilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':filePath(*)')
  async getPublicFile(
    @Param('filePath') filePath: string,
    @Res() res: Response
  ) {
    // Only allow files in 'public' context
    if (!filePath.startsWith('public/')) {
      throw new ForbiddenException('Access denied');
    }

    // ... serve file
  }
}
```

## Security Best Practices

### 1. Path Traversal Protection

✅ FileAccessGuard kiểm tra file path trong database
```typescript
const file = await this.filesService.getFileByPath(filePath);
if (!file) {
  return false; // File không tồn tại trong DB
}
```

### 2. Role-Based Access

✅ Admin có full access:
```typescript
if (user.role === 'admin') {
  return true;
}
```

### 3. Ownership Verification

✅ Kiểm tra user ownership:
```typescript
case 'user':
  return fileData.contextId === user.id;
```

### 4. Database Validation

✅ Chỉ serve files tồn tại trong database:
- Tránh direct file system access
- Kiểm tra deletedAt = null
- Validate contextType và contextId

### 5. JWT Token Validation

✅ JwtAuthGuard validates:
- Token signature
- Token expiration
- User existence

## Testing

### Test with cURL

```bash
# 1. Login to get token
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.access_token')

# 2. Download file with token
curl -X GET http://localhost:3000/files/theme/12345-image.jpg/download \
  -H "Authorization: Bearer $TOKEN" \
  -o downloaded-image.jpg

# 3. Try without token (should fail with 401)
curl -X GET http://localhost:3000/files/theme/12345-image.jpg/download

# 4. Try with invalid token (should fail with 401)
curl -X GET http://localhost:3000/files/theme/12345-image.jpg/download \
  -H "Authorization: Bearer invalid_token"
```

### Test with Postman

1. **Login:**
   - POST `/auth/login`
   - Body: `{"email":"admin@example.com","password":"password"}`
   - Copy `access_token` from response

2. **Setup Authorization:**
   - Go to Authorization tab
   - Type: Bearer Token
   - Token: `<paste access_token>`

3. **Download File:**
   - GET `/files/theme/12345-image.jpg/download`
   - Should return 200 with file

4. **Test Forbidden:**
   - Login as regular user
   - Try to access another user's file
   - GET `/files/user/999-document.pdf/view`
   - Should return 403 Forbidden

## Error Responses

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causes:**
- Missing JWT token
- Invalid JWT token
- Expired JWT token

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "You do not have permission to access this file"
}
```

**Causes:**
- User không có quyền với file này
- File không thuộc contextId của user
- User role không đủ quyền

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "File not found: theme/12345-image.jpg"
}
```

**Causes:**
- File không tồn tại trong file system
- File không tồn tại trong database
- File đã bị soft delete

## Implementation Files

- [file-access.guard.ts](../src/common/files/guards/file-access.guard.ts) - Authorization logic
- [files.controller.ts](../src/common/files/files.controller.ts) - Protected endpoints
- [files.service.ts](../src/common/files/files.service.ts) - File operations
- [jwt-auth.guard.ts](../src/auth/guards/jwt-auth.guard.ts) - JWT authentication

## Next Steps

🔄 **TODO - Implement detailed permission checks:**

1. **Theme Access:**
   - Check theme.createdBy === user.id
   - Check user.departmentId === theme.departmentId
   - Check user.companyId === theme.companyId

2. **Product Access:**
   - Check product ownership
   - Check product visibility (public, private, draft)
   - Check user permissions

3. **Invoice Access:**
   - Check invoice.customerId === user.customerId
   - Check invoice.supplierId === user.supplierId
   - Check accounting team permissions

4. **Document Access:**
   - Check document sharing settings
   - Check folder permissions
   - Check team access

---

✅ **All file endpoints are now protected with JWT authentication and role-based authorization!**
