/**
 * Utility functions to transform database entities to API responses
 * Removes internal IDs and keeps only publicIds
 */

/**
 * Remove specified fields from an object
 */
function omit<T extends Record<string, any>>(
  obj: T,
  keys: string[],
): any {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

/**
 * Fields to exclude from Item response
 */
const ITEM_EXCLUDED_FIELDS = ['id'];

/**
 * Fields to exclude from ItemModel response
 */
const MODEL_EXCLUDED_FIELDS = ['id', 'itemId'];

/**
 * Fields to exclude from ItemSKU response
 */
const SKU_EXCLUDED_FIELDS = ['id', 'itemId', 'modelId'];

/**
 * Transform Item entity to API response
 * Removes internal ID and recursively transforms nested entities
 */
export function mapItemResponse(item: any): any {
  if (!item) return item;

  const mapped = omit(item, ITEM_EXCLUDED_FIELDS);

  // Transform nested models
  if (mapped.models && Array.isArray(mapped.models)) {
    mapped.models = mapped.models.map(mapModelResponse);
  }

  // Transform nested SKUs
  if (mapped.skus && Array.isArray(mapped.skus)) {
    mapped.skus = mapped.skus.map(mapSkuResponse);
  }

  return mapped;
}

/**
 * Transform ItemModel entity to API response
 */
export function mapModelResponse(model: any): any {
  if (!model) return model;

  const mapped = omit(model, MODEL_EXCLUDED_FIELDS);

  // Transform nested item reference if present
  if (mapped.item) {
    mapped.item = omit(mapped.item, ['id']);
  }

  // Transform nested SKUs
  if (mapped.skus && Array.isArray(mapped.skus)) {
    mapped.skus = mapped.skus.map(mapSkuResponse);
  }

  return mapped;
}

/**
 * Transform ItemSKU entity to API response
 */
export function mapSkuResponse(sku: any): any {
  if (!sku) return sku;

  const mapped = omit(sku, SKU_EXCLUDED_FIELDS);

  // Transform nested item reference if present
  if (mapped.item) {
    mapped.item = omit(mapped.item, ['id']);
  }

  // Transform nested model reference if present
  if (mapped.model) {
    mapped.model = omit(mapped.model, ['id', 'itemId']);
  }

  return mapped;
}

/**
 * Transform array of items
 */
export function mapItemsResponse(items: any[]): any[] {
  return items.map(mapItemResponse);
}

/**
 * Transform array of models
 */
export function mapModelsResponse(models: any[]): any[] {
  return models.map(mapModelResponse);
}

/**
 * Transform array of SKUs
 */
export function mapSkusResponse(skus: any[]): any[] {
  return skus.map(mapSkuResponse);
}