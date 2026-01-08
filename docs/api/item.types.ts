/**
 * TypeScript Type Definitions for Item API
 * Copy this file to your frontend project
 */

// ==================== ENUMS ====================

export enum ItemStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

// ==================== REQUEST DTOs ====================

/**
 * Request body for creating a new Item
 * POST /items
 */
export interface CreateItemRequest {
  // Required fields
  code: string;           // Max 10 characters, unique
  categoryId: number;     // Foreign key to ItemCategory
  itemTypeId: number;     // Foreign key to ItemType

  // Optional fields
  materialId?: number | null;
  uomCode?: string | null;         // Foreign key to UOM
  purchasingPrice?: number | null; // Min 0
  sellingPrice?: number | null;    // Min 0
  lengthCm?: number | null;        // Min 0
  widthCm?: number | null;         // Min 0
  heightCm?: number | null;        // Min 0
  weightG?: number | null;         // Min 0
  desc?: string | null;            // Max 200 characters
  status?: ItemStatus;             // Default: 'active'
  isPurchasable?: boolean;         // Default: false
  isSellable?: boolean;            // Default: false
  isManufactured?: boolean;        // Default: false
}

/**
 * Request body for updating an existing Item
 * PATCH /items/:id
 */
export interface UpdateItemRequest extends Partial<CreateItemRequest> {
  // All fields from CreateItemRequest are optional
  // Code cannot be updated (unique identifier)
}

/**
 * Query parameters for filtering Items
 * GET /items
 */
export interface ItemFilterParams {
  page?: number;          // Default: 1
  limit?: number;         // Default: 10, Max: 100
  search?: string;        // Full-text search
  categoryId?: number;
  itemTypeId?: number;
  materialId?: number;
  status?: ItemStatus;
  isPurchasable?: boolean;
  isSellable?: boolean;
  isManufactured?: boolean;
  sort?: string;         // JSON string: [{"field":"createdAt","order":"desc"}]
  fields?: string;       // Comma-separated: "id,code,desc"
}

// ==================== RESPONSE DTOs ====================

/**
 * Item response object
 */
export interface ItemResponse {
  id: number;
  code: string;
  categoryId: number;
  itemTypeId: number;
  materialId: number | null;
  uomCode: string | null;
  purchasingPrice: number | null;
  sellingPrice: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  weightG: number | null;
  desc: string | null;
  status: ItemStatus;
  isPurchasable: boolean;
  isSellable: boolean;
  isManufactured: boolean;
  createdAt: string;  // ISO 8601 date string
  updatedAt: string;  // ISO 8601 date string
}

/**
 * Paginated list response
 */
export interface PaginatedItemsResponse {
  data: ItemResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ==================== MASTER DATA DTOs ====================

/**
 * Item Category
 */
export interface ItemCategory {
  id: number;
  code: string;       // Max 10 characters
  desc: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Item Type
 */
export interface ItemType {
  id: number;
  code: string;       // Max 10 characters
  desc: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Material
 */
export interface Material {
  id: number;
  code: string;       // Max 10 characters
  desc: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Unit of Measure
 */
export interface UOM {
  code: string;       // Primary key, Max 10 characters
  desc: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== FORM DATA ====================

/**
 * Form data type for React Hook Form / Formik
 * Use this for form state management
 */
export interface ItemFormData {
  code: string;
  categoryId: number | '';
  itemTypeId: number | '';
  materialId: number | '' | null;
  uomCode: string;
  purchasingPrice: string;  // Use string for input fields
  sellingPrice: string;     // Convert to number before submit
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  weightG: string;
  desc: string;
  status: ItemStatus;
  isPurchasable: boolean;
  isSellable: boolean;
  isManufactured: boolean;
}

// ==================== VALIDATION RULES ====================

/**
 * Validation constraints for Item fields
 * Use these for client-side validation
 */
export const ItemValidation = {
  code: {
    required: true,
    maxLength: 10,
    pattern: /^[A-Z0-9]+$/,
    message: {
      required: 'Item code is required',
      maxLength: 'Code must be 10 characters or less',
      pattern: 'Code must contain only uppercase letters and numbers',
    },
  },
  categoryId: {
    required: true,
    message: 'Category is required',
  },
  itemTypeId: {
    required: true,
    message: 'Item type is required',
  },
  desc: {
    maxLength: 200,
    message: 'Description must be 200 characters or less',
  },
  purchasingPrice: {
    min: 0,
    message: 'Purchasing price cannot be negative',
  },
  sellingPrice: {
    min: 0,
    message: 'Selling price cannot be negative',
  },
  lengthCm: {
    min: 0,
    message: 'Length cannot be negative',
  },
  widthCm: {
    min: 0,
    message: 'Width cannot be negative',
  },
  heightCm: {
    min: 0,
    message: 'Height cannot be negative',
  },
  weightG: {
    min: 0,
    message: 'Weight cannot be negative',
  },
} as const;

// ==================== ERROR RESPONSES ====================

/**
 * Standard error response from API
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  path?: string;
  timestamp?: string;
}

// ==================== UTILITY TYPES ====================

/**
 * Helper type to convert ItemFormData to CreateItemRequest
 */
export function formDataToRequest(formData: ItemFormData): CreateItemRequest {
  return {
    code: formData.code.toUpperCase(),
    categoryId: Number(formData.categoryId),
    itemTypeId: Number(formData.itemTypeId),
    materialId: formData.materialId ? Number(formData.materialId) : null,
    uomCode: formData.uomCode || null,
    purchasingPrice: formData.purchasingPrice ? parseFloat(formData.purchasingPrice) : null,
    sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice) : null,
    lengthCm: formData.lengthCm ? parseFloat(formData.lengthCm) : null,
    widthCm: formData.widthCm ? parseFloat(formData.widthCm) : null,
    heightCm: formData.heightCm ? parseFloat(formData.heightCm) : null,
    weightG: formData.weightG ? parseFloat(formData.weightG) : null,
    desc: formData.desc || null,
    status: formData.status,
    isPurchasable: formData.isPurchasable,
    isSellable: formData.isSellable,
    isManufactured: formData.isManufactured,
  };
}

/**
 * Helper type to convert ItemResponse to ItemFormData
 */
export function responseToFormData(response: ItemResponse): ItemFormData {
  return {
    code: response.code,
    categoryId: response.categoryId,
    itemTypeId: response.itemTypeId,
    materialId: response.materialId,
    uomCode: response.uomCode || '',
    purchasingPrice: response.purchasingPrice?.toString() || '',
    sellingPrice: response.sellingPrice?.toString() || '',
    lengthCm: response.lengthCm?.toString() || '',
    widthCm: response.widthCm?.toString() || '',
    heightCm: response.heightCm?.toString() || '',
    weightG: response.weightG?.toString() || '',
    desc: response.desc || '',
    status: response.status,
    isPurchasable: response.isPurchasable,
    isSellable: response.isSellable,
    isManufactured: response.isManufactured,
  };
}

// ==================== DEFAULT VALUES ====================

/**
 * Default values for create item form
 */
export const defaultItemFormData: ItemFormData = {
  code: '',
  categoryId: '',
  itemTypeId: '',
  materialId: null,
  uomCode: '',
  purchasingPrice: '',
  sellingPrice: '',
  lengthCm: '',
  widthCm: '',
  heightCm: '',
  weightG: '',
  desc: '',
  status: ItemStatus.ACTIVE,
  isPurchasable: false,
  isSellable: false,
  isManufactured: false,
};