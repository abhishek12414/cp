import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, IconButton, Text, Chip, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import ProductCard from "@/components/ui/ProductCard";
import FilterModal from "@/components/ui/FilterModal";
import { buildFilterQuery } from "@/components/ui/ProductFilter";

import { Colors } from "@/constants/Colors";
import { useCategoryWithAttributes, useProducts, useBrand } from "@/hooks/queries";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ProductFilterState, AttributeInterface } from "@/interface";

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;

  const { data: category, isLoading: isLoadingCategory } =
    useCategoryWithAttributes(id || "");

  const { data: brands = [] } = useBrand();

  // Filter state
  const [filters, setFilters] = useState<ProductFilterState | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Build query based on filters
  const query = useMemo(() => {
    if (filters) {
      return buildFilterQuery(id || "", filters);
    }
    return {
      filters: {
        category: { documentId: { $eq: id } },
      },
    };
  }, [id, filters]);

  const { data: categoryProducts, isLoading: isLoadingProducts } =
    useProducts(query);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    if (!filters) return 0;
    let count = 0;
    Object.values(filters.attributes).forEach((attr) => {
      if (attr.value !== null && attr.value !== "" && attr.value !== undefined) {
        count++;
      }
    });
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) count++;
    if (filters.brands.selectedBrandIds.length > 0) count++;
    return count;
  }, [filters]);

  const handleGoBack = () => {
    router.back();
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
    // Implement add to cart logic
  };

  const handleAddToWishlist = (productId: string) => {
    console.log("Add to wishlist:", productId);
    // Implement add to wishlist logic
  };

  const handleOpenFilter = () => {
    setIsFilterVisible(true);
  };

  const handleCloseFilter = () => {
    setIsFilterVisible(false);
  };

  const handleApplyFilters = useCallback((newFilters: ProductFilterState) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = () => {
    setFilters(null);
  };

  // Get category attributes for filter
  const categoryAttributes: AttributeInterface[] = useMemo(() => {
    return category?.attributes || [];
  }, [category]);

  // Get available brands for filter
  const availableBrands = useMemo(() => {
    return brands.map((brand) => ({
      documentId: brand.documentId,
      name: brand.name,
    }));
  }, [brands]);

  if (isLoadingCategory) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color={primaryColor} />
        <Text>Loading category...</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={handleGoBack} />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            {category?.name}
          </Text>
          <IconButton
            icon="filter-variant"
            size={24}
            onPress={handleOpenFilter}
            containerColor={activeFilterCount > 0 ? primaryColor : undefined}
            iconColor={activeFilterCount > 0 ? "#fff" : undefined}
          />
        </View>

        {/* Active filters display */}
        {activeFilterCount > 0 && (
          <View style={styles.activeFiltersContainer}>
            <FlatList
              horizontal
              data={[
                ...(filters?.priceRange.min !== null || filters?.priceRange.max !== null
                  ? [{ id: "price", label: `Price: ${filters?.priceRange.min || 0} - ${filters?.priceRange.max || "∞"}` }]
                  : []),
                ...(filters?.brands.selectedBrandIds.map((brandId) => ({
                  id: `brand-${brandId}`,
                  label: brands.find((b) => b.documentId === brandId)?.name || brandId,
                })) || []),
                ...Object.values(filters?.attributes || {})
                  .filter((attr) => attr.value !== null && attr.value !== "")
                  .map((attr) => ({
                    id: `attr-${attr.attributeId}`,
                    label: `${attr.attributeName}: ${attr.value}`,
                  })),
              ]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Chip
                  mode="outlined"
                  onClose={() => {
                    // Handle removing individual filter
                    if (item.id === "price") {
                      setFilters((prev) =>
                        prev
                          ? { ...prev, priceRange: { min: null, max: null } }
                          : null
                      );
                    } else if (item.id.startsWith("brand-")) {
                      const brandId = item.id.replace("brand-", "");
                      setFilters((prev) =>
                        prev
                          ? {
                              ...prev,
                              brands: {
                                selectedBrandIds: prev.brands.selectedBrandIds.filter(
                                  (id) => id !== brandId
                                ),
                              },
                            }
                          : null
                      );
                    } else if (item.id.startsWith("attr-")) {
                      const attrId = Number(item.id.replace("attr-", ""));
                      setFilters((prev) =>
                        prev
                          ? {
                              ...prev,
                              attributes: {
                                ...prev.attributes,
                                [attrId]: {
                                  ...prev.attributes[attrId],
                                  value: null,
                                },
                              },
                            }
                          : null
                      );
                    }
                  }}
                  style={styles.activeFilterChip}
                  textStyle={styles.activeFilterChipText}
                >
                  {item.label}
                </Chip>
              )}
              contentContainerStyle={styles.activeFiltersList}
              showsHorizontalScrollIndicator={false}
            />
            <Button
              mode="text"
              compact
              onPress={handleClearFilters}
              textColor={primaryColor}
              style={styles.clearButton}
            >
              Clear
            </Button>
          </View>
        )}

        {isLoadingProducts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating={true} color={primaryColor} />
          </View>
        ) : (
          <FlatList
            data={categoryProducts}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={styles.productCardContainer}>
                <ProductCard
                  data={item}
                  onPress={handleProductPress}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              </View>
            )}
            keyExtractor={(item) => item.documentId}
            contentContainerStyle={styles.productsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text variant="titleMedium">No products found</Text>
                <Text variant="bodyMedium">
                  Try changing your search or filters
                </Text>
                {activeFilterCount > 0 && (
                  <Button
                    mode="outlined"
                    onPress={handleClearFilters}
                    style={styles.resetFilterButton}
                    textColor={primaryColor}
                  >
                    Reset Filters
                  </Button>
                )}
              </View>
            }
          />
        )}
      </SafeAreaView>

      {/* Filter Modal */}
      <FilterModal
        visible={isFilterVisible}
        onClose={handleCloseFilter}
        categoryId={id || ""}
        attributes={categoryAttributes}
        availableBrands={availableBrands}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters || undefined}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    fontWeight: "700",
  },
  activeFiltersContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  activeFiltersList: {
    paddingRight: 8,
  },
  activeFilterChip: {
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  activeFilterChipText: {
    fontSize: 12,
  },
  clearButton: {
    marginLeft: 4,
  },
  productsList: {
    padding: 8,
  },
  productCardContainer: {
    width: "50%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  resetFilterButton: {
    marginTop: 16,
    borderColor: "#007AFF",
  },
});
