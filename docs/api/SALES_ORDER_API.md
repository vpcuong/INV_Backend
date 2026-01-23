# Sales Order API Documentation

## Base URL
```
http://localhost:3000/so-headers
```

## API Endpoints

### 1. Create Sales Order
**POST** `/so-headers`

Tạo mới một đơn hàng bán hàng (Sales Order) với các line items.

**Request Body:**
```json
{
  "customerId": 1,
  "customerPoNum": "PO-CUST-2024-001",
  "orderDate": "2024-12-15T00:00:00.000Z",
  "requestDate": "2024-12-20T00:00:00.000Z",
  "needByDate": "2024-12-31T00:00:00.000Z",
  "orderStatus": "OPEN",
  "channel": "ONLINE",
  "fobCode": "FOB_ORIGIN",
  "shipViaCode": "FEDEX",
  "paymentTermCode": "NET30",
  "currencyCode": "VND",
  "exchangeRate": 1,
  "discountPercent": 5.00,
  "discountAmount": 150000,
  "totalLineAmount": 3000000,
  "totalDiscount": 150000,
  "totalTax": 285000,
  "totalCharges": 50000,
  "orderTotal": 3185000,
  "openAmount": 3185000,
  "billingAddressId": 1,
  "shippingAddressId": 2,
  "headerNote": "Đơn hàng ưu tiên - Giao nhanh",
  "internalNote": "Kiểm tra tồn kho trước khi xác nhận",
  "createdBy": "admin",
  "lines": [
    {
      "lineNum": 1,
      "itemId": 10,
      "itemSkuId": 25,
      "itemCode": "TS-COT-GRE-UNI-M",
      "description": "Áo thun cổ tròn - Màu xanh lá - Unisex - Size M",
      "orderQty": 50,
      "uomId": 1,
      "unitPrice": 250000,
      "lineDiscountPercent": 0,
      "lineDiscountAmount": 0,
      "lineTaxPercent": 10,
      "lineTaxAmount": 125000,
      "lineTotal": 1375000,
      "needByDate": "2024-12-25T00:00:00.000Z",
      "lineStatus": "OPEN",
      "openQty": 50,
      "shippedQty": 0,
      "warehouseCode": "WH01",
      "lineNote": "Đóng gói cẩn thận"
    },
    {
      "lineNum": 2,
      "itemId": 11,
      "itemSkuId": 30,
      "itemCode": "TS-COT-BLU-MEN-L",
      "description": "Áo thun cổ tròn - Màu xanh dương - Nam - Size L",
      "orderQty": 30,
      "uomId": 1,
      "unitPrice": 280000,
      "lineDiscountPercent": 5,
      "lineDiscountAmount": 42000,
      "lineTaxPercent": 10,
      "lineTaxAmount": 79800,
      "lineTotal": 877800,
      "needByDate": "2024-12-25T00:00:00.000Z",
      "lineStatus": "OPEN",
      "openQty": 30,
      "shippedQty": 0,
      "warehouseCode": "WH01",
      "lineNote": null
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "soNum": "SO-202412-0001",
  "customerId": 1,
  "customerPoNum": "PO-CUST-2024-001",
  "orderDate": "2024-12-15T00:00:00.000Z",
  "requestDate": "2024-12-20T00:00:00.000Z",
  "needByDate": "2024-12-31T00:00:00.000Z",
  "orderStatus": "OPEN",
  "channel": "ONLINE",
  "fobCode": "FOB_ORIGIN",
  "shipViaCode": "FEDEX",
  "paymentTermCode": "NET30",
  "currencyCode": "VND",
  "exchangeRate": 1,
  "discountPercent": 5.00,
  "discountAmount": 150000,
  "totalLineAmount": 3000000,
  "totalDiscount": 150000,
  "totalTax": 285000,
  "totalCharges": 50000,
  "orderTotal": 3185000,
  "openAmount": 3185000,
  "billingAddressId": 1,
  "shippingAddressId": 2,
  "headerNote": "Đơn hàng ưu tiên - Giao nhanh",
  "internalNote": "Kiểm tra tồn kho trước khi xác nhận",
  "createdBy": "admin",
  "createdAt": "2024-12-15T07:30:00.000Z",
  "updatedAt": "2024-12-15T07:30:00.000Z",
  "customer": {
    "id": 1,
    "customerCode": "CUST-001",
    "customerName": "Công ty TNHH ABC",
    "taxCode": "0123456789",
    "phone": "0901234567",
    "email": "contact@abc.com"
  },
  "billingAddress": {
    "id": 1,
    "addressType": "BILLING",
    "addressLine1": "123 Nguyễn Huệ",
    "ward": "Bến Nghé",
    "district": "Quận 1",
    "city": "Hồ Chí Minh",
    "country": "Vietnam",
    "postalCode": "700000"
  },
  "shippingAddress": {
    "id": 2,
    "addressType": "SHIPPING",
    "addressLine1": "456 Lê Lợi",
    "ward": "Bến Thành",
    "district": "Quận 1",
    "city": "Hồ Chí Minh",
    "country": "Vietnam",
    "postalCode": "700000"
  },
  "lines": [
    {
      "id": 1,
      "soHeaderId": 1,
      "lineNum": 1,
      "itemId": 10,
      "itemSkuId": 25,
      "itemCode": "TS-COT-GRE-UNI-M",
      "description": "Áo thun cổ tròn - Màu xanh lá - Unisex - Size M",
      "orderQty": 50,
      "uomId": 1,
      "unitPrice": 250000,
      "lineDiscountPercent": 0,
      "lineDiscountAmount": 0,
      "lineTaxPercent": 10,
      "lineTaxAmount": 125000,
      "lineTotal": 1375000,
      "needByDate": "2024-12-25T00:00:00.000Z",
      "lineStatus": "OPEN",
      "openQty": 50,
      "shippedQty": 0,
      "warehouseCode": "WH01",
      "lineNote": "Đóng gói cẩn thận",
      "createdAt": "2024-12-15T07:30:00.000Z",
      "updatedAt": "2024-12-15T07:30:00.000Z",
      "item": {
        "id": 10,
        "itemCode": "TS-COT",
        "itemName": "Áo thun cổ tròn",
        "itemType": "FINISHED_GOOD"
      },
      "itemSku": {
        "id": 25,
        "skuCode": "TS-COT-GRE-UNI-M",
        "colorId": 3,
        "genderId": 1,
        "sizeId": 3,
        "color": {
          "id": 3,
          "colorCode": "GRE",
          "colorName": "Green"
        },
        "gender": {
          "id": 1,
          "genderCode": "UNI",
          "genderName": "Unisex"
        },
        "size": {
          "id": 3,
          "sizeCode": "M",
          "sizeName": "Medium"
        }
      },
      "uom": {
        "id": 1,
        "uomCode": "PCS",
        "uomName": "Pieces"
      }
    },
    {
      "id": 2,
      "soHeaderId": 1,
      "lineNum": 2,
      "itemId": 11,
      "itemSkuId": 30,
      "itemCode": "TS-COT-BLU-MEN-L",
      "description": "Áo thun cổ tròn - Màu xanh dương - Nam - Size L",
      "orderQty": 30,
      "uomId": 1,
      "unitPrice": 280000,
      "lineDiscountPercent": 5,
      "lineDiscountAmount": 42000,
      "lineTaxPercent": 10,
      "lineTaxAmount": 79800,
      "lineTotal": 877800,
      "needByDate": "2024-12-25T00:00:00.000Z",
      "lineStatus": "OPEN",
      "openQty": 30,
      "shippedQty": 0,
      "warehouseCode": "WH01",
      "lineNote": null,
      "createdAt": "2024-12-15T07:30:00.000Z",
      "updatedAt": "2024-12-15T07:30:00.000Z",
      "item": {
        "id": 11,
        "itemCode": "TS-COT",
        "itemName": "Áo thun cổ tròn",
        "itemType": "FINISHED_GOOD"
      },
      "itemSku": {
        "id": 30,
        "skuCode": "TS-COT-BLU-MEN-L",
        "colorId": 5,
        "genderId": 2,
        "sizeId": 4,
        "color": {
          "id": 5,
          "colorCode": "BLU",
          "colorName": "Blue"
        },
        "gender": {
          "id": 2,
          "genderCode": "MEN",
          "genderName": "Men"
        },
        "size": {
          "id": 4,
          "sizeCode": "L",
          "sizeName": "Large"
        }
      },
      "uom": {
        "id": 1,
        "uomCode": "PCS",
        "uomName": "Pieces"
      }
    }
  ]
}
```

**Notes:**
- `soNum` sẽ được tự động generate nếu không truyền vào (format: `SO-YYYYMM-XXXX`)
- `orderDate` mặc định là ngày hiện tại nếu không truyền
- `orderStatus` mặc định là `OPEN`
- `exchangeRate` mặc định là `1`
- Tất cả các giá trị discount, tax, charges mặc định là `0`

---

### 2. Get All Sales Orders
**GET** `/so-headers`

Lấy danh sách tất cả đơn hàng với phân trang và filter.

**Query Parameters:**
- `skip` (optional): Số bản ghi bỏ qua (pagination)
- `take` (optional): Số bản ghi lấy về
- `customerId` (optional): Filter theo customer
- `orderStatus` (optional): Filter theo trạng thái (`DRAFT`, `OPEN`, `PARTIAL`, `CLOSED`, `CANCELLED`, `ON_HOLD`)

**Example Request:**
```
GET /so-headers?skip=0&take=10&orderStatus=OPEN
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "soNum": "SO-202412-0001",
    "customerId": 1,
    "customerPoNum": "PO-CUST-2024-001",
    "orderDate": "2024-12-15T00:00:00.000Z",
    "requestDate": "2024-12-20T00:00:00.000Z",
    "needByDate": "2024-12-31T00:00:00.000Z",
    "orderStatus": "OPEN",
    "channel": "ONLINE",
    "currencyCode": "VND",
    "orderTotal": 3185000,
    "openAmount": 3185000,
    "createdAt": "2024-12-15T07:30:00.000Z",
    "updatedAt": "2024-12-15T07:30:00.000Z",
    "customer": {
      "id": 1,
      "customerCode": "CUST-001",
      "customerName": "Công ty TNHH ABC"
    },
    "lines": [
      {
        "id": 1,
        "lineNum": 1,
        "itemCode": "TS-COT-GRE-UNI-M",
        "orderQty": 50,
        "lineTotal": 1375000,
        "lineStatus": "OPEN"
      },
      {
        "id": 2,
        "lineNum": 2,
        "itemCode": "TS-COT-BLU-MEN-L",
        "orderQty": 30,
        "lineTotal": 877800,
        "lineStatus": "OPEN"
      }
    ]
  },
  {
    "id": 2,
    "soNum": "SO-202412-0002",
    "customerId": 2,
    "customerPoNum": "PO-CUST-2024-002",
    "orderDate": "2024-12-14T00:00:00.000Z",
    "orderStatus": "OPEN",
    "currencyCode": "VND",
    "orderTotal": 5500000,
    "openAmount": 5500000,
    "createdAt": "2024-12-14T08:15:00.000Z",
    "updatedAt": "2024-12-14T08:15:00.000Z",
    "customer": {
      "id": 2,
      "customerCode": "CUST-002",
      "customerName": "Công ty TNHH XYZ"
    },
    "lines": [
      {
        "id": 3,
        "lineNum": 1,
        "itemCode": "POLO-BLK-MEN-XL",
        "orderQty": 100,
        "lineTotal": 5500000,
        "lineStatus": "OPEN"
      }
    ]
  }
]
```

---

### 3. Get Sales Order by ID
**GET** `/so-headers/:id`

Lấy chi tiết một đơn hàng theo ID.

**Example Request:**
```
GET /so-headers/1
```

**Response (200 OK):**
```json
{
  "id": 1,
  "soNum": "SO-202412-0001",
  "customerId": 1,
  "customerPoNum": "PO-CUST-2024-001",
  "orderDate": "2024-12-15T00:00:00.000Z",
  "requestDate": "2024-12-20T00:00:00.000Z",
  "needByDate": "2024-12-31T00:00:00.000Z",
  "orderStatus": "OPEN",
  "channel": "ONLINE",
  "fobCode": "FOB_ORIGIN",
  "shipViaCode": "FEDEX",
  "paymentTermCode": "NET30",
  "currencyCode": "VND",
  "exchangeRate": 1,
  "discountPercent": 5.00,
  "discountAmount": 150000,
  "totalLineAmount": 3000000,
  "totalDiscount": 150000,
  "totalTax": 285000,
  "totalCharges": 50000,
  "orderTotal": 3185000,
  "openAmount": 3185000,
  "billingAddressId": 1,
  "shippingAddressId": 2,
  "headerNote": "Đơn hàng ưu tiên - Giao nhanh",
  "internalNote": "Kiểm tra tồn kho trước khi xác nhận",
  "createdBy": "admin",
  "createdAt": "2024-12-15T07:30:00.000Z",
  "updatedAt": "2024-12-15T07:30:00.000Z",
  "customer": {
    "id": 1,
    "customerCode": "CUST-001",
    "customerName": "Công ty TNHH ABC",
    "taxCode": "0123456789",
    "phone": "0901234567",
    "email": "contact@abc.com",
    "status": "ACTIVE"
  },
  "billingAddress": {
    "id": 1,
    "addressType": "BILLING",
    "addressLine1": "123 Nguyễn Huệ",
    "ward": "Bến Nghé",
    "district": "Quận 1",
    "city": "Hồ Chí Minh",
    "country": "Vietnam",
    "postalCode": "700000"
  },
  "shippingAddress": {
    "id": 2,
    "addressType": "SHIPPING",
    "addressLine1": "456 Lê Lợi",
    "ward": "Bến Thành",
    "district": "Quận 1",
    "city": "Hồ Chí Minh",
    "country": "Vietnam",
    "postalCode": "700000"
  },
  "lines": [
    {
      "id": 1,
      "soHeaderId": 1,
      "lineNum": 1,
      "itemId": 10,
      "itemSkuId": 25,
      "itemCode": "TS-COT-GRE-UNI-M",
      "description": "Áo thun cổ tròn - Màu xanh lá - Unisex - Size M",
      "orderQty": 50,
      "uomId": 1,
      "unitPrice": 250000,
      "lineDiscountPercent": 0,
      "lineDiscountAmount": 0,
      "lineTaxPercent": 10,
      "lineTaxAmount": 125000,
      "lineTotal": 1375000,
      "needByDate": "2024-12-25T00:00:00.000Z",
      "lineStatus": "OPEN",
      "openQty": 50,
      "shippedQty": 0,
      "warehouseCode": "WH01",
      "lineNote": "Đóng gói cẩn thận",
      "createdAt": "2024-12-15T07:30:00.000Z",
      "updatedAt": "2024-12-15T07:30:00.000Z",
      "item": {
        "id": 10,
        "itemCode": "TS-COT",
        "itemName": "Áo thun cổ tròn",
        "itemType": "FINISHED_GOOD"
      },
      "itemSku": {
        "id": 25,
        "skuCode": "TS-COT-GRE-UNI-M",
        "colorId": 3,
        "genderId": 1,
        "sizeId": 3,
        "color": {
          "id": 3,
          "colorCode": "GRE",
          "colorName": "Green"
        },
        "gender": {
          "id": 1,
          "genderCode": "UNI",
          "genderName": "Unisex"
        },
        "size": {
          "id": 3,
          "sizeCode": "M",
          "sizeName": "Medium"
        }
      },
      "uom": {
        "id": 1,
        "uomCode": "PCS",
        "uomName": "Pieces"
      }
    }
  ]
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Sales Order with ID 999 not found",
  "error": "Not Found"
}
```

---

### 4. Get Sales Order by SO Number
**GET** `/so-headers/sonum/:soNum`

Lấy chi tiết đơn hàng theo số SO.

**Example Request:**
```
GET /so-headers/sonum/SO-202412-0001
```

**Response (200 OK):** Same as Get by ID

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Sales Order SO-202412-9999 not found",
  "error": "Not Found"
}
```

---

### 5. Get Sales Orders by Customer
**GET** `/so-headers/customer/:customerId`

Lấy tất cả đơn hàng của một customer.

**Example Request:**
```
GET /so-headers/customer/1
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "soNum": "SO-202412-0001",
    "customerId": 1,
    "orderDate": "2024-12-15T00:00:00.000Z",
    "orderStatus": "OPEN",
    "orderTotal": 3185000,
    "openAmount": 3185000,
    "createdAt": "2024-12-15T07:30:00.000Z",
    "customer": {
      "id": 1,
      "customerCode": "CUST-001",
      "customerName": "Công ty TNHH ABC"
    },
    "lines": [
      {
        "id": 1,
        "lineNum": 1,
        "itemCode": "TS-COT-GRE-UNI-M",
        "orderQty": 50,
        "lineTotal": 1375000,
        "lineStatus": "OPEN"
      }
    ]
  }
]
```

---

### 6. Update Sales Order
**PATCH** `/so-headers/:id`

Cập nhật thông tin đơn hàng (header only, không update lines).

**Request Body:** (Tất cả fields đều optional)
```json
{
  "orderStatus": "PARTIAL",
  "customerPoNum": "PO-CUST-2024-001-UPDATED",
  "needByDate": "2025-01-15T00:00:00.000Z",
  "headerNote": "Đã xác nhận với khách hàng - Giao theo lô",
  "paymentTermCode": "NET45",
  "totalLineAmount": 3000000,
  "totalDiscount": 150000,
  "totalTax": 285000,
  "orderTotal": 3185000,
  "openAmount": 1500000
}
```

**Response (200 OK):** Full SO object with updated fields

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Sales Order with ID 999 not found",
  "error": "Not Found"
}
```

---

### 7. Cancel Sales Order
**PATCH** `/so-headers/:id/cancel`

Hủy đơn hàng (set status = CANCELLED).

**Example Request:**
```
PATCH /so-headers/1/cancel
```

**Response (200 OK):**
```json
{
  "id": 1,
  "soNum": "SO-202412-0001",
  "orderStatus": "CANCELLED",
  "customer": {
    "id": 1,
    "customerCode": "CUST-001",
    "customerName": "Công ty TNHH ABC"
  },
  "lines": [
    {
      "id": 1,
      "lineNum": 1,
      "itemCode": "TS-COT-GRE-UNI-M",
      "orderQty": 50,
      "lineStatus": "OPEN"
    }
  ]
}
```

---

### 8. Close Sales Order
**PATCH** `/so-headers/:id/close`

Đóng đơn hàng (set status = CLOSED).

**Example Request:**
```
PATCH /so-headers/1/close
```

**Response (200 OK):** Same structure as Cancel

---

### 9. Hold Sales Order
**PATCH** `/so-headers/:id/hold`

Tạm giữ đơn hàng (set status = ON_HOLD).

**Example Request:**
```
PATCH /so-headers/1/hold
```

**Response (200 OK):** Same structure as Cancel

---

### 10. Delete Sales Order
**DELETE** `/so-headers/:id`

Xóa đơn hàng (cascade delete lines).

**Example Request:**
```
DELETE /so-headers/1
```

**Response (200 OK):**
```json
{
  "id": 1,
  "soNum": "SO-202412-0001",
  "customerId": 1,
  "orderStatus": "CANCELLED",
  "orderTotal": 3185000
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Sales Order with ID 999 not found",
  "error": "Not Found"
}
```

---

## Enums Reference

### Order Status (SOStatus)
- `DRAFT` - Nháp (chưa gửi)
- `OPEN` - Đang mở (đã gửi, chưa xử lý)
- `PARTIAL` - Đã xử lý một phần
- `CLOSED` - Đã hoàn thành
- `CANCELLED` - Đã hủy
- `ON_HOLD` - Tạm giữ

### Line Status (SOLineStatus)
- `OPEN` - Chưa xử lý
- `PARTIAL` - Đã xử lý một phần
- `CLOSED` - Đã hoàn thành
- `CANCELLED` - Đã hủy
- `BACKORDERED` - Chờ hàng về

### Payment Terms
- `COD` - Cash on Delivery
- `PREPAID` - Trả trước
- `NET7` - Thanh toán trong 7 ngày
- `NET15` - Thanh toán trong 15 ngày
- `NET30` - Thanh toán trong 30 ngày
- `NET45` - Thanh toán trong 45 ngày
- `NET60` - Thanh toán trong 60 ngày
- `NET90` - Thanh toán trong 90 ngày
- `EOM` - End of Month
- `CUSTOM` - Tùy chỉnh

---

## Validation Rules

### Required Fields (Create)
- `customerId` - Bắt buộc
- `currencyCode` - Bắt buộc (default: "VND")
- `totalLineAmount` - Bắt buộc
- `orderTotal` - Bắt buộc
- `openAmount` - Bắt buộc
- `createdBy` - Bắt buộc

### Lines Required Fields (Create)
- `lineNum` - Bắt buộc (unique trong 1 SO)
- `itemCode` - Bắt buộc
- `orderQty` - Bắt buộc (>= 0)
- `uomId` - Bắt buộc
- `unitPrice` - Bắt buộc (>= 0)
- `lineTotal` - Bắt buộc (>= 0)
- `openQty` - Bắt buộc (>= 0)

### Numeric Validations
- Tất cả số tiền, số lượng phải >= 0
- `exchangeRate` >= 0
- Percent fields (discount, tax) là số thập phân (VD: 5.00 = 5%)

---

## Business Logic Notes

### 1. SO Number Generation
- Format: `SO-YYYYMM-XXXX`
- VD: `SO-202412-0001`, `SO-202412-0002`
- Tự động tăng theo tháng
- Sequence reset về 1 khi sang tháng mới

### 2. Calculations
Frontend nên tính toán:
```javascript
// Line Level
lineSubtotal = orderQty * unitPrice
lineDiscountAmount = lineSubtotal * (lineDiscountPercent / 100)
lineAfterDiscount = lineSubtotal - lineDiscountAmount
lineTaxAmount = lineAfterDiscount * (lineTaxPercent / 100)
lineTotal = lineAfterDiscount + lineTaxAmount

// Header Level
totalLineAmount = SUM(all lines lineTotal)
discountAmount = totalLineAmount * (discountPercent / 100)
totalDiscount = discountAmount + SUM(all lines lineDiscountAmount)
totalTax = SUM(all lines lineTaxAmount)
orderTotal = totalLineAmount - discountAmount + totalTax + totalCharges
openAmount = orderTotal (initially, decreases as order is fulfilled)
```

### 3. Status Flow
```
DRAFT → OPEN → PARTIAL → CLOSED
  ↓       ↓       ↓
CANCELLED (at any time)
  ↓       ↓       ↓
ON_HOLD (at any time)
```

### 4. Fulfillment Tracking
- `openQty` = Số lượng còn lại chưa giao
- `shippedQty` = Số lượng đã giao
- `orderQty = openQty + shippedQty`
- Khi `openQty = 0` → Line status = CLOSED
- Khi tất cả lines = CLOSED → Header status = CLOSED

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "customerId must be a number",
    "orderQty must not be less than 0"
  ],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Sales Order with ID 999 not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Integration Examples

### Create Order với Foreign Keys
```javascript
// 1. Lấy danh sách customers
const customers = await fetch('/customers');

// 2. Lấy địa chỉ của customer
const addresses = await fetch(`/customer-addresses?customerId=${customerId}`);

// 3. Lấy items để chọn
const items = await fetch('/items');

// 4. Lấy SKUs của item
const skus = await fetch(`/item-skus?itemId=${itemId}`);

// 5. Lấy UOMs
const uoms = await fetch('/uom');

// 6. Tạo SO
const so = await fetch('/so-headers', {
  method: 'POST',
  body: JSON.stringify({
    customerId: selectedCustomer.id,
    billingAddressId: selectedBillingAddress.id,
    shippingAddressId: selectedShippingAddress.id,
    lines: [{
      itemId: selectedItem.id,
      itemSkuId: selectedSku.id,
      itemCode: selectedSku.skuCode,
      uomId: selectedUom.id,
      // ... other fields
    }]
  })
});
```

### Filter và Pagination
```javascript
// Lấy page 2 (mỗi page 20 items)
const page2 = await fetch('/so-headers?skip=20&take=20');

// Lấy đơn hàng OPEN của customer 1
const openOrders = await fetch('/so-headers?customerId=1&orderStatus=OPEN');

// Combine filters
const filtered = await fetch('/so-headers?customerId=1&orderStatus=OPEN&skip=0&take=10');
```

### Update Order Status
```javascript
// Cancel order
await fetch('/so-headers/1/cancel', { method: 'PATCH' });

// Hold order
await fetch('/so-headers/1/hold', { method: 'PATCH' });

// Close order
await fetch('/so-headers/1/close', { method: 'PATCH' });

// Custom status update (use general update)
await fetch('/so-headers/1', {
  method: 'PATCH',
  body: JSON.stringify({ orderStatus: 'PARTIAL' })
});
```
