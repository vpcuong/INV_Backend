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
   */
  relations?: string[];

  /**
   * Maximum items per page
   */
  maxLimit?: number;
}