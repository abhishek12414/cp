import { AttributeInterface } from "./attribute";

/**
 * Filter value types for different attribute field types
 */
export type FilterValue = string | number | boolean | [number, number] | null;

/**
 * Filter state for a single attribute
 */
export interface AttributeFilterState {
  attributeId: number;
  attributeSlug: string;
  attributeName: string;
  fieldType: AttributeInterface["fieldType"];
  value: FilterValue;
  options?: string[] | null;
  unit?: string | null;
}

/**
 * Price range filter state
 */
export interface PriceRangeFilter {
  min: number | null;
  max: number | null;
}

/**
 * Brand filter state (multi-select)
 */
export interface BrandFilterState {
  selectedBrandIds: string[];
}

/**
 * Complete filter state for product filtering
 */
export interface ProductFilterState {
  categoryId: string;
  attributes: Record<number, AttributeFilterState>;
  priceRange: PriceRangeFilter;
  brands: BrandFilterState;
  sortBy?: "price_asc" | "price_desc" | "name_asc" | "name_desc" | "newest";
}

/**
 * Props for the ProductFilter component
 */
export interface ProductFilterProps {
  categoryId: string;
  attributes: AttributeInterface[];
  onFilterChange: (filters: ProductFilterState) => void;
  initialFilters?: Partial<ProductFilterState>;
  availableBrands?: { documentId: string; name: string }[];
}

/**
 * Props for individual filter field components
 */
export interface FilterFieldProps {
  label: string;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  fieldType: AttributeInterface["fieldType"];
  options?: string[] | null;
  unit?: string | null;
  placeholder?: string;
}

/**
 * Convert filter state to Strapi-compatible query filters
 */
export interface StrapiFilterQuery {
  filters: Record<string, any>;
  sort?: string;
}
