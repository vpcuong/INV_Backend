export enum InvTransType {
  GOODS_RECEIPT = 'GOODS_RECEIPT',   // Nhập kho
  GOODS_ISSUE = 'GOODS_ISSUE',       // Xuất kho
  STOCK_TRANSFER = 'STOCK_TRANSFER', // Chuyển kho
  ADJUSTMENT = 'ADJUSTMENT',         // Điều chỉnh
}

export enum InvTransStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
