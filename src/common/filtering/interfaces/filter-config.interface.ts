/**
 * Configuration for nested relation includes
 * Supports Prisma's full include syntax
 */
export type RelationConfig =
  | string // Flat relation: 'customer', 'lines'
  | {
      // Nested relation with Prisma include options
      [relationName: string]:
        | boolean
        | {
            include?: Record<string, any>;
            where?: any;
            orderBy?: any;
            select?: any;
            take?: number;
            skip?: number;
          };
    };

export interface FilterConfig {
  /**
   * Fields that can be searched (for search query)
   */
  searchableFields?: string[];

  /**
   * Fields that can be filtered
   */
  filterableFields?: string[];

  /**
   * Fields that can be sorted
   */
  sortableFields?: string[];

  /**
   * Default sort configuration
   */
  defaultSort?: Array<{ field: string; order: 'asc' | 'desc' }>;

  /**
   * Relations to include
   * Supports both flat strings and nested objects
   *
   * Examples:
   * - Flat: ['customer', 'lines']
   * - Nested: [{ lines: { include: { item: true }, orderBy: { lineNum: 'asc' } } }]
   * - Mixed: ['customer', { lines: { include: { item: true } } }]
   */
  relations?: RelationConfig[];

  /**
   * Maximum items per page
   */
  maxLimit?: number;
}
