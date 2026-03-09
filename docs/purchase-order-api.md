# Purchase Order API

Base URL: `/api/po`

Tất cả endpoints yêu cầu Bearer Token trong header:
```
Authorization: Bearer <token>
```

---

## Trạng thái (Status)

### POHeader Status

| Status | Mô tả |
|--------|-------|
| `DRAFT` | Nháp — có thể sửa, thêm/xóa lines |
| `APPROVED` | Đã duyệt |
| `PARTIALLY_RECEIVED` | Đã nhận một phần hàng |
| `RECEIVED` | Đã nhận đủ hàng |
| `CLOSED` | Đã đóng |
| `CANCELLED` | Đã hủy |

### PODetail (Line) Status

| Status | Mô tả |
|--------|-------|
| `OPEN` | Chờ nhận hàng |
| `PARTIALLY_RECEIVED` | Đã nhận một phần |
| `RECEIVED` | Đã nhận đủ |
| `CANCELLED` | Đã hủy |

---

## Endpoints

### 1. Lấy danh sách PO

```
GET /api/po
```

**Query params:**

| Param | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `supplierId` | number | Không | Lọc theo nhà cung cấp |
| `status` | string | Không | Lọc theo trạng thái |
| `skip` | number | Không | Offset phân trang (mặc định: 0) |
| `take` | number | Không | Số lượng mỗi trang (mặc định: 20) |

**Ví dụ:**
```
GET /api/po?supplierId=1&status=APPROVED&skip=0&take=20
```

---

### 2. Lấy danh sách PO theo Supplier

```
GET /api/po/supplier/:supplierId
```

**Ví dụ:**
```
GET /api/po/supplier/1
```

---

### 3. Lấy chi tiết PO

```
GET /api/po/:id
```

**Ví dụ:**
```
GET /api/po/10
```

---

### 4. Tạo PO mới

```
POST /api/po
```

**Request body:**

```json
{
  "supplierId": 1,
  "orderDate": "2026-03-09",
  "expectedDate": "2026-04-01",
  "currencyCode": "VND",
  "exchangeRate": 1,
  "note": "Đơn hàng tháng 3",
  "lines": [
    {
      "skuPublicId": "01JNXXX...",
      "uomCode": "PCS",
      "orderQty": 100,
      "unitPrice": 50000,
      "description": "Áo thun trắng size M",
      "warehouseCode": "WH01",
      "note": ""
    }
  ]
}
```

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `supplierId` | number | **Có** | ID nhà cung cấp |
| `orderDate` | date | Không | Ngày đặt hàng (mặc định: hôm nay) |
| `expectedDate` | date | Không | Ngày dự kiến nhận hàng |
| `currencyCode` | string | Không | Mã tiền tệ (mặc định: `VND`) |
| `exchangeRate` | number | Không | Tỷ giá (mặc định: `1`) |
| `note` | string | Không | Ghi chú |
| `lines` | array | Không | Danh sách dòng hàng |
| `lines[].skuPublicId` | string | **Có** | Public ID của SKU |
| `lines[].uomCode` | string | **Có** | Mã đơn vị tính |
| `lines[].orderQty` | number | **Có** | Số lượng đặt |
| `lines[].unitPrice` | number | **Có** | Đơn giá |
| `lines[].description` | string | Không | Mô tả dòng hàng |
| `lines[].warehouseCode` | string | Không | Mã kho nhận hàng |
| `lines[].note` | string | Không | Ghi chú dòng hàng |

---

### 5. Cập nhật PO (header + lines)

```
PATCH /api/po/:publicId/with-lines
```

Cho phép cập nhật header, thêm/sửa/xóa lines trong một request.
Chỉ áp dụng khi PO ở trạng thái **DRAFT**.

**Request body:**

```json
{
  "header": {
    "supplierId": 2,
    "orderDate": "2026-03-10",
    "expectedDate": "2026-04-15",
    "currencyCode": "VND",
    "exchangeRate": 1,
    "note": "Cập nhật ghi chú"
  },
  "lines": [
    {
      "publicId": "01JNYYY...",
      "orderQty": 200,
      "unitPrice": 45000
    },
    {
      "skuPublicId": "01JNZZZ...",
      "uomCode": "PCS",
      "orderQty": 50,
      "unitPrice": 80000,
      "warehouseCode": "WH02"
    }
  ],
  "linesToDelete": [
    "01JNAAA...",
    "01JNBBB..."
  ]
}
```

**Quy tắc xử lý lines:**

| Trường hợp | Điều kiện | Hành động |
|-----------|-----------|----------|
| **Thêm line mới** | `lines[]` không có `publicId` | Tạo mới dòng hàng |
| **Sửa line cũ** | `lines[]` có `publicId` | Cập nhật dòng hàng theo publicId |
| **Xóa line** | `linesToDelete[]` chứa publicId | Xóa dòng hàng theo publicId |

**Chi tiết các field:**

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `header` | object | Không | Cập nhật thông tin header (bỏ qua nếu không cần sửa) |
| `lines` | array | Không | Danh sách lines cần thêm hoặc cập nhật |
| `lines[].publicId` | string | Không | publicId của line — **có** = update, **không có** = thêm mới |
| `lines[].skuPublicId` | string | Khi thêm mới | Public ID của SKU |
| `lines[].uomCode` | string | Khi thêm mới | Mã đơn vị tính |
| `lines[].orderQty` | number | Khi thêm mới | Số lượng đặt |
| `lines[].unitPrice` | number | Khi thêm mới | Đơn giá |
| `lines[].description` | string | Không | Mô tả |
| `lines[].warehouseCode` | string | Không | Mã kho |
| `lines[].note` | string | Không | Ghi chú |
| `linesToDelete` | string[] | Không | Danh sách publicId của lines cần xóa |

**Ví dụ — chỉ sửa header:**
```json
{
  "header": { "note": "Ghi chú mới", "expectedDate": "2026-05-01" }
}
```

**Ví dụ — chỉ thêm line mới:**
```json
{
  "lines": [
    {
      "skuPublicId": "01JNXXX...",
      "uomCode": "PCS",
      "orderQty": 10,
      "unitPrice": 100000
    }
  ]
}
```

**Ví dụ — chỉ xóa lines:**
```json
{
  "linesToDelete": ["01JNAAA...", "01JNBBB..."]
}
```

---

### 6. Cập nhật Header PO

```
PATCH /api/po/:id
```

Chỉ cập nhật thông tin header, không liên quan đến lines.

**Request body:**

```json
{
  "supplierId": 2,
  "orderDate": "2026-03-10",
  "expectedDate": "2026-04-15",
  "currencyCode": "VND",
  "exchangeRate": 1,
  "note": "Ghi chú mới"
}
```

---

### 7. Duyệt PO

```
PATCH /api/po/:publicId/approve
```

Chuyển trạng thái từ `DRAFT` → `APPROVED`.

**Ví dụ:**
```
PATCH /api/po/01JNXXX.../approve
```

> Không cần request body.

---

### 8. Hủy PO

```
PATCH /api/po/:publicId/cancel
```

Chuyển trạng thái sang `CANCELLED`. Tất cả lines chưa hoàn thành sẽ bị hủy theo.

**Ví dụ:**
```
PATCH /api/po/01JNXXX.../cancel
```

> Không cần request body.

---

### 9. Đóng PO

```
PATCH /api/po/:publicId/close
```

Chuyển trạng thái sang `CLOSED`.

**Ví dụ:**
```
PATCH /api/po/01JNXXX.../close
```

> Không cần request body.

---

### 10. Xóa PO

```
DELETE /api/po/:id
```

Chỉ xóa được PO ở trạng thái **DRAFT**.

**Ví dụ:**
```
DELETE /api/po/10
```

---

## Luồng nghiệp vụ thông thường

```
Tạo PO (POST)
    ↓
Chỉnh sửa header/lines nếu cần (PATCH with-lines)
    ↓
Duyệt PO (PATCH approve)
    ↓
Nhận hàng qua Goods Receipt → hệ thống tự cập nhật receivedQty
    ↓
PARTIALLY_RECEIVED / RECEIVED (tự động)
    ↓
Đóng PO (PATCH close)
```

---

## Lưu ý

- **`id`** (integer): dùng cho `GET /:id`, `PATCH /:id`, `DELETE /:id`
- **`publicId`** (ULID 26 ký tự): dùng cho `PATCH /:publicId/with-lines`, `PATCH /:publicId/approve|cancel|close` và `linesToDelete[]`
- Thêm/sửa/xóa lines chỉ được phép khi PO ở trạng thái **DRAFT**
- `receivedQty` của line được cập nhật tự động khi hoàn thành Goods Receipt, không sửa trực tiếp qua API này
