# JWT Authentication Guide

## Overview
This application uses JWT (JSON Web Token) for authentication and authorization.

## Authentication Endpoints

### 1. Register a New User
**POST** `/api/auth/register`

```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci..."
}
```

### 2. Login
**POST** `/api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci..."
}
```

### 3. Refresh Token
**POST** `/api/auth/refresh`

```json
{
  "refresh_token": "eyJhbGci..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci..."
}
```

### 4. Get Current User Profile
**GET** `/api/auth/profile`

**Headers:**
```
Authorization: Bearer eyJhbGci...
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "isActive": true
}
```

## Protecting Routes

### Using JWT Guard

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Get()
findAll() {
  return this.itemsService.findAll();
}
```

### Getting Current User

```typescript
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Get('my-items')
getMyItems(@CurrentUser() user: any) {
  return this.itemsService.findByUser(user.id);
}
```

### Role-Based Access Control

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
remove(@Param('id') id: number) {
  return this.itemsService.remove(id);
}
```

## User Roles

- `user` - Default role for new users
- `admin` - Administrator with full access
- `manager` - Manager with limited admin access

## Token Expiration

- **Access Token**: 1 hour (configurable in `.env`)
- **Refresh Token**: 7 days (configurable in `.env`)

## Environment Variables

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-67890
JWT_REFRESH_EXPIRATION=7d
```

## Security Best Practices

1. **Always use HTTPS** in production
2. **Change JWT secrets** to strong, random values in production
3. **Store tokens securely** on the client side
4. **Implement token refresh** logic before access token expires
5. **Validate user permissions** on sensitive operations
6. **Use httpOnly cookies** for web applications (optional enhancement)

## Example Usage with Postman/Thunder Client

1. **Register or Login** to get tokens
2. **Copy the access_token** from the response
3. **Add Authorization header** to subsequent requests:
   ```
   Authorization: Bearer <your_access_token>
   ```
4. **When access token expires**, use refresh token endpoint to get new tokens

## Example: Full Authentication Flow

```typescript
// 1. Register
POST /api/auth/register
Body: { "email": "admin@example.com", "password": "admin123", "name": "Admin" }

// 2. Save the tokens from response

// 3. Access protected route
GET /api/items
Headers: { "Authorization": "Bearer <access_token>" }

// 4. When token expires (after 1 hour)
POST /api/auth/refresh
Body: { "refresh_token": "<refresh_token>" }

// 5. Use new access_token for subsequent requests
```
