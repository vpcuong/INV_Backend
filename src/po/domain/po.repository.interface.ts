import { POStatus, POLineStatus } from '@prisma/client';

export interface POHeaderData {
  id: number;
  poNum: string;
  supplierId: number;
  orderDate: Date;
  expectedDate: Date | null;
  status: POStatus;
  currencyCode: string;
  exchangeRate: any;
  totalAmount: any;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  lines: PODetailData[];
  supplier?: any;
}

export interface PODetailData {
  id: number;
  poId: number;
  lineNum: number;
  skuId: number;
  description: string | null;
  uomCode: string;
  orderQty: any;
  unitPrice: any;
  lineAmount: any;
  receivedQty: any;
  warehouseCode: string | null;
  status: POLineStatus;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  sku?: any;
  uom?: any;
}

export interface CreatePOData {
  poNum: string;
  supplierId: number;
  orderDate: Date;
  expectedDate?: Date;
  status: POStatus;
  currencyCode: string;
  exchangeRate: number;
  totalAmount: number;
  note?: string;
  createdBy: string;
  lines?: CreatePOLineData[];
}

export interface CreatePOLineData {
  lineNum: number;
  skuId: number;
  description?: string;
  uomCode: string;
  orderQty: number;
  unitPrice: number;
  lineAmount: number;
  receivedQty: number;
  warehouseCode?: string;
  status: POLineStatus;
  note?: string;
  createdBy: string;
}

export interface UpdatePOHeaderData {
  poNum?: string;
  supplierId?: number;
  orderDate?: Date;
  expectedDate?: Date;
  status?: POStatus;
  currencyCode?: string;
  exchangeRate?: number;
  totalAmount?: number;
  note?: string;
}

export interface UpdatePOLineData {
  lineNum?: number;
  skuId?: number;
  description?: string;
  uomCode?: string;
  orderQty?: number;
  unitPrice?: number;
  lineAmount?: number;
  receivedQty?: number;
  warehouseCode?: string;
  status?: POLineStatus;
  note?: string;
}

export interface CreateNewLineData {
  poId: number;
  lineNum: number;
  skuId: number;
  description?: string;
  uomCode: string;
  orderQty: number;
  unitPrice: number;
  lineAmount: number;
  receivedQty: number;
  warehouseCode?: string;
  status: POLineStatus;
  note?: string;
  createdBy?: string;
}

export interface FindAllParams {
  skip?: number;
  take?: number;
  supplierId?: number;
  status?: POStatus;
}

export interface IPORepository {
  create(data: CreatePOData): Promise<POHeaderData>;

  findAll(params: FindAllParams): Promise<POHeaderData[]>;

  findOne(id: number): Promise<POHeaderData | null>;

  update(id: number, data: UpdatePOHeaderData): Promise<POHeaderData>;

  updateWithLines(
    id: number,
    headerData: UpdatePOHeaderData | undefined,
    linesToUpdate: { id: number; data: UpdatePOLineData }[],
    linesToCreate: CreateNewLineData[],
    linesToDelete: number[],
  ): Promise<POHeaderData>;

  remove(id: number): Promise<void>;

  findLastPOByPrefix(prefix: string): Promise<string | null>;

  getMaxLineNum(poId: number): Promise<number>;

  updateLineReceivedQty(lineId: number, receivedQty: number, status: POLineStatus): Promise<void>;

  updatePOStatus(poId: number, status: POStatus): Promise<void>;

  findOneWithLines(id: number): Promise<POHeaderData | null>;
}
