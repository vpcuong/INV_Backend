# Sales Order API Documentation

## Create Sales Order

### Endpoint
```
POST /so
```

### Description
Tạo một Sales Order mới với header và lines. API này hỗ trợ tạo order hoàn chỉnh bao gồm thông tin header (khách hàng, ngày tháng) và các line items (sản phẩm, số lượng, giá).

**Backend tự động tính toán**: Tất cả các giá trị như `totalLineAmount`, `orderTotal`, `lineTotal`, `openQty`, `shippedQty`, `orderStatus`, `lineStatus` được tính toán tự động bởi backend. Frontend chỉ cần gửi input từ user.

---

## Request Body Structure

### Root Level Fields

| Field | Type | Required | Auto-Calculated | Description | Example |
|-------|------|----------|-----------------|-------------|---------|
| `customerId` | number | **YES** | ❌ | ID của khách hàng (phải ≥ 1) | `1` |
| `createdBy` | string | **YES** | ❌ | Người tạo order | `"admin"` |
| `orderDate` | string (ISO Date) | NO | ✅ Default now | Ngày tạo order | `"2024-12-15T00:00:00.000Z"` |
| `requestDate` | string (ISO Date) | NO | ❌ | Ngày yêu cầu | `"2024-12-20T00:00:00.000Z"` |
| `needByDate` | string (ISO Date) | NO | ❌ | Ngày cần có hàng | `"2024-12-25T00:00:00.000Z"` |
| `headerDiscountPercent` | number | NO | ❌ | Phần trăm discount ở header (≥ 0) | `5.0` |
| `billingAddressId` | number | NO | ❌ | ID địa chỉ billing | `1` |
| `shippingAddressId` | number | NO | ❌ | ID địa chỉ shipping | `2` |
| `headerNote` | string | NO | ❌ | Ghi chú hiển thị cho khách hàng | `"Special handling"` |
| `internalNote` | string | NO | ❌ | Ghi chú nội bộ | `"VIP customer"` |
| `channel` | string | NO | ❌ | Kênh bán hàng | `"ONLINE"` |
| `fobCode` | string | NO | ❌ | Mã FOB (Free On Board) | `"FOB_ORIGIN"` |
| `shipViaCode` | string | NO | ❌ | Phương thức vận chuyển | `"UPS_GROUND"` |
| `paymentTermCode` | string | NO | ❌ | Điều khoản thanh toán | `"NET_30"` |
| `currencyCode` | string | NO | ✅ Default USD | Mã tiền tệ | `"USD"` |
| `customerPoNum` | string | NO | ❌ | Số PO của khách hàng | `"PO-12345"` |
| `lines` | array | NO | ❌ | Danh sách line items | See below ⬇️ |

### ❌ **Removed Fields** (Tự động tính toán bởi backend)

Các field sau **KHÔNG** được gửi từ frontend nữa. Backend sẽ tự động tính toán:

| Field | Calculated By | Formula |
|-------|---------------|---------|
| `soNum` | Backend | Auto-generated: `SO{YEAR}{SEQUENCE}` (e.g., `SO2026000001`) |
| `orderStatus` | Backend | Default: `"OPEN"` |
| `exchangeRate` | Backend | Fetched based on `currencyCode` |
| `headerDiscountAmount` | Backend | `totalLineAmount * headerDiscountPercent / 100` |
| `totalLineAmount` | Backend | Sum of all `lineTotal` from lines |
| `totalDiscount` | Backend | `headerDiscountAmount + sum(lineDiscountAmount)` |
| `totalTax` | Backend | Sum of all `lineTaxAmount` from lines |
| `totalCharges` | Backend | Sum of charges (currently 0) |
| `orderTotal` | Backend | `totalLineAmount - totalDiscount + totalTax + totalCharges` |
| `openAmount` | Backend | Initially equals `orderTotal` |

---

### `lines` Array (Optional)

Danh sách các line items (sản phẩm) trong order.

**Each line object:**

| Field | Type | Required | Auto-Calculated | Description | Example |
|-------|------|----------|-----------------|-------------|---------|
| `itemCode` | string | **YES** | ❌ | Mã sản phẩm | `"ITEM-001"` |
| `orderQty` | number | **YES** | ❌ | Số lượng order (phải > 0) | `10` |
| `unitPrice` | number | **YES** | ❌ | Đơn giá (phải > 0) | `25.5` |
| `lineNum` | number | NO | ✅ Auto-increment | Số thứ tự line | `1` |
| `itemId` | number | NO | ❌ | ID của item | `123` |
| `itemSkuId` | number | NO | ❌ | ID của item SKU | `456` |
| `description` | string | NO | ❌ | Mô tả sản phẩm | `"Blue T-Shirt"` |
| `uomCode` | string | NO | ❌ | Mã đơn vị tính | `"PCS"` |
| `pricing` | object | NO | ❌ | Discount và tax | See below ⬇️ |
| `needByDate` | string (ISO Date) | NO | ❌ | Ngày cần có hàng | `"2024-12-31T00:00:00.000Z"` |
| `warehouseCode` | string | NO | ❌ | Mã kho hàng | `"WH-01"` |
| `lineNote` | string | NO | ❌ | Ghi chú cho line | `"Gift wrap"` |

### ❌ **Removed Line Fields** (Tự động tính toán)

| Field | Calculated By | Formula/Rule |
|-------|---------------|--------------|
| `lineTotal` | Backend | `(orderQty * unitPrice) - discountAmount + taxAmount` |
| `lineStatus` | Backend | Default: `"OPEN"` |
| `openQty` | Backend | Initially equals `orderQty` |
| `shippedQty` | Backend | Default: `0` |

**`pricing` Object (Optional) - Thông tin discount và tax:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `discountPercent` | number | NO | Phần trăm discount (0-100) | `10` |
| `discountAmount` | number | NO | Số tiền discount (≥ 0) | `5.5` |
| `taxPercent` | number | NO | Phần trăm thuế (0-100) | `8.25` |
| `taxAmount` | number | NO | Số tiền thuế (≥ 0) | `2.07` |

**Example lines array:**
```json
{
  "lines": [
    {
      "itemCode": "TS-BLU-M",
      "description": "Blue T-Shirt Size M",
      "orderQty": 100,
      "unitPrice": 25.99,
      "uomCode": "PCS",
      "pricing": {
        "discountPercent": 10,
        "discountAmount": 259.9,
        "taxPercent": 8.25,
        "taxAmount": 192.43
      },
      "warehouseCode": "WH-01",
      "lineNote": "Special packaging required"
    },
    {
      "itemCode": "TS-RED-L",
      "description": "Red T-Shirt Size L",
      "orderQty": 50,
      "unitPrice": 27.99,
      "uomCode": "PCS",
      "pricing": {
        "discountAmount": 50.0,
        "taxPercent": 8.25,
        "taxAmount": 90.48
      }
    }
  ]
}
```

---

## Complete Request Examples

### Minimal Request (Only Required Fields)

```json
{
  "customerId": 1,
  "createdBy": "admin"
}
```

### Simple Request with Lines

```json
{
  "customerId": 1,
  "createdBy": "admin",
  "lines": [
    {
      "itemCode": "ITEM-001",
      "orderQty": 10,
      "unitPrice": 25.5
    }
  ]
}
```

### Complete Request (Recommended Structure)

```json
{
  "customerId": 1,
  "createdBy": "admin",
  "orderDate": "2024-12-15T00:00:00.000Z",
  "requestDate": "2024-12-20T00:00:00.000Z",
  "needByDate": "2024-12-25T00:00:00.000Z",
  "headerDiscountPercent": 5.0,
  "billingAddressId": 1,
  "shippingAddressId": 2,
  "headerNote": "Please deliver before Christmas",
  "internalNote": "VIP customer - priority handling",
  "channel": "ONLINE",
  "fobCode": "FOB_ORIGIN",
  "shipViaCode": "UPS_GROUND",
  "paymentTermCode": "NET_30",
  "currencyCode": "USD",
  "customerPoNum": "PO-CUST-12345",
  "lines": [
    {
      "itemCode": "TS-COT-GRE-UNI-M",
      "description": "Classic T-Shirt - Green, Unisex, Medium",
      "orderQty": 100,
      "unitPrice": 25.99,
      "uomCode": "PCS",
      "pricing": {
        "discountPercent": 10,
        "discountAmount": 259.9,
        "taxPercent": 8.25,
        "taxAmount": 192.43
      },
      "needByDate": "2024-12-31T00:00:00.000Z",
      "warehouseCode": "WH-01",
      "lineNote": "Special packaging required"
    },
    {
      "itemCode": "TS-COT-BLU-UNI-L",
      "description": "Classic T-Shirt - Blue, Unisex, Large",
      "orderQty": 50,
      "unitPrice": 27.99,
      "uomCode": "PCS",
      "pricing": {
        "discountPercent": 5,
        "discountAmount": 69.98,
        "taxPercent": 8.25,
        "taxAmount": 107.44
      },
      "warehouseCode": "WH-01"
    }
  ]
}
```

---

## Response

### Success Response (201 Created)

```json
{
  "id": 1,
  "soNum": "SO2026000001",
  "customerId": 1,
  "orderDate": "2024-12-15T00:00:00.000Z",
  "requestDate": "2024-12-20T00:00:00.000Z",
  "needByDate": "2024-12-25T00:00:00.000Z",
  "orderStatus": "OPEN",
  "totalLineAmount": 3899.0,
  "headerDiscountAmount": 194.95,
  "headerDiscountPercent": 5.0,
  "totalDiscount": 524.83,
  "totalTax": 299.87,
  "totalCharges": 0,
  "orderTotal": 3674.04,
  "openAmount": 3674.04,
  "billingAddressId": 1,
  "shippingAddressId": 2,
  "channel": "ONLINE",
  "fobCode": "FOB_ORIGIN",
  "shipViaCode": "UPS_GROUND",
  "paymentTermCode": "NET_30",
  "currencyCode": "USD",
  "exchangeRate": 1.0,
  "customerPoNum": "PO-CUST-12345",
  "headerNote": "Please deliver before Christmas",
  "internalNote": "VIP customer - priority handling",
  "createdBy": "admin",
  "createdAt": "2024-12-15T10:30:00.000Z",
  "updatedAt": "2024-12-15T10:30:00.000Z",
  "lines": [
    {
      "id": 1,
      "lineNum": 1,
      "itemCode": "TS-COT-GRE-UNI-M",
      "description": "Classic T-Shirt - Green, Unisex, Medium",
      "orderQty": 100,
      "uomCode": "PCS",
      "unitPrice": 25.99,
      "lineDiscountPercent": 10,
      "lineDiscountAmount": 259.9,
      "lineTaxPercent": 8.25,
      "lineTaxAmount": 192.43,
      "lineTotal": 2531.53,
      "needByDate": "2024-12-31T00:00:00.000Z",
      "lineStatus": "OPEN",
      "openQty": 100,
      "shippedQty": 0,
      "warehouseCode": "WH-01",
      "lineNote": "Special packaging required",
      "createdAt": "2024-12-15T10:30:00.000Z",
      "updatedAt": "2024-12-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "lineNum": 2,
      "itemCode": "TS-COT-BLU-UNI-L",
      "description": "Classic T-Shirt - Blue, Unisex, Large",
      "orderQty": 50,
      "uomCode": "PCS",
      "unitPrice": 27.99,
      "lineDiscountPercent": 5,
      "lineDiscountAmount": 69.98,
      "lineTaxPercent": 8.25,
      "lineTaxAmount": 107.44,
      "lineTotal": 1367.47,
      "lineStatus": "OPEN",
      "openQty": 50,
      "shippedQty": 0,
      "warehouseCode": "WH-01",
      "createdAt": "2024-12-15T10:30:00.000Z",
      "updatedAt": "2024-12-15T10:30:00.000Z"
    }
  ]
}
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": ["customerId must not be less than 1"],
  "error": "Bad Request"
}
```

**Common validation errors:**
- `customerId must be a number conforming to the specified constraints` - Missing or invalid customerId
- `customerId must not be less than 1` - customerId must be ≥ 1
- `createdBy should not be empty` - Missing createdBy
- `orderDate must be a Date instance` - Invalid date format
- `requestDate must be a Date instance` - Invalid date format (must use ISO 8601)
- `orderQty must be a positive number` - orderQty must be > 0
- `unitPrice must be a positive number` - unitPrice must be > 0
- `itemCode should not be empty` - Missing itemCode in line

---

## Important Notes

### Date Format
- **MUST use ISO 8601 format**: `"2024-12-15T00:00:00.000Z"`
- Server sẽ tự động convert string sang Date object nhờ `@Type(() => Date)` decorator
- Không được dùng format khác như `"12/15/2024"` hoặc `"2024-12-15"`

### Auto-Generated Fields

Backend tự động generate/calculate các field sau:

1. **SO Number**: Format `SO{YEAR}{SEQUENCE}` (e.g., `SO2026000001`)
2. **Order Status**: Default `"OPEN"` khi tạo mới
3. **Exchange Rate**: Tự động fetch dựa trên `currencyCode` (hiện tại: 1.0 cho tất cả)
4. **Line Numbers**: Auto-increment từ 1 nếu không cung cấp
5. **Line Status**: Default `"OPEN"` khi tạo mới
6. **Open Quantity**: Mặc định = `orderQty`
7. **Shipped Quantity**: Mặc định = `0`

### Calculation Logic

**Header Level:**
- `totalLineAmount` = Sum of all line totals
- `headerDiscountAmount` = `totalLineAmount * headerDiscountPercent / 100`
- `totalDiscount` = `headerDiscountAmount + sum(lineDiscountAmount)`
- `totalTax` = Sum of all line tax amounts
- `orderTotal` = `totalLineAmount - totalDiscount + totalTax + totalCharges`
- `openAmount` = `orderTotal` (initially)

**Line Level:**
- `lineTotal` = `(orderQty * unitPrice) - discountAmount + taxAmount`

### Order Status Values
- `OPEN` - Order đang mở (default for new orders)
- `PARTIAL` - Order đã ship một phần
- `CLOSED` - Order đã hoàn thành
- `CANCELLED` - Order đã hủy
- `ON_HOLD` - Order đang tạm giữ

### Line Status Values
- `OPEN` - Line đang mở (default for new lines)
- `PARTIAL` - Line đã ship một phần
- `CLOSED` - Line đã hoàn thành
- `CANCELLED` - Line đã hủy
- `BACKORDERED` - Line đang chờ hàng

### Currency Codes
Hiện tại hỗ trợ:
- `USD` - US Dollar (rate: 1.0)
- `VND` - Vietnamese Dong (rate: 24000)
- `EUR` - Euro (rate: 0.85)
- `GBP` - British Pound (rate: 0.73)

**Note**: Exchange rates hiện đang hardcoded. Trong production, cần integrate với API như Open Exchange Rates hoặc Fixer.io.

---

## Testing with Postman/cURL

### cURL Example

```bash
curl -X POST http://localhost:3000/so \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "createdBy": "admin",
    "orderDate": "2024-12-15T00:00:00.000Z",
    "headerDiscountPercent": 5.0,
    "billingAddressId": 1,
    "shippingAddressId": 2,
    "channel": "ONLINE",
    "paymentTermCode": "NET_30",
    "currencyCode": "USD",
    "lines": [
      {
        "itemCode": "ITEM-001",
        "orderQty": 10,
        "unitPrice": 25.5,
        "pricing": {
          "discountPercent": 10,
          "taxPercent": 8.25
        }
      }
    ]
  }'
```

### Postman Example

1. Method: `POST`
2. URL: `http://localhost:3000/so`
3. Headers:
   - `Content-Type`: `application/json`
4. Body (raw JSON):
   ```json
   {
     "customerId": 1,
     "createdBy": "admin",
     "lines": [
       {
         "itemCode": "ITEM-001",
         "orderQty": 10,
         "unitPrice": 25.5
       }
     ]
   }
   ```

---

## Migration Guide (Old → New)

### ❌ **DO NOT SEND** These Fields Anymore

```diff
{
  "customerId": 1,
  "createdBy": "admin",
- "soNum": "SO-2024-001",              // ❌ Auto-generated
- "orderStatus": "OPEN",               // ❌ Default to OPEN
- "exchangeRate": 1.0,                 // ❌ Auto-fetched
- "headerDiscountAmount": 50.0,        // ❌ Calculated from percent
- "totalLineAmount": 1000.0,           // ❌ Sum from lines
- "totalDiscount": 50.0,               // ❌ Calculated
- "totalTax": 100.0,                   // ❌ Sum from lines
- "totalCharges": 25.0,                // ❌ Calculated
- "orderTotal": 1075.0,                // ❌ Calculated
- "openAmount": 1075.0,                // ❌ Equals orderTotal initially
+ "headerDiscountPercent": 5.0,        // ✅ SEND percent instead of amount
  "lines": [
    {
      "itemCode": "ITEM-001",
      "orderQty": 10,
      "unitPrice": 25.5,
-     "lineTotal": 255.0,              // ❌ Calculated
-     "lineStatus": "OPEN",            // ❌ Default to OPEN
-     "openQty": 10,                   // ❌ Default to orderQty
-     "shippedQty": 0                  // ❌ Default to 0
    }
  ]
}
```

### ✅ **Key Changes**

1. **Header discount**: Send `headerDiscountPercent` instead of `headerDiscountAmount`
2. **No calculated fields**: Backend tính toán tất cả totals, amounts, quantities
3. **Simpler structure**: Chỉ gửi user input, không gửi derived data
4. **Auto-generation**: `soNum`, `lineNum` tự động generate
5. **Default values**: `orderStatus`, `lineStatus`, `openQty`, `shippedQty` tự động set

---

## AI Agent Integration Tips

### For Frontend AI Agent:

1. **Validation trước khi gọi API:**
   - Check `customerId` phải là số dương (≥ 1)
   - Check `createdBy` không được empty
   - Check date format phải là ISO 8601
   - Check số lượng và giá phải > 0

2. **Simplified payload:**
   - Chỉ gửi user input fields
   - Không tính toán totals ở frontend
   - Không gửi status, openQty, shippedQty

3. **Default values:**
   - Nếu user không nhập `orderDate` → backend dùng ngày hiện tại
   - Nếu không có `currencyCode` → backend dùng `"USD"`
   - Backend tự động set `orderStatus = "OPEN"`, `lineStatus = "OPEN"`

4. **Error handling:**
   - Status 400 → Validation error, hiển thị message cho user
   - Status 201 → Success, hiển thị SO number và ID

5. **Best practices:**
   - Luôn gửi ít nhất 2 required fields: `customerId` và `createdBy`
   - Nên gửi `lines` để tạo order hoàn chỉnh
   - Sử dụng flat structure (không cần nested `addresses`, `metadata` objects)
   - Trust backend calculations - không verify lại totals ở frontend

---

## Architecture Notes

### Domain-Driven Design

Backend áp dụng DDD với các layer:

1. **Presentation Layer (DTO)**:
   - `CreateSOHeaderDto` - Chỉ chứa user input
   - Validation rules với class-validator

2. **Application Layer (Service)**:
   - `SOService.create()` - Orchestrate use case
   - Gọi domain services và repository

3. **Domain Layer**:
   - `SOHeader`, `SOLine` entities
   - `SOPricing`, `SOStatus` value objects
   - `SONumberGeneratorService` - Generate SO numbers
   - `ExchangeRateService` - Fetch exchange rates
   - Business logic và calculations

4. **Infrastructure Layer**:
   - `SOHeaderRepository` - Database persistence
   - Prisma ORM

### Security Benefits

- ✅ Frontend không thể gửi fake calculated values
- ✅ Single source of truth cho calculations
- ✅ Business rules enforced ở backend
- ✅ Consistent data integrity
