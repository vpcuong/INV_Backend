# Supplier API Documentation

## Base URL
```
http://localhost:3000/api/suppliers
```

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/suppliers` | Lấy danh sách tất cả suppliers |
| GET | `/suppliers/:id` | Lấy thông tin chi tiết một supplier |
| POST | `/suppliers` | Tạo supplier mới |
| PATCH | `/suppliers/:id` | Cập nhật thông tin supplier |
| DELETE | `/suppliers/:id` | Xóa supplier |
| PATCH | `/suppliers/:id/activate` | Kích hoạt supplier |
| PATCH | `/suppliers/:id/deactivate` | Vô hiệu hóa supplier |

---

## 1. Lấy danh sách tất cả Suppliers

### `GET /api/suppliers`

Lấy danh sách tất cả suppliers, được sắp xếp theo `sortOrder` và `code`.

**Request:**
```http
GET /api/suppliers HTTP/1.1
Host: localhost:3000
```

**Response Success (200 OK):**
```json
[
  {
    "id": 1,
    "code": "SUP001",
    "name": "ABC Textiles Co.",
    "phone": "+84123456789",
    "email": "contact@abctextiles.com",
    "website": "https://abctextiles.com",
    "address": "123 Main Street",
    "city": "Ho Chi Minh City",
    "province": "Ho Chi Minh",
    "country": "Vietnam",
    "postalCode": "700000",
    "taxId": "0123456789",
    "contactPerson": "John Doe",
    "paymentTerms": "NET30",
    "status": "Active",
    "category": "Fabric",
    "rating": 4.5,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "createdBy": "admin",
    "sortOrder": 0,
    "items": [
      {
        "id": 1,
        "itemId": 10,
        "supplierId": 1,
        "code": "FAB-001-SUP",
        "fromUOMId": 1,
        "toUOMId": 2,
        "conversionQty": 100,
        "isDefault": true,
        "isActive": true,
        "sortOrder": 0
      }
    ]
  }
]
```

**Use Case Frontend:**
- Hiển thị danh sách suppliers trong bảng/table
- Dropdown/Select để chọn supplier
- Filter/Search suppliers

---

## 2. Lấy thông tin chi tiết Supplier

### `GET /api/suppliers/:id`

Lấy thông tin chi tiết một supplier bao gồm cả items liên quan với thông tin UOM conversion.

**Parameters:**
- `id` (path parameter): ID của supplier (integer)

**Request:**
```http
GET /api/suppliers/1 HTTP/1.1
Host: localhost:3000
```

**Response Success (200 OK):**
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Textiles Co.",
  "phone": "+84123456789",
  "email": "contact@abctextiles.com",
  "website": "https://abctextiles.com",
  "address": "123 Main Street",
  "city": "Ho Chi Minh City",
  "province": "Ho Chi Minh",
  "country": "Vietnam",
  "postalCode": "700000",
  "taxId": "0123456789",
  "contactPerson": "John Doe",
  "paymentTerms": "NET30",
  "status": "Active",
  "category": "Fabric",
  "rating": 4.5,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "createdBy": "admin",
  "sortOrder": 0,
  "items": [
    {
      "id": 1,
      "itemId": 10,
      "supplierId": 1,
      "code": "FAB-001-SUP",
      "fromUOMId": 1,
      "toUOMId": 2,
      "conversionQty": 100,
      "isDefault": true,
      "isActive": true,
      "sortOrder": 0,
      "item": {
        "id": 10,
        "name": "Cotton Fabric",
        "categoryId": 1,
        "itemTypeId": 1
      },
      "fromUOM": {
        "id": 1,
        "code": "YD",
        "name": "Yard",
        "description": "Đơn vị yard"
      },
      "toUOM": {
        "id": 2,
        "code": "M",
        "name": "Meter",
        "description": "Đơn vị mét"
      }
    }
  ]
}
```

**Response Error (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Supplier with ID 999 not found",
  "error": "Not Found"
}
```

**Use Case Frontend:**
- Xem chi tiết supplier trong modal/drawer
- Form edit supplier (pre-fill data)
- Xem danh sách items của supplier với UOM conversion

---

## 3. Tạo Supplier mới

### `POST /api/suppliers`

Tạo một supplier mới. Chỉ cần `code` và `name` là bắt buộc, các field khác là optional.

**Request Body:**
```json
{
  "code": "SUP001",
  "name": "ABC Textiles Co.",
  "phone": "+84123456789",
  "email": "contact@abctextiles.com",
  "website": "https://abctextiles.com",
  "address": "123 Main Street",
  "city": "Ho Chi Minh City",
  "province": "Ho Chi Minh",
  "country": "Vietnam",
  "postalCode": "700000",
  "taxId": "0123456789",
  "contactPerson": "John Doe",
  "paymentTerms": "NET30",
  "status": "Active",
  "category": "Fabric",
  "rating": 4.5,
  "isActive": true,
  "createdBy": "admin",
  "sortOrder": 0
}
```

**Required Fields:**
- `code` (string): Mã supplier (unique)
- `name` (string): Tên supplier

**Optional Fields:**
- `phone` (string): Số điện thoại
- `email` (string): Email (phải đúng format email)
- `website` (string): Website URL
- `address` (string): Địa chỉ đường
- `city` (string): Thành phố
- `province` (string): Tỉnh/Bang
- `country` (string): Quốc gia
- `postalCode` (string): Mã bưu điện
- `taxId` (string): Mã số thuế
- `contactPerson` (string): Người liên hệ
- `paymentTerms` (string): Điều khoản thanh toán (e.g., "NET30", "NET60", "COD")
- `status` (string): Trạng thái ("Active", "Inactive", "Blacklist")
- `category` (string): Loại supplier ("Fabric", "Accessories", "Packaging")
- `rating` (number): Đánh giá từ 0-5
- `isActive` (boolean): Có đang hoạt động không (default: true)
- `createdBy` (string): Người tạo
- `sortOrder` (number): Thứ tự sắp xếp (default: 0)

**Response Success (201 Created):**
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Textiles Co.",
  "phone": "+84123456789",
  "email": "contact@abctextiles.com",
  "website": "https://abctextiles.com",
  "address": "123 Main Street",
  "city": "Ho Chi Minh City",
  "province": "Ho Chi Minh",
  "country": "Vietnam",
  "postalCode": "700000",
  "taxId": "0123456789",
  "contactPerson": "John Doe",
  "paymentTerms": "NET30",
  "status": "Active",
  "category": "Fabric",
  "rating": 4.5,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "createdBy": "admin",
  "sortOrder": 0
}
```

**Response Error (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": [
    "code should not be empty",
    "name should not be empty",
    "email must be an email",
    "rating must not be greater than 5",
    "rating must not be less than 0"
  ],
  "error": "Bad Request"
}
```

**Use Case Frontend:**
- Form tạo supplier mới
- Validation: code và name là required
- Email validation
- Rating phải từ 0-5
- Dropdown cho status: Active, Inactive, Blacklist
- Dropdown cho category: Fabric, Accessories, Packaging

---

## 4. Cập nhật Supplier

### `PATCH /api/suppliers/:id`

Cập nhật thông tin supplier. Chỉ cần gửi các field cần update.

**Parameters:**
- `id` (path parameter): ID của supplier (integer)

**Request Body (Partial Update):**
```json
{
  "phone": "+84987654321",
  "email": "newemail@abctextiles.com",
  "rating": 5.0,
  "status": "Active"
}
```

**Response Success (200 OK):**
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Textiles Co.",
  "phone": "+84987654321",
  "email": "newemail@abctextiles.com",
  "website": "https://abctextiles.com",
  "address": "123 Main Street",
  "city": "Ho Chi Minh City",
  "province": "Ho Chi Minh",
  "country": "Vietnam",
  "postalCode": "700000",
  "taxId": "0123456789",
  "contactPerson": "John Doe",
  "paymentTerms": "NET30",
  "status": "Active",
  "category": "Fabric",
  "rating": 5.0,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:30:00.000Z",
  "createdBy": "admin",
  "sortOrder": 0
}
```

**Response Error (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Supplier with ID 999 not found",
  "error": "Not Found"
}
```

**Use Case Frontend:**
- Form edit supplier
- Chỉ gửi các field đã thay đổi
- Validation giống như create

---

## 5. Xóa Supplier

### `DELETE /api/suppliers/:id`

Xóa một supplier khỏi hệ thống. **Lưu ý:** Sẽ cascade delete các ItemSupplierUOM liên quan.

**Parameters:**
- `id` (path parameter): ID của supplier (integer)

**Request:**
```http
DELETE /api/suppliers/1 HTTP/1.1
Host: localhost:3000
```

**Response Success (200 OK):**
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Textiles Co.",
  "isActive": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:30:00.000Z"
}
```

**Response Error (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Supplier with ID 999 not found",
  "error": "Not Found"
}
```

**Use Case Frontend:**
- Nút delete trong table/list
- Confirmation dialog trước khi xóa
- Cảnh báo user về việc cascade delete

---

## 6. Kích hoạt Supplier

### `PATCH /api/suppliers/:id/activate`

Kích hoạt một supplier (set `isActive = true`).

**Parameters:**
- `id` (path parameter): ID của supplier (integer)

**Request:**
```http
PATCH /api/suppliers/1/activate HTTP/1.1
Host: localhost:3000
```

**Response Success (200 OK):**
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Textiles Co.",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:30:00.000Z"
}
```

**Response Error (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Supplier with ID 999 not found",
  "error": "Not Found"
}
```

**Use Case Frontend:**
- Toggle button Active/Inactive
- Badge hiển thị trạng thái
- Action menu với option "Activate"

---

## 7. Vô hiệu hóa Supplier

### `PATCH /api/suppliers/:id/deactivate`

Vô hiệu hóa một supplier (set `isActive = false`).

**Parameters:**
- `id` (path parameter): ID của supplier (integer)

**Request:**
```http
PATCH /api/suppliers/1/deactivate HTTP/1.1
Host: localhost:3000
```

**Response Success (200 OK):**
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Textiles Co.",
  "isActive": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:30:00.000Z"
}
```

**Response Error (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Supplier with ID 999 not found",
  "error": "Not Found"
}
```

**Use Case Frontend:**
- Toggle button Active/Inactive
- Badge hiển thị trạng thái
- Action menu với option "Deactivate"
- Confirmation trước khi deactivate

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request thành công |
| 201 | Created - Tạo resource thành công |
| 400 | Bad Request - Validation error hoặc dữ liệu không hợp lệ |
| 404 | Not Found - Không tìm thấy supplier |
| 500 | Internal Server Error - Lỗi server |

---

## Validation Rules

### Code
- Required
- String
- Unique trong database

### Name
- Required
- String

### Email
- Optional
- Phải đúng format email

### Rating
- Optional
- Number
- Min: 0
- Max: 5

### Status (Suggested Values)
- "Active"
- "Inactive"
- "Blacklist"

### Category (Suggested Values)
- "Fabric"
- "Accessories"
- "Packaging"

### Payment Terms (Common Values)
- "NET30" - Thanh toán trong 30 ngày
- "NET60" - Thanh toán trong 60 ngày
- "NET90" - Thanh toán trong 90 ngày
- "COD" - Cash on Delivery
- "Prepaid" - Thanh toán trước

---

## Frontend Integration Examples

### React/TypeScript Example

```typescript
// Type Definition
interface Supplier {
  id: number;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
  contactPerson?: string;
  paymentTerms?: string;
  status?: string;
  category?: string;
  rating?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  sortOrder: number;
}

// API Service
class SupplierService {
  private baseURL = 'http://localhost:3000/api/suppliers';

  async getAll(): Promise<Supplier[]> {
    const response = await fetch(this.baseURL);
    return response.json();
  }

  async getById(id: number): Promise<Supplier> {
    const response = await fetch(`${this.baseURL}/${id}`);
    if (!response.ok) throw new Error('Supplier not found');
    return response.json();
  }

  async create(data: Partial<Supplier>): Promise<Supplier> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async update(id: number, data: Partial<Supplier>): Promise<Supplier> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async delete(id: number): Promise<void> {
    await fetch(`${this.baseURL}/${id}`, { method: 'DELETE' });
  }

  async activate(id: number): Promise<Supplier> {
    const response = await fetch(`${this.baseURL}/${id}/activate`, {
      method: 'PATCH',
    });
    return response.json();
  }

  async deactivate(id: number): Promise<Supplier> {
    const response = await fetch(`${this.baseURL}/${id}/deactivate`, {
      method: 'PATCH',
    });
    return response.json();
  }
}
```

---

## Swagger Documentation

Truy cập Swagger UI để test API interactively:
```
http://localhost:3000/api/docs
```

Tìm section **"suppliers"** để xem và test tất cả endpoints.

---

## Notes for Frontend Developers

1. **Sorting**: Danh sách suppliers được sắp xếp theo `sortOrder` (ascending) và `code` (ascending)

2. **Active Status**:
   - `isActive = true`: Supplier đang hoạt động
   - `isActive = false`: Supplier bị vô hiệu hóa
   - Khác với `status` field (Active/Inactive/Blacklist)

3. **Rating**:
   - Giá trị từ 0 đến 5
   - Có thể dùng star rating component (5 sao)

4. **Items Relationship**:
   - Mỗi supplier có thể có nhiều items
   - Mỗi item-supplier có UOM conversion (fromUOM -> toUOM)
   - `conversionQty`: số lượng conversion

5. **Unique Constraint**:
   - `code` phải unique
   - Cần handle duplicate error từ server

6. **Cascade Delete**:
   - Xóa supplier sẽ xóa luôn tất cả ItemSupplierUOM liên quan
   - Cần cảnh báo user trước khi xóa
