import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
} from "react-native";
import { Chip, Button } from "react-native-paper";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import {
  AttributeInterface,
  ProductFilterState,
  AttributeFilterState,
  PriceRangeFilter,
  BrandFilterState,
  FilterValue,
} from "@/interface";

/**
 * Helper to convert filter state to Strapi query format
 * Strapi uses its own query syntax, not MongoDB-style $elemMatch
 */
export const buildFilterQuery = (
  categoryId: string,
  filters: ProductFilterState
): Record<string, any> => {
  const query: Record<string, any> = {
    filters: {
      category: { documentId: { $eq: categoryId } },
    },
  };

  // Add price range filter
  if (filters.priceRange.min !== null || filters.priceRange.max !== null) {
    query.filters.price = {};
    if (filters.priceRange.min !== null) {
      query.filters.price.$gte = filters.priceRange.min;
    }
    if (filters.priceRange.max !== null) {
      query.filters.price.$lte = filters.priceRange.max;
    }
  }

  // Add brand filter
  if (filters.brands.selectedBrandIds.length > 0) {
    query.filters.brand = {
      documentId: { $in: filters.brands.selectedBrandIds },
    };
  }

  // Add attribute filters using Strapi's relation filtering syntax
  // For multiple attribute filters, we need to use $and at the top level
  // Strapi syntax: filters[$and][0][attributeValues][attribute][id][$eq]=X&filters[$and][0][attributeValues][value][$eq]=Y
  // This ensures each attribute filter is applied as a separate AND condition
  const activeAttributeFilters = Object.values(filters.attributes).filter(
    (attr) => attr.value !== null && attr.value !== "" && attr.value !== undefined
  );

  if (activeAttributeFilters.length > 0) {
    query.filters.$and = activeAttributeFilters.map((attr) => {
      const valueFilter =
        attr.fieldType === "number" ? { $eq: Number(attr.value) } : { $eq: String(attr.value) };

      return {
        attributeValues: {
          attribute: { id: { $eq: attr.attributeId } },
          value: valueFilter,
        },
      };
    });
  }

  // Add sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "price_asc":
        query.sort = ["price:asc"];
        break;
      case "price_desc":
        query.sort = ["price:desc"];
        break;
      case "name_asc":
        query.sort = ["name:asc"];
        break;
      case "name_desc":
        query.sort = ["name:desc"];
        break;
      case "newest":
        query.sort = ["createdAt:desc"];
        break;
    }
  }

  return query;
};

/**
 * Select Dropdown Component for filter options
 * Uses inline expansion instead of Modal to avoid conflicts with parent modal
 */
interface SelectDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}

function SelectDropdown({ options, value, onChange, placeholder, label }: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displayValue = value || placeholder;

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.filterLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownButton, value ? styles.dropdownButtonSelected : null]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[styles.dropdownButtonText, !value ? styles.dropdownPlaceholder : null]}>
          {displayValue}
        </Text>
        <Text style={styles.dropdownArrow}>{isOpen ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownOptions}>
          <TouchableOpacity
            style={[styles.dropdownOption, !value ? styles.dropdownOptionSelected : null]}
            onPress={() => {
              onChange("");
              setIsOpen(false);
            }}
          >
            <Text style={styles.dropdownOptionText}>Any</Text>
            {!value && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownOption,
                value === option ? styles.dropdownOptionSelected : null,
              ]}
              onPress={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  value === option ? styles.dropdownOptionTextSelected : null,
                ]}
              >
                {option}
              </Text>
              {value === option && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * Filter Field Component - renders appropriate input based on field type
 */
interface FilterFieldProps {
  attribute: AttributeInterface;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

function FilterField({ attribute, value, onChange }: FilterFieldProps) {
  const label = `${attribute.name}${attribute.unit ? ` (${attribute.unit})` : ""}`;

  switch (attribute.fieldType) {
    case "boolean":
      return (
        <View style={styles.booleanField}>
          <Text style={styles.filterLabel}>{label}</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {value === true ? "Yes" : value === false ? "No" : "Any"}
            </Text>
            <Switch
              value={value === true}
              onValueChange={(newValue) => onChange(newValue ? true : null)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={value === true ? "#007AFF" : "#f4f3f4"}
            />
          </View>
          {value !== null && (
            <TouchableOpacity onPress={() => onChange(null)}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      );

    case "select":
      return (
        <SelectDropdown
          options={attribute.options || []}
          value={value as string}
          onChange={onChange}
          placeholder={`Any ${attribute.name}`}
          label={label}
        />
      );

    case "number":
      return (
        <View style={styles.numberField}>
          <Text style={styles.filterLabel}>{label}</Text>
          <TextInput
            style={styles.numberInput}
            placeholder={`Enter ${attribute.name}`}
            value={value !== null ? String(value) : ""}
            onChangeText={(text) => onChange(text ? Number(text) : null)}
            keyboardType="decimal-pad"
          />
        </View>
      );

    case "string":
    case "text":
    default:
      return (
        <View style={styles.textField}>
          <Text style={styles.filterLabel}>{label}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={`Enter ${attribute.name}`}
            value={value as string}
            onChangeText={onChange}
          />
        </View>
      );
  }
}

/**
 * Price Range Input Component
 */
interface PriceRangeProps {
  value: PriceRangeFilter;
  onChange: (value: PriceRangeFilter) => void;
}

function PriceRangeInput({ value, onChange }: PriceRangeProps) {
  return (
    <View style={styles.priceRangeContainer}>
      <Text style={styles.sectionTitle}>Price Range</Text>
      <View style={styles.priceInputsRow}>
        <View style={styles.priceInputWrapper}>
          <Text style={styles.priceLabel}>Min</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="0"
            value={value.min !== null ? String(value.min) : ""}
            onChangeText={(text) => onChange({ ...value, min: text ? Number(text) : null })}
            keyboardType="decimal-pad"
          />
        </View>
        <Text style={styles.priceSeparator}>-</Text>
        <View style={styles.priceInputWrapper}>
          <Text style={styles.priceLabel}>Max</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="Any"
            value={value.max !== null ? String(value.max) : ""}
            onChangeText={(text) => onChange({ ...value, max: text ? Number(text) : null })}
            keyboardType="decimal-pad"
          />
        </View>
      </View>
    </View>
  );
}

/**
 * Brand Filter Component
 */
interface BrandFilterProps {
  brands: { documentId: string; name: string }[];
  selectedBrandIds: string[];
  onChange: (brandIds: string[]) => void;
}

function BrandFilter({ brands, selectedBrandIds, onChange }: BrandFilterProps) {
  const toggleBrand = (brandId: string) => {
    if (selectedBrandIds.includes(brandId)) {
      onChange(selectedBrandIds.filter((id) => id !== brandId));
    } else {
      onChange([...selectedBrandIds, brandId]);
    }
  };

  return (
    <View style={styles.brandFilterContainer}>
      <Text style={styles.sectionTitle}>Brands</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.brandChips}>
          {brands.map((brand) => (
            <Chip
              key={brand.documentId}
              selected={selectedBrandIds.includes(brand.documentId)}
              onPress={() => toggleBrand(brand.documentId)}
              style={[
                styles.brandChip,
                selectedBrandIds.includes(brand.documentId) && styles.brandChipSelected,
              ]}
              textStyle={
                selectedBrandIds.includes(brand.documentId)
                  ? styles.brandChipTextSelected
                  : styles.brandChipText
              }
            >
              {brand.name}
            </Chip>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Sort Options Component
 */
interface SortOptionsProps {
  value?: ProductFilterState["sortBy"];
  onChange: (sortBy: ProductFilterState["sortBy"]) => void;
}

function SortOptions({ value, onChange }: SortOptionsProps) {
  const sortOptions: { value: ProductFilterState["sortBy"]; label: string }[] = [
    { value: undefined, label: "Relevance" },
    { value: "newest", label: "Newest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A-Z" },
    { value: "name_desc", label: "Name: Z-A" },
  ];

  return (
    <View style={styles.sortContainer}>
      <Text style={styles.sectionTitle}>Sort By</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.sortChips}>
          {sortOptions.map((option) => (
            <Chip
              key={option.label}
              selected={value === option.value}
              onPress={() => onChange(option.value)}
              style={[styles.sortChip, value === option.value && styles.sortChipSelected]}
              textStyle={value === option.value ? styles.sortChipTextSelected : styles.sortChipText}
            >
              {option.label}
            </Chip>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Main ProductFilter Component Props
 */
export interface ProductFilterProps {
  categoryId: string;
  attributes: AttributeInterface[];
  availableBrands?: { documentId: string; name: string }[];
  onFilterChange: (filters: ProductFilterState) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
  initialFilters?: Partial<ProductFilterState>;
  activeFiltersCount?: number;
}

/**
 * ProductFilter Component
 * A dynamic filter component that renders filter controls based on category attributes
 */
export function ProductFilter({
  categoryId,
  attributes,
  availableBrands = [],
  onFilterChange,
  onApply,
  onClear,
  onClose,
  initialFilters,
}: ProductFilterProps) {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;

  // Initialize attribute filter states
  const createAttributeStates = useCallback(
    (attrs: AttributeInterface[], existingFilters?: Record<number, AttributeFilterState>) => {
      const states: Record<number, AttributeFilterState> = {};
      attrs.forEach((attr) => {
        if (attr.isFilterable !== false) {
          states[attr.id] = {
            attributeId: attr.id,
            attributeSlug: attr.slug,
            attributeName: attr.name,
            fieldType: attr.fieldType,
            value:
              existingFilters?.[attr.id]?.value ??
              initialFilters?.attributes?.[attr.id]?.value ??
              null,
            options: attr.options,
            unit: attr.unit,
          };
        }
      });
      return states;
    },
    [initialFilters]
  );

  const [attributeFilters, setAttributeFilters] = useState<Record<number, AttributeFilterState>>(
    () => createAttributeStates(attributes)
  );
  const [priceRange, setPriceRange] = useState<PriceRangeFilter>(
    initialFilters?.priceRange ?? { min: null, max: null }
  );
  const [brandFilter, setBrandFilter] = useState<BrandFilterState>(
    initialFilters?.brands ?? { selectedBrandIds: [] }
  );
  const [sortBy, setSortBy] = useState<ProductFilterState["sortBy"]>(initialFilters?.sortBy);

  // Update attribute filters when attributes prop changes
  useEffect(() => {
    setAttributeFilters((prev) => createAttributeStates(attributes, prev));
  }, [attributes, createAttributeStates]);

  // Handle attribute filter change
  const handleAttributeChange = useCallback(
    (attributeId: number, value: FilterValue) => {
      setAttributeFilters((prev) => {
        // If the attribute doesn't exist in prev, create it
        if (!prev[attributeId]) {
          const attr = attributes.find((a) => a.id === attributeId);
          if (!attr) return prev;
          return {
            ...prev,
            [attributeId]: {
              attributeId: attr.id,
              attributeSlug: attr.slug,
              attributeName: attr.name,
              fieldType: attr.fieldType,
              value,
              options: attr.options,
              unit: attr.unit,
            },
          };
        }
        return {
          ...prev,
          [attributeId]: {
            ...prev[attributeId],
            value,
          },
        };
      });
    },
    [attributes]
  );

  // Clear all filters
  const handleClearAll = useCallback(() => {
    setAttributeFilters((prev) => {
      const cleared = { ...prev };
      Object.keys(cleared).forEach((key) => {
        cleared[Number(key)] = {
          ...cleared[Number(key)],
          value: null,
        };
      });
      return cleared;
    });
    setPriceRange({ min: null, max: null });
    setBrandFilter({ selectedBrandIds: [] });
    setSortBy(undefined);
    onClear();
  }, [onClear]);

  // Apply filters
  const handleApply = useCallback(() => {
    const filterState: ProductFilterState = {
      categoryId,
      attributes: attributeFilters,
      priceRange,
      brands: brandFilter,
      sortBy,
    };
    onFilterChange(filterState);
    onApply();
  }, [categoryId, attributeFilters, priceRange, brandFilter, sortBy, onFilterChange, onApply]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(attributeFilters).forEach((attr) => {
      if (attr.value !== null && attr.value !== "" && attr.value !== undefined) {
        count++;
      }
    });
    if (priceRange.min !== null || priceRange.max !== null) count++;
    if (brandFilter.selectedBrandIds.length > 0) count++;
    return count;
  }, [attributeFilters, priceRange, brandFilter]);

  // Filterable attributes
  const filterableAttributes = useMemo(() => {
    return attributes.filter((attr) => attr.isFilterable !== false);
  }, [attributes]);

  return (
    <View style={styles.container}>
      {/* Header with Apply and Close buttons side by side */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Filters</Text>
        {activeFilterCount > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearAllButton}>
            <Text style={[styles.clearAllText, { color: primaryColor }]}>Clear All</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerButtons}>
          <Button
            mode="outlined"
            onPress={onClose}
            style={styles.closeButton}
            labelStyle={styles.closeButtonLabel}
          >
            Close
          </Button>
          <Button
            mode="contained"
            onPress={handleApply}
            style={[styles.applyButton, { backgroundColor: primaryColor }]}
            labelStyle={styles.applyButtonLabel}
          >
            Apply{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Button>
        </View>
      </View>

      {/* Scrollable filter content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {/* Sort Options */}
        <SortOptions value={sortBy} onChange={setSortBy} />

        {/* Price Range */}
        <PriceRangeInput value={priceRange} onChange={setPriceRange} />

        {/* Brand Filter */}
        {availableBrands.length > 0 && (
          <BrandFilter
            brands={availableBrands}
            selectedBrandIds={brandFilter.selectedBrandIds}
            onChange={(ids) => setBrandFilter({ selectedBrandIds: ids })}
          />
        )}

        {/* Dynamic Attribute Filters */}
        {filterableAttributes.length > 0 && (
          <View style={styles.attributesSection}>
            <Text style={styles.sectionTitle}>Product Attributes</Text>
            {filterableAttributes.map((attribute) => (
              <FilterField
                key={attribute.id}
                attribute={attribute}
                value={attributeFilters[attribute.id]?.value ?? null}
                onChange={(value) => handleAttributeChange(attribute.id, value)}
              />
            ))}
          </View>
        )}

        {/* Bottom spacer for scroll */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  clearAllButton: {
    marginLeft: 12,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  closeButton: {
    borderRadius: 8,
    borderColor: "#ddd",
    marginRight: 8,
  },
  closeButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  bottomSpacer: {
    height: 20,
  },
  // Dropdown styles (inline expansion)
  dropdownContainer: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  dropdownButtonSelected: {
    borderColor: "#007AFF",
  },
  dropdownButtonText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  dropdownPlaceholder: {
    color: "#999",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  dropdownOptions: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: "#fff",
    maxHeight: 200,
    overflow: "hidden",
  },
  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownOptionSelected: {
    backgroundColor: "#E8F5E9",
  },
  dropdownOptionText: {
    fontSize: 15,
    color: "#333",
  },
  dropdownOptionTextSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "bold",
  },
  // Filter field styles
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  booleanField: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  switchLabel: {
    fontSize: 15,
    color: "#333",
  },
  clearText: {
    fontSize: 12,
    color: "#007AFF",
    marginTop: 4,
  },
  numberField: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  textField: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  // Price range styles
  priceRangeContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  priceInputsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  priceSeparator: {
    fontSize: 18,
    color: "#666",
    marginHorizontal: 12,
    marginTop: 16,
  },
  // Brand filter styles
  brandFilterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  brandChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  brandChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
  brandChipSelected: {
    backgroundColor: "#007AFF",
  },
  brandChipText: {
    color: "#333",
  },
  brandChipTextSelected: {
    color: "#fff",
  },
  // Sort styles
  sortContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sortChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sortChip: {
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  sortChipSelected: {
    backgroundColor: "#007AFF",
  },
  sortChipText: {
    color: "#333",
  },
  sortChipTextSelected: {
    color: "#fff",
  },
  // Attributes section
  attributesSection: {
    paddingBottom: 16,
  },
  // Apply button in header
  applyButton: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  applyButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ProductFilter;
